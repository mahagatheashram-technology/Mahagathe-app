import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { Image, Pressable, View } from 'react-native';

import { AppText, BackPill, BottomSheet, PrimaryButton, Screen, TextLink } from '@/components/ui';
import {
  photos,
  useCreateDonation,
  useDonationOptions,
  useDonationResult,
  useSession,
  type DonationResult,
  type PhotoKey,
} from '@/data';
import { AmountPicker } from '@/features/sangha/AmountPicker';
import { DonationOutcome } from '@/features/sangha/DonationOutcome';
import { PurposeList } from '@/features/sangha/PurposeList';
import { formatRupees } from '@/features/sangha/format';
import { colors, fonts } from '@/theme/tokens';

const lowerFirst = (t: string) => t.charAt(0).toLowerCase() + t.slice(1);

/** One line on what the gift does. Only the Bhaṇḍāra ₹501 line is drawn; the rest is a review placeholder (C-7). */
function impactLine(purposeId: string, amount: number) {
  if (amount < 1) return null;
  if (purposeId === 'bhandara' && amount === 501) return '₹501 feeds about twenty people at the Sunday bhaṇḍāra. [figure to confirm]';
  return `[What ${formatRupees(amount)} does, to confirm]`;
}

/** v14 giving (the village): where it goes, how much, Give with UPI, and the existing payment outcome. */
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
  // Starts on the second preset (₹501, as drawn); the person can change it or choose Other.
  const [pickedPreset, setPreset] = useState<number | null | undefined>(undefined);
  const preset = pickedPreset === undefined ? (presets[1] ?? null) : pickedPreset;
  const router = useRouter();
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

  const goBack = () => router.dismissTo('/(tabs)/sangha');
  const bodyText = { fontFamily: fonts.ui, fontSize: 16, lineHeight: 24.8, color: colors.v14Ink } as const;

  // Donating needs an account (T-01). Guests go to Welcome.
  if (status === 'guest' || status === 'signedOut') return <Redirect href="/welcome" />;

  if (!options)
    return (
      <Screen background={colors.limewash} contentStyle={{ paddingHorizontal: 16, paddingTop: 2, gap: 16 }}>
        <BackPill destination="Sangha" onPress={goBack} />
        <AppText style={bodyText}>Loading donation options…</AppText>
      </Screen>
    );
  if (!purposes.length)
    return (
      <Screen background={colors.limewash} contentStyle={{ paddingHorizontal: 16, paddingTop: 2, gap: 16 }}>
        <BackPill destination="Sangha" onPress={goBack} />
        <AppText style={bodyText}>Giving will be available here soon.</AppText>
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

  const impact = impactLine(selectedPurposeId, amount);
  const photoKey = (selectedPurposeId in photos ? selectedPurposeId : 'abhyudaya') as PhotoKey;
  const purposeTagline = purposes.find((p) => p.id === selectedPurposeId)?.tagline ?? '';
  const purposeTitle = selectedPurposeId === 'most-needed' ? purposeName : `${purposeName}, ${lowerFirst(purposeTagline)}`;

  return (
    <Screen background={colors.limewash} contentStyle={{ paddingTop: 2, paddingBottom: 36 }}>
      <View style={{ paddingHorizontal: 16 }}>
        <BackPill destination="Sangha" onPress={goBack} />
      </View>
      {shownOutcome ? (
        <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 16 }}>
          <DonationOutcome
            result={shownOutcome}
            onRetry={() => setOutcome(null)}
            onAgain={() => setOutcome(null)}
          />
        </View>
      ) : (
        <>
          <View style={{ paddingTop: 16, paddingHorizontal: 24 }}>
            <AppText
              accessibilityRole="header"
              style={{ fontFamily: fonts.displaySemibold, fontSize: 33, lineHeight: 51, color: colors.v14Ink }}>
              Give dāna
            </AppText>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Your gift goes to ${purposeTitle}. Change`}
            onPress={() => setSheet('purpose')}
            style={{
              marginTop: 16,
              marginHorizontal: 16,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 14,
              padding: 12,
              borderRadius: 16,
              backgroundColor: colors.lateriteSoft,
            }}>
            <Image
              source={photos[photoKey]}
              accessibilityIgnoresInvertColors
              style={{ width: 64, height: 64, borderRadius: 12 }}
              resizeMode="cover"
            />
            <View style={{ flex: 1 }}>
              <AppText style={{ fontFamily: fonts.ui, fontSize: 14, lineHeight: 21.7, color: colors.text2 }}>Your gift goes to</AppText>
              <AppText style={{ fontFamily: fonts.displaySemibold, fontSize: 19, lineHeight: 29.45, color: colors.v14Ink }}>{purposeTitle}</AppText>
            </View>
            <AppText
              style={{
                fontFamily: fonts.uiSemibold,
                fontSize: 15,
                lineHeight: 23.25,
                marginRight: 6,
                color: colors.laterite,
                textDecorationLine: 'underline',
              }}>
              Change
            </AppText>
          </Pressable>
          <View style={{ paddingTop: 28, paddingHorizontal: 24 }}>
            <AppText
              accessibilityRole="header"
              style={{ fontFamily: fonts.displaySemibold, fontSize: 21, lineHeight: 32.55, marginBottom: 14, color: colors.v14Ink }}>
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
            {impact ? (
              <AppText accessibilityLiveRegion="polite" style={{ fontFamily: fonts.ui, fontSize: 15, lineHeight: 23.25, marginTop: 14, color: colors.text2 }}>
                {impact}
              </AppText>
            ) : null}
          </View>
          <View style={{ flex: 1, minHeight: 28 }} />
          <View style={{ paddingHorizontal: 16 }}>
            <PrimaryButton
              label={amount >= 1 ? `Give ${formatRupees(amount)} with UPI` : 'Choose an amount to continue'}
              disabled={amount < 1}
              loading={paying}
              onPress={pay}
            />
            <AppText style={{ fontFamily: fonts.ui, fontSize: 14, lineHeight: 21.7, marginTop: 12, textAlign: 'center', color: colors.text2 }}>
              Paid securely through your UPI app. Receipt by SMS.
            </AppText>
            <TextLink
              label="Giving from outside India"
              color={colors.v14Ink}
              onPress={() => setSheet('abroad')}
              style={{ alignSelf: 'center', marginTop: 4 }}
            />
          </View>
        </>
      )}
      <BottomSheet
        visible={sheet !== null}
        onClose={() => setSheet(null)}
        title={sheet === 'purpose' ? 'Where should it go?' : 'Giving from outside India'}>
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
          <AppText style={{ fontFamily: fonts.ui, fontSize: 16, lineHeight: 26, color: colors.v14Ink }}>
            Indian rupees only for now. The Trust can accept gifts from abroad once its FCRA registration is
            in place.
          </AppText>
        )}
      </BottomSheet>
    </Screen>
  );
}
