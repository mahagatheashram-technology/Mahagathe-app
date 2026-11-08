import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { AppText, Icon, OutlineButton, PrimaryButton, type IconName } from '@/components/ui';
import { useOpenWhatsApp, type DonationResult } from '@/data';
import { formatRupees } from './format';
import { colors, fonts } from '@/theme/tokens';

/** Result of "Give with UPI": success with receipt reference, pending, or failure with a safe retry (G-07). */
export function DonationOutcome({
  result,
  onRetry,
  onAgain,
}: {
  result: Pick<DonationResult, 'status' | 'amount' | 'purposeName' | 'receiptRef'>;
  onRetry: () => void;
  onAgain: () => void;
}) {
  const router = useRouter();
  const copy = {
    success: {
      icon: 'check' as IconName,
      title: 'Thank you',
      body: `Your dāna of ${formatRupees(result.amount)} to ${result.purposeName} has been received.`,
    },
    pending: {
      icon: 'clock' as IconName,
      title: 'Confirmation pending',
      body: 'Your dāna request is pending. A receipt will appear here once payment is confirmed. Please do not submit it again while you wait.',
    },
    failed: {
      icon: 'info' as IconName,
      title: 'Payment did not go through',
      body: 'We could not confirm this payment. If your bank shows a deduction, please contact us before trying again.',
    },
  }[result.status];

  const contactOnWhatsApp = useOpenWhatsApp();
  const stretch = { alignSelf: 'stretch', minHeight: 54 } as const;
  return (
    <View style={{ flex: 1, gap: 22 }} accessibilityLiveRegion="polite">
      <View style={{ alignItems: 'center', gap: 14, paddingTop: 24 }}>
        <View
          style={{
            width: 72,
            height: 72,
            borderRadius: 36,
            backgroundColor: colors.lateriteSoft,
            borderWidth: result.status === 'success' ? 2 : 1,
            borderColor: result.status === 'success' ? colors.laterite : colors.line,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Icon name={copy.icon} size={32} color={colors.laterite} strokeWidth={2.2} />
        </View>
        <AppText
          accessibilityRole="header"
          style={{ fontFamily: fonts.displaySemibold, fontSize: 33, lineHeight: 40, textAlign: 'center', color: colors.v14Ink }}>
          {copy.title}
        </AppText>
        <AppText style={{ fontFamily: fonts.ui, fontSize: 16, lineHeight: 24.8, color: colors.text2, textAlign: 'center' }}>{copy.body}</AppText>
      </View>

      {result.status === 'success' && result.receiptRef ? (
        <View style={{ borderRadius: 16, backgroundColor: colors.lateriteSoft, paddingHorizontal: 18, paddingVertical: 16 }}>
          <AppText style={{ fontFamily: fonts.ui, fontSize: 14, lineHeight: 21, color: colors.text2 }}>Receipt reference</AppText>
          <AppText selectable style={{ fontFamily: fonts.displaySemibold, fontSize: 21, lineHeight: 30, color: colors.v14Ink }}>
            {result.receiptRef}
          </AppText>
          <AppText style={{ fontFamily: fonts.ui, fontSize: 14, lineHeight: 21, marginTop: 6, color: colors.text2 }}>
            Keep this reference. Quote it if you write to us about this gift.
          </AppText>
        </View>
      ) : null}

      <View style={{ flex: 1 }} />

      <View style={{ gap: 10 }}>
        {result.status === 'failed' ? (
          <>
            <PrimaryButton label="Try again" onPress={onRetry} />
            <OutlineButton
              label="Contact us on WhatsApp"
              color={colors.laterite}
              style={stretch}
              onPress={() => contactOnWhatsApp().catch(() => undefined)}
            />
          </>
        ) : (
          <>
            <PrimaryButton label="Done" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
            {result.status === 'success' ? <OutlineButton label="Give again" color={colors.laterite} style={stretch} onPress={onAgain} /> : null}
          </>
        )}
      </View>
    </View>
  );
}
