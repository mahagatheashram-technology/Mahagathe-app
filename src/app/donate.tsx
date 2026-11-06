import { Redirect, useLocalSearchParams } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { View } from 'react-native';

import { AppText, Button, DetailHeader, Icon, Screen } from '@/components/ui';
import { useCreateDonation, useDonationOptions, useDonationResult, useSession, type DonationResult } from '@/data';
import { AmountPicker } from '@/features/sangha/AmountPicker';
import { DonationOutcome } from '@/features/sangha/DonationOutcome';
import { PurposeList } from '@/features/sangha/PurposeList';
import { formatRupees } from '@/features/sangha/format';
import { colors, fonts } from '@/theme/tokens';

const DEFAULT_PRESET = 1001;

/** DonateV3: purpose, amount, FCRA note, live summary, Pay with UPI → outcome. */
export default function DonateScreen() {
  const { status } = useSession();
  const { purpose } = useLocalSearchParams<{ purpose?: string }>();
  const options = useDonationOptions();
  const purposes = useMemo(() => options?.purposes ?? [], [options]);
  const presets = options?.presets ?? [];
  const createDonation = useCreateDonation();

  const [purposeId, setPurposeId] = useState(() =>
    purposes.some((p) => p.id === purpose) ? (purpose as string) : (purposes.find((p) => p.id === 'most-needed') ?? purposes[0])?.id ?? '',
  );
  const [preset, setPreset] = useState<number | null>(presets.includes(DEFAULT_PRESET) ? DEFAULT_PRESET : presets[0]);
  const [custom, setCustom] = useState('');
  const [paying, setPaying] = useState(false);
  // Synchronous guard: state updates are async, so two fast taps could both pass a state check.
  const inFlight = useRef(false);
  const [outcome, setOutcome] = useState<DonationResult | null>(null);

  const confirmed = useDonationResult(outcome?.id);
  const shownOutcome = confirmed ?? outcome;

  const amount = custom !== '' ? Number(custom) : (preset ?? 0);
  const invalid = custom !== '' && !(amount >= 1);
  const selectedPurposeId = purposes.some(p => p.id === purposeId) ? purposeId : (purposes.find(p => p.id === purpose) ?? purposes[0])?.id ?? '';
  const purposeName = useMemo(() => purposes.find((p) => p.id === selectedPurposeId)?.name ?? '', [purposes, selectedPurposeId]);

  // Donating needs an account (T-01). Guests go to Welcome.
  if (status === 'guest' || status === 'signedOut') return <Redirect href="/welcome" />;

  if (!options) return <Screen><DetailHeader /><AppText>Loading donation options…</AppText></Screen>;
  if (!purposes.length) return <Screen><DetailHeader /><AppText>Giving will be available here soon.</AppText></Screen>;

  const pay = async () => {
    if (inFlight.current || amount < 1) return;
    inFlight.current = true;
    setPaying(true);
    try {
      const r = await createDonation({ amount, purposeId: selectedPurposeId });
      setOutcome({ id: r.id, status: r.status, amount: r.amount, purposeName: r.purposeName || purposeName, receiptRef: r.receiptRef });
    } catch {
      setOutcome({ id: '', status: 'failed', amount, purposeName });
    } finally {
      inFlight.current = false;
      setPaying(false);
    }
  };

  // Summary + Pay stay pinned at the bottom (the mock pins them with a flex spacer).
  const footer = (
    <View style={{ paddingHorizontal: 20, paddingBottom: 16, paddingTop: 10 }}>
      <View style={{ gap: 10 }}>
        <AppText accessibilityLiveRegion="polite" style={{ textAlign: 'center', fontFamily: fonts.sansMedium, fontSize: 14, lineHeight: 21 }}>
          You are giving{' '}
          <AppText style={{ fontFamily: fonts.sansSemibold, fontSize: 14, lineHeight: 21 }}>{amount >= 1 ? formatRupees(amount) : '₹0'}</AppText> to{' '}
          <AppText style={{ fontFamily: fonts.sansSemibold, fontSize: 14, lineHeight: 21 }}>{purposeName}</AppText>
        </AppText>
        <Button label="Pay with UPI" onPress={pay} loading={paying} disabled={amount < 1} />
        <AppText variant="caption" style={{ textAlign: 'center' }}>
          You will see a receipt here after payment.
        </AppText>
      </View>
    </View>
  );

  return (
    <Screen
      contentStyle={{ paddingHorizontal: 20, paddingBottom: 22, gap: 22 }}
      footer={shownOutcome ? undefined : footer}>
      <DetailHeader />

      {shownOutcome ? (
        <DonationOutcome result={shownOutcome} onRetry={() => setOutcome(null)} onAgain={() => setOutcome(null)} />
      ) : (
        <>
          <View style={{ gap: 6 }}>
            <AppText accessibilityRole="header" style={{ fontFamily: fonts.serifSemibold, fontSize: 32, lineHeight: 41 }}>
              Give dāna
            </AppText>
            <AppText style={{ fontFamily: fonts.sansMedium, fontSize: 14, lineHeight: 22.4, color: colors.muted }}>
              To the Mahagathe Foundation Public Charitable Trust.
            </AppText>
          </View>

          <View style={{ gap: 10 }}>
            <AppText style={{ fontFamily: fonts.sansSemibold, fontSize: 14, lineHeight: 21 }}>Where should it go?</AppText>
            <PurposeList purposes={purposes} value={selectedPurposeId} onChange={setPurposeId} />
          </View>

          <View style={{ gap: 10 }}>
            <AppText style={{ fontFamily: fonts.sansSemibold, fontSize: 14, lineHeight: 21 }}>Amount</AppText>
            <AmountPicker
              presets={presets}
              preset={preset}
              custom={custom}
              invalid={invalid}
              onPreset={(n) => {
                setPreset(n);
                setCustom('');
              }}
              onCustom={setCustom}
            />
          </View>

          <View style={{ flexDirection: 'row', gap: 12, paddingVertical: 14, paddingHorizontal: 16, borderRadius: 16, backgroundColor: colors.sand }}>
            <View style={{ marginTop: 2 }}>
              <Icon name="info" size={20} color={colors.actionRed} />
            </View>
            <AppText style={{ flex: 1, fontFamily: fonts.sansMedium, fontSize: 13, lineHeight: 20.8 }}>
              Indian rupees only for now. The Trust can accept gifts from abroad once its FCRA registration is in place.
            </AppText>
          </View>
        </>
      )}
    </Screen>
  );
}
