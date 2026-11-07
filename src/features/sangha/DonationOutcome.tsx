import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { AppText, Button, Card, Icon, type IconName } from '@/components/ui';
import { useOpenWhatsApp, type DonationResult } from '@/data';
import { formatRupees } from './format';
import { colors, fonts } from '@/theme/tokens';

/** Result of "Pay with UPI": success with receipt reference, pending, or failure with a safe retry (G-07). */
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
  return (
    <View style={{ flex: 1, gap: 22 }} accessibilityLiveRegion="polite">
      <View style={{ alignItems: 'center', gap: 14, paddingTop: 24 }}>
        <View
          style={{
            width: 72,
            height: 72,
            borderRadius: 36,
            backgroundColor: colors.tile,
            borderWidth: result.status === 'success' ? 2 : 1,
            borderColor: result.status === 'success' ? colors.actionRed : colors.border,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Icon name={copy.icon} size={32} color={colors.actionRed} strokeWidth={2.2} />
        </View>
        <AppText accessibilityRole="header" style={{ fontFamily: fonts.serifSemibold, fontSize: 28, lineHeight: 36, textAlign: 'center' }}>
          {copy.title}
        </AppText>
        <AppText style={{ fontFamily: fonts.sansMedium, fontSize: 14, lineHeight: 22.4, color: colors.muted, textAlign: 'center' }}>{copy.body}</AppText>
      </View>

      {result.status === 'success' && result.receiptRef ? (
        <Card radius={18} style={{ paddingHorizontal: 16, paddingVertical: 14 }}>
          <AppText variant="caption">Receipt reference</AppText>
          <AppText selectable style={{ fontFamily: fonts.sansSemibold, fontSize: 16, lineHeight: 24 }}>
            {result.receiptRef}
          </AppText>
          <AppText variant="caption" style={{ marginTop: 6 }}>
            Keep this reference. Quote it if you write to us about this gift.
          </AppText>
        </Card>
      ) : null}

      <View style={{ flex: 1 }} />

      <View style={{ gap: 10 }}>
        {result.status === 'failed' ? (
          <>
            <Button label="Try again" onPress={onRetry} />
            <Button
              label="Contact us on WhatsApp"
              variant="outline"
              onPress={() => contactOnWhatsApp().catch(() => undefined)}
            />
          </>
        ) : (
          <>
            <Button label="Done" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
            {result.status === 'success' ? <Button label="Give again" variant="outline" onPress={onAgain} /> : null}
          </>
        )}
      </View>
    </View>
  );
}
