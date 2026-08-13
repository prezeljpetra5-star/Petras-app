import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const DAILY_NOTIFICATION_ID = 'daily-briefing';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) return true;
  const result = await Notifications.requestPermissionsAsync();
  return result.granted;
}

export async function scheduleDailyBriefingNotification(
  hour: number,
  minute: number
): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(DAILY_NOTIFICATION_ID).catch(() => {});

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('daily-briefing', {
      name: 'Daily briefing',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  await Notifications.scheduleNotificationAsync({
    identifier: DAILY_NOTIFICATION_ID,
    content: {
      title: "Your briefing is ready",
      body: "Today's markets and AI news are in — take a look.",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

export async function cancelDailyBriefingNotification(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(DAILY_NOTIFICATION_ID).catch(() => {});
}
