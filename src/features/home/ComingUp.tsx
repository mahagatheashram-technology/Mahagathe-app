import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { AppText, Card } from '@/components/ui';
import { photos, useEvents, useRegisterForEvent, useSession, type EventItem } from '@/data';
import { colors, fonts } from '@/theme/tokens';
import { eventDateBadge } from './format';
import { RegisterButton } from './RegisterButton';
import { Skeleton } from './Skeleton';

/** H-04: the next three events with a register button. First one with a photo is the lead card. */
export function ComingUp() {
  const router = useRouter();
  const events = useEvents(3);
  const register = useRegisterForEvent();
  const { status, canUsePersonalFeatures } = useSession();
  const [busyId, setBusyId] = useState<string | null>(null);

  const toggle = async (e: EventItem) => {
    // T-01: guests can browse; registering needs an account.
    if (!canUsePersonalFeatures) {
      router.push(status === 'signedIn' ? '/setup' : '/welcome');
      return;
    }
    setBusyId(e.id);
    try {
      await register(e.id, !e.registered);
    } catch {
      Alert.alert('Registration unchanged', 'We could not update your registration. Please try again.');
    } finally {
      setBusyId(null);
    }
  };

  const lead = events?.find((e) => e.imageKey);
  const rows = events?.filter((e) => e !== lead) ?? [];

  return (
    <View style={{ paddingTop: 28, paddingHorizontal: 20, paddingBottom: 20, gap: 14 }} accessibilityLabel="Coming up">
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <AppText variant="section" accessibilityRole="header" style={{ lineHeight: 27 }}>
          Coming up
        </AppText>
        <Pressable
          accessibilityRole="link"
          accessibilityLabel="All events"
          onPress={() => router.push('/events')}
          style={{ minHeight: 44, justifyContent: 'center' }}>
          <AppText style={{ fontFamily: fonts.sansSemibold, fontSize: 13, lineHeight: 19.5, color: colors.actionRed }}>All events</AppText>
        </Pressable>
      </View>

      {events === undefined ? (
        <>
          <Card radius={22} style={{ overflow: 'hidden' }}>
            <Skeleton height={150} radius={0} />
            <View style={{ padding: 16, gap: 8 }}>
              <Skeleton width="55%" height={22} />
              <Skeleton width="70%" height={14} />
            </View>
          </Card>
        </>
      ) : events.length === 0 ? (
        <Card radius={18} style={{ padding: 20, gap: 4 }}>
          <AppText variant="label">No events coming up</AppText>
          <AppText variant="meta">New gatherings are added here as they are announced.</AppText>
        </Card>
      ) : (
        <>
          {lead ? (
            <Card radius={22} style={{ overflow: 'hidden' }}>
              <View style={{ height: 150 }}>
                {lead.imageKey ? (
                  <Image
                    source={photos[lead.imageKey]}
                    contentFit="cover"
                    style={{ width: '100%', height: 150 }}
                    accessibilityLabel={`Photo from a past Mahagathe gathering`}
                  />
                ) : null}
                <DateBadge iso={lead.startsAt} />
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 }}>
                <View style={{ flex: 1 }}>
                  <AppText style={{ fontFamily: fonts.serifSemibold, fontSize: 19, lineHeight: 24 }}>{lead.title}</AppText>
                  <AppText variant="meta" style={{ lineHeight: 19.5 }}>
                    {lead.place} · {lead.timeLabel}
                  </AppText>
                </View>
                <RegisterButton
                  size="lg"
                  registered={lead.registered}
                  busy={busyId === lead.id}
                  eventTitle={lead.title}
                  onPress={() => toggle(lead)}
                />
              </View>
            </Card>
          ) : null}

          {rows.length > 0 ? (
            <Card radius={18}>
              {rows.map((e, i) => {
                const b = eventDateBadge(e.startsAt);
                return (
                  <View
                    key={e.id}
                    style={[
                      styles.row,
                      i < rows.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.sand },
                    ]}>
                    <View style={{ width: 44, alignItems: 'center' }}>
                      <AppText style={styles.month}>{b.month}</AppText>
                      <AppText style={styles.day}>{b.day}</AppText>
                    </View>
                    <View style={{ flex: 1 }}>
                      <AppText variant="label" style={{ lineHeight: 21 }}>
                        {e.title}
                      </AppText>
                      <AppText variant="caption" style={{ lineHeight: 17.5 }}>
                        {e.place} · {e.timeLabel}
                      </AppText>
                    </View>
                    <RegisterButton
                      size="sm"
                      registered={e.registered}
                      busy={busyId === e.id}
                      eventTitle={e.title}
                      onPress={() => toggle(e)}
                    />
                  </View>
                );
              })}
            </Card>
          ) : null}
        </>
      )}
    </View>
  );
}

function DateBadge({ iso }: { iso: string }) {
  const b = eventDateBadge(iso);
  return (
    <View style={styles.badge} accessible accessibilityLabel={`${b.day} ${b.month}`}>
      <AppText style={styles.month}>{b.month}</AppText>
      <AppText style={styles.day}>{b.day}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, paddingHorizontal: 16 },
  month: { fontFamily: fonts.sansSemibold, fontSize: 11, lineHeight: 16.5, letterSpacing: 0.88, color: colors.actionRed, textAlign: 'center' },
  day: { fontFamily: fonts.serifSemibold, fontSize: 22, lineHeight: 24.2, color: colors.ink, textAlign: 'center' },
  badge: {
    position: 'absolute',
    left: 14,
    top: 14,
    width: 54,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: colors.white,
  },
});
