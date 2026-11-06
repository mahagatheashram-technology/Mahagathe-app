/**
 * Practice playback behind one small interface.
 *
 * - With an `audioUrl` the real engine (expo-audio) plays it.
 * - Without one (approved audio not supplied yet, PRD D-21) a silent timer stands in, so the whole
 *   sitting flow (scrubber, ±15 s, completion, marking the day) is exercised in mock mode.
 *
 * Nothing ever autostarts (S-07): playback begins only when `play()`/`toggle()` is called.
 */
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useCallback, useEffect, useRef, useState } from 'react';

export type PracticePlayer = {
  positionSec: number;
  durationSec: number;
  playing: boolean;
  /** True once the end has been reached (until the user seeks back or restarts). */
  finished: boolean;
  /** 'audio' when a real file is playing, 'timer' for the silent stand-in. */
  engine: 'audio' | 'timer';
  play: () => void;
  pause: () => void;
  toggle: () => void;
  seekTo: (sec: number) => void;
  skip: (deltaSec: number) => void;
};

type Engine = Omit<PracticePlayer, 'engine' | 'finished' | 'toggle' | 'skip'>;

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

function useTimerEngine(enabled: boolean, durationSec: number): Engine {
  const [positionSec, setPosition] = useState(0);
  const [playing, setPlaying] = useState(false);
  const posRef = useRef(0);

  useEffect(() => {
    if (!enabled || !playing) return;
    let last = Date.now();
    const id = setInterval(() => {
      const now = Date.now();
      posRef.current = Math.min(durationSec, posRef.current + (now - last) / 1000);
      last = now;
      setPosition(posRef.current);
      if (posRef.current >= durationSec) setPlaying(false);
    }, 250);
    return () => clearInterval(id);
  }, [enabled, playing, durationSec]);

  const seekTo = useCallback(
    (sec: number) => {
      posRef.current = clamp(sec, 0, durationSec);
      setPosition(posRef.current);
    },
    [durationSec],
  );
  const play = useCallback(() => {
    if (!enabled || durationSec <= 0) return;
    if (posRef.current >= durationSec) seekTo(0);
    setPlaying(true);
  }, [enabled, durationSec, seekTo]);
  const pause = useCallback(() => setPlaying(false), []);

  return { positionSec, durationSec, playing, play, pause, seekTo };
}

function useAudioEngine(url: string | undefined): Engine {
  const player = useAudioPlayer(url ?? null, { updateInterval: 250 });
  const status = useAudioPlayerStatus(player);

  useEffect(() => {
    if (!url) return;
    // A meditation must be audible with the iOS silent switch on; never mix into other apps' audio.
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
  }, [url]);

  const durationSec = status.duration || 0;
  const play = useCallback(() => {
    if (!url) return;
    if (durationSec > 0 && player.currentTime >= durationSec - 0.25) {
      player.seekTo(0).catch(() => {});
    }
    player.play();
  }, [url, player, durationSec]);
  const pause = useCallback(() => player.pause(), [player]);
  const seekTo = useCallback(
    (sec: number) => {
      player.seekTo(clamp(sec, 0, durationSec || sec)).catch(() => {});
    },
    [player, durationSec],
  );

  return { positionSec: status.currentTime, durationSec, playing: status.playing, play, pause, seekTo };
}

export function usePracticePlayer({
  durationSec,
  audioUrl,
}: {
  /** Catalogue duration, used by the timer engine and until audio reports its own. */
  durationSec: number;
  audioUrl?: string;
}): PracticePlayer {
  const useReal = !!audioUrl;
  const timer = useTimerEngine(!useReal, durationSec);
  const audio = useAudioEngine(audioUrl);
  const e = useReal ? audio : timer;
  const total = e.durationSec || durationSec;
  const finished = total > 0 && e.positionSec >= total - 0.25 && !e.playing;

  const { play, pause, seekTo, playing, positionSec } = e;
  const toggle = useCallback(() => (playing ? pause() : play()), [playing, play, pause]);
  const skip = useCallback((delta: number) => seekTo(positionSec + delta), [seekTo, positionSec]);

  return {
    positionSec,
    durationSec: total,
    playing,
    finished,
    engine: useReal ? 'audio' : 'timer',
    play,
    pause,
    toggle,
    seekTo,
    skip,
  };
}
