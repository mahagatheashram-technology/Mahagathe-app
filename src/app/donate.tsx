import { Redirect, useLocalSearchParams } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';

import { AppText, Button, BottomSheet, DetailHeader, Icon, ListRow, Screen } from '@/components/ui';
import {
  useCreateDonation,
  useDonationOptions,
  useDonationResult,
  useSession,
  type DonationResult,
} from '@/data';
import { AmountPicker } from '@/features/sangha/AmountPicker';
import { DonationOutcome } from '@/features/sangha/DonationOutcome';
import { PurposeList } from '@/features/sangha/PurposeList';
import { formatRupees } from '@/features/sangha/format';
import { colors, fonts } from '@/theme/tokens';

/** v12 giving: a compact purpose picker, explicit amount selection, and the existing payment outcome. */
export default function DonateScreen() {
  const { status } = useSession();
  const { purpose } = useLocalSearchParams<{ purpose?: string }>();
  const options = useDonationOptions();
  const purposes = useMemo(() => options?.purposes ?? [], [options]);
  const presets = options?.presets ?? [];
  const createDonation = useCreateDonation();

  const [purposeId, setPurposeId] = useState(() =>
    purposes.some((p) => p.id === purpose)
      ? (purpose as string)
      : ((purposes.find((p) => p.id === 'most-needed') ?? purposes[0])?.id ?? ''),
  );
  const [preset, setPreset] = useState<number | null>(null);
  const [custom, setCustom] = useState('');
  const [sheet, setSheet] = useState<'purpose' | 'abroad' | null>(null);
  const [paying, setPaying] = useState(false);
  // Synchronous guard: state updates are async, so two fast taps could both pass a state check.
  const inFlight = useRef(false);
  const [outcome, setOutcome] = useState<DonationResult | null>(null);

  const confirmed = useDonationResult(outcome?.id);
  const shownOutcome = confirmed ?? outcome;

  const amount = custom !== '' ? Number(custom) : (preset ?? 0);
  const invalid = custom !== '' && !(amount >= 1);
  const selectedPurposeId = purposes.some((p) => p.id === purposeId)
    ? purposeId
    : ((purposes.find((p) => p.id === purpose) ?? purposes[0])?.id ?? '');
  const purposeName = useMemo(
    () => purposes.find((p) => p.id === selectedPurposeId)?.name ?? '',
    [purposes, selectedPurposeId],
  );

  // Donating needs an account (T-01). Guests go to Welcome.
  if (status === 'guest' || status === 'signedOut') return <Redirect href="/welcome" />;

  if (!options)
    return (
      <Screen>
        <DetailHeader backLabel="Sangha" backHref="/(tabs)/sangha" />
        <AppText>Loading donation options…</AppText>
      </Screen>
    );
  if (!purposes.length)
    return (
      <Screen>
        <DetailHeader backLabel="Sangha" backHref="/(tabs)/sangha" />
        <AppText>Giving will be available here soon.</AppText>
      </Screen>
    );

  const pay = async () => {
    if (inFlight.current || amount < 1) return;
    inFlight.current = true;
    setPaying(true);
    try {
      const r = await createDonation({ amount, purposeId: selectedPurposeId });
      setOutcome({
        id: r.id,
        status: r.status,
        amount: r.amount,
        purposeName: r.purposeName || purposeName,
        receiptRef: r.receiptRef,
      });
    } catch {
      setOutcome({ id: '', status: 'failed', amount, purposeName });
    } finally {
      inFlight.current = false;
      setPaying(false);
    }
  };

  return (
    <Screen contentStyle={{ paddingTop: 4, paddingHorizontal: 24, paddingBottom: 36 }}>
      <DetailHeader backLabel="Sangha" backHref="/(tabs)/sangha" />
      {shownOutcome ? (
        <DonationOutcome
          result={shownOutcome}
          onRetry={() => setOutcome(null)}
          onAgain={() => setOutcome(null)}
        />
      ) : (
        <View style={{ paddingTop: 18, gap: 22 }}>
          <View style={{ gap: 6 }}>
            <AppText
              accessibilityRole="header"
              style={{ fontFamily: fonts.serifSemibold, fontSize: 30, lineHeight: 39 }}>
              Give dāna
            </AppText>
            <AppText style={{ fontSize: 15, lineHeight: 23, color: colors.textSecondary }}>
              To the Mahagathe Foundation Trust.
            </AppText>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`For: ${purposeName}. Change purpose`}
            onPress={() => setSheet('purpose')}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              paddingVertical: 14,
              paddingHorizontal: 16,
              borderRadius: 16,
              backgroundColor: colors.iconSand,
            }}>
            <View style={{ flex: 1, gap: 1 }}>
              <AppText style={{ fontSize: 13, lineHeight: 20, color: colors.textSecondary }}>For</AppText>
              <AppText style={{ fontFamily: fonts.sansSemibold, fontSize: 16, lineHeight: 24 }}>
                {purposeName}
              </AppText>
            </View>
            <AppText style={{ fontFamily: fonts.sansSemibold, fontSize: 15 }}>Change</AppText>
          </Pressable>
          <View style={{ gap: 12 }}>
            <AppText style={{ fontFamily: fonts.sansSemibold, fontSize: 16, lineHeight: 24 }}>
              How much would you like to give?
            </AppText>
            <AmountPicker
              presets={presets}
              preset={preset}
              custom={custom}
              invalid={invalid}
              onPreset={(n) => {
                setPreset(n);
                setCustom('');
              }}
              onCustom={(digits) => {
                setPreset(null);
                setCustom(digits);
              }}
            />
          </View>
          <ListRow
            icon="globe"
            title="Giving from outside India?"
            subtitle="How to give from abroad"
            last
            onPress={() => setSheet('abroad')}
          />
          <View style={{ gap: 8 }}>
            {amount >= 1 ? (
              <Button label={`Give ${formatRupees(amount)} with UPI`} onPress={pay} loading={paying} />
            ) : (
              <Pressable
                disabled
                accessibilityRole="button"
                accessibilityLabel="Choose an amount to continue"
                accessibilityState={{ disabled: true }}
                style={{
                  height: 54,
                  borderRadius: 999,
                  backgroundColor: colors.disabled,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <AppText
                  style={{
                    fontFamily: fonts.sansSemibold,
                    fontSize: 16,
                    lineHeight: 24,
                    color: colors.disabledText,
                  }}>
                  Choose an amount to continue
                </AppText>
              </Pressable>
            )}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Icon name="shieldCheck" size={14} color={colors.label} />
              <AppText style={{ fontSize: 13, lineHeight: 20, color: colors.textSecondary }}>
                Secure UPI payment · receipt by SMS
              </AppText>
            </View>
          </View>
        </View>
      )}
      <BottomSheet
        visible={sheet !== null}
        onClose={() => setSheet(null)}
        title={sheet === 'purpose' ? 'Where should it go?' : 'Giving from outside India?'}>
        {sheet === 'purpose' ? (
          <PurposeList
            purposes={purposes}
            value={selectedPurposeId}
            onChange={(id) => {
              setPurposeId(id);
              setSheet(null);
            }}
          />
        ) : (
          <AppText style={{ fontSize: 16, lineHeight: 26 }}>
            Indian rupees only for now. The Trust can accept gifts from abroad once its FCRA registration is
            in place.
          </AppText>
        )}
      </BottomSheet>
    </Screen>
  );
}
