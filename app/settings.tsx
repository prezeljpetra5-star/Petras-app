import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { getSettings, setSettings, type AppSettings } from '@/lib/storage';
import {
  cancelDailyBriefingNotification,
  requestNotificationPermission,
  scheduleDailyBriefingNotification,
} from '@/lib/notifications';
import { haptics } from '@/lib/haptics';

export default function SettingsScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [settings, setLocalSettings] = useState<AppSettings | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    getSettings().then(setLocalSettings);
  }, []);

  if (!settings) return null;

  const timeLabel = new Date(2000, 0, 1, settings.notificationHour, settings.notificationMinute).toLocaleTimeString(
    'en-US',
    { hour: 'numeric', minute: '2-digit' }
  );

  const persist = async (next: AppSettings) => {
    setLocalSettings(next);
    await setSettings(next);
  };

  const handleToggle = async (value: boolean) => {
    haptics.select();
    if (value) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        setPermissionDenied(true);
        return;
      }
      setPermissionDenied(false);
      await scheduleDailyBriefingNotification(settings.notificationHour, settings.notificationMinute);
    } else {
      await cancelDailyBriefingNotification();
    }
    await persist({ ...settings, notificationsEnabled: value });
  };

  const handleTimeChange = async (hour: number, minute: number) => {
    const next = { ...settings, notificationHour: hour, notificationMinute: minute };
    await persist(next);
    if (next.notificationsEnabled) {
      await scheduleDailyBriefingNotification(hour, minute);
    }
  };

  return (
    <View style={[styles.flex, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="close" size={26} color={colors.textMuted} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Daily briefing</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>Notify me daily</Text>
              <Text style={[styles.rowSubtitle, { color: colors.textSecondary }]}>
                "Your briefing is ready" at {timeLabel}
              </Text>
            </View>
            <Switch
              value={settings.notificationsEnabled}
              onValueChange={handleToggle}
              trackColor={{ true: colors.accent }}
            />
          </View>

          {settings.notificationsEnabled ? (
            <>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <Pressable style={styles.row} onPress={() => setShowPicker(true)}>
                <Text style={[styles.rowTitle, { color: colors.text }]}>Time</Text>
                <Text style={[styles.timeValue, { color: colors.accent }]}>{timeLabel}</Text>
              </Pressable>
            </>
          ) : null}

          {permissionDenied ? (
            <Text style={[styles.warning, { color: colors.danger }]}>
              Notifications are turned off in your device settings. Enable them to receive your
              daily briefing alert.
            </Text>
          ) : null}
        </View>

        {showPicker ? (
          <DateTimePicker
            value={new Date(2000, 0, 1, settings.notificationHour, settings.notificationMinute)}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, date) => {
              if (Platform.OS === 'android') setShowPicker(false);
              if (event.type === 'dismissed' || !date) return;
              handleTimeChange(date.getHours(), date.getMinutes());
            }}
          />
        ) : null}

        {showPicker && Platform.OS === 'ios' ? (
          <Pressable
            onPress={() => setShowPicker(false)}
            style={[styles.doneButton, { backgroundColor: colors.accent }]}
          >
            <Text style={styles.doneText}>Done</Text>
          </Pressable>
        ) : null}

        <Text style={[styles.sectionLabel, { color: colors.textMuted, marginTop: 24 }]}>About</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.aboutText, { color: colors.textSecondary }]}>
            Petra's App gives you a calm daily digest of markets and AI news, plus recipes
            generated around how you want to feel. Summaries are generated by AI and may
            occasionally be imperfect — always check the original source for anything important.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  rowSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 12,
  },
  timeValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  warning: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 12,
  },
  doneButton: {
    marginTop: 8,
    borderRadius: 20,
    paddingVertical: 10,
    alignItems: 'center',
  },
  doneText: {
    color: '#FFF',
    fontWeight: '700',
  },
  aboutText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
