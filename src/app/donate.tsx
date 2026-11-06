import { Redirect, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { AppText, Button, DetailHeader, Icon, Screen } from '@/components/ui';
import { useCreateDonation, useDonationOptions, useSession, type DonationResult } from '@/data';
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
  const { purposes, presets } = useDonationOptions();
  const createDonation = useCreateDonation();

  const [purposeId, setPurposeId] = useState(() =>
    purposes.some((p) => p.id === purpose) ? (purpose as string) : (purposes.find((p) => p.id === 'bhandara') ?? purposes[0]).id,
  );
  const [preset, setPreset] = useState<number | null>(presets.includes(DEFAULT_PRESET) ? DEFAULT_PRESET : presets[0]);
  const [custom, setCustom] = useState('');
  const [paying, setPaying] = useState(false);
  const [outcome, setOutcome] = useState<Pick<DonationResult, 'status' | 'amount' | 'purposeName' | 'receiptRef'> | null>(null);

  const amount = custom !== '' ? Number(custom) : (preset ?? 0);
  const invalid = custom !== '' && !(amount >= 1);
  const purposeName = useMemo(() => purposes.find((p) => p.id === purposeId)?.name ?? '', [purposes, purposeId]);

  // Donating needs an account (T-01). Guests go to Welcome.
  if (status === 'guest' || status === 'signedOut') return <Redirect href="/welcome" />;

  const pay = async () => {
    if (paying || amount < 1) return;
    setPaying(true);
    try {
      const r = await createDonation({ amount, purposeId });
      setOutcome({ status: r.status, amount: r.amount, purposeName: r.purposeName || purposeName, receiptRef: r.receiptRef });
    } catch {
      setOutcome({ status: 'failed', amount, purposeName });
    } finally {
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
      footer={outcome ? undefined : footer}>
      <DetailHeader />

      {outcome ? (
        <DonationOutcome result={outcome} onRetry={() => setOutcome(null)} onAgain={() => setOutcome(null)} />
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
            <PurposeList purposes={purposes} value={purposeId} onChange={setPurposeId} />
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
