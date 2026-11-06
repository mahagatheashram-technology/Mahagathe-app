import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, Button, Icon } from '@/components/ui';
import { useReportContent } from '@/data';
import { colors, fonts, radii } from '@/theme/tokens';

const REASONS = [
  'The source is wrong',
  'The words are not what was said',
  'The meaning in simple words is wrong',
  'Something else',
];

/** W-05: "Report a wrong source or text" bottom sheet. Sends the reason, then confirms. */
export function ReportSheet({ contentId, visible, onClose }: { contentId: string; visible: boolean; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const report = useReportContent();
  const [reason, setReason] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    onClose();
    // reset after the sheet has gone
    setTimeout(() => {
      setReason(null);
      setSent(false);
      setError(null);
    }, 250);
  };

  const submit = async () => {
    if (!reason) {
      setError('Please choose what looks wrong.');
      return;
    }
    setSending(true);
    setError(null);
    try {
      await report({ contentId, reason });
      setSent(true);
    } catch {
      setError('We could not send your report. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close} statusBarTranslucent>
      <View style={styles.root}>
        <Pressable accessibilityLabel="Close" accessibilityRole="button" style={StyleSheet.absoluteFill} onPress={close} />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]} accessibilityViewIsModal>
          <View style={styles.handle} />
          {sent ? (
            <View style={{ gap: 16, alignItems: 'center', paddingVertical: 8 }}>
              <View style={styles.sentBadge}>
                <Icon name="check" size={26} color={colors.actionRed} strokeWidth={2.4} />
              </View>
              <AppText accessibilityRole="header" style={styles.title}>
                Thank you
              </AppText>
              <AppText style={{ fontSize: 14, lineHeight: 22.4, color: colors.muted, textAlign: 'center' }}>
                We have sent this to the content authority. If something is wrong, it will be corrected or removed.
              </AppText>
              <Button label="Done" onPress={close} style={{ alignSelf: 'stretch' }} />
            </View>
          ) : (
            <View style={{ gap: 16 }}>
              <View style={{ gap: 6 }}>
                <AppText accessibilityRole="header" style={styles.title}>
                  Report a wrong source or text
                </AppText>
                <AppText style={{ fontSize: 14, lineHeight: 22.4, color: colors.muted }}>
                  What looks wrong? The content authority reviews every report.
                </AppText>
              </View>
              <View accessibilityRole="radiogroup" style={{ gap: 8 }}>
                {REASONS.map((r) => {
                  const selected = reason === r;
                  return (
                    <Pressable
                      key={r}
                      accessibilityRole="radio"
                      accessibilityState={{ selected, checked: selected }}
                      onPress={() => {
                        setReason(r);
                        setError(null);
                      }}
                      style={[
                        styles.reason,
                        { borderColor: selected ? colors.actionRed : colors.border, borderWidth: selected ? 1.5 : 1 },
                      ]}>
                      <View style={[styles.radio, selected && { borderColor: colors.actionRed }]}>
                        {selected ? <View style={styles.radioDot} /> : null}
                      </View>
                      <AppText style={{ flex: 1, fontFamily: selected ? fonts.sansSemibold : fonts.sansMedium, fontSize: 14, lineHeight: 21 }}>
                        {r}
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>
              {error ? (
                <AppText accessibilityLiveRegion="polite" style={{ fontFamily: fonts.sansMedium, fontSize: 12, lineHeight: 18 }} color={colors.actionRed}>
                  {error}
                </AppText>
              ) : null}
              <Button label="Send report" loading={sending} onPress={submit} />
              <Pressable
                accessibilityRole="button"
                onPress={close}
                style={{ alignSelf: 'center', minHeight: 44, paddingHorizontal: 12, justifyContent: 'center', marginTop: -8 }}>
                <AppText style={{ fontFamily: fonts.sansMedium, fontSize: 13, lineHeight: 20, color: colors.muted }}>Cancel</AppText>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end', backgroundColor: colors.scrim },
  sheet: {
    backgroundColor: colors.cream,
    borderTopLeftRadius: radii.sheet,
    borderTopRightRadius: radii.sheet,
    paddingHorizontal: 24,
    paddingTop: 12,
    gap: 20,
  },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border },
  title: { fontFamily: fonts.serifSemibold, fontSize: 21, lineHeight: 28, color: colors.ink },
  reason: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radii.lg,
    backgroundColor: colors.white,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.actionRed },
  sentBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.sand,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
