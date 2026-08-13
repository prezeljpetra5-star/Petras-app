import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '@/theme/ThemeProvider';

function formatTimestamp(iso: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  if (sameDay) return `Updated today at ${time}`;
  return `Updated ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${time}`;
}

type Props = {
  title: string;
  accent: string;
  lastUpdated?: string | null;
  onBookmarkPress?: () => void;
};

export function TabHeader({ title, accent, lastUpdated, onBookmarkPress }: Props) {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          {lastUpdated ? (
            <Text style={[styles.timestamp, { color: colors.textMuted }]}>
              {formatTimestamp(lastUpdated)}
            </Text>
          ) : null}
        </View>
        <View style={styles.actions}>
          {onBookmarkPress ? (
            <Pressable hitSlop={10} onPress={onBookmarkPress} style={styles.iconButton}>
              <Ionicons name="bookmark-outline" size={22} color={accent} />
            </Pressable>
          ) : null}
          <Pressable hitSlop={10} onPress={() => router.push('/settings')} style={styles.iconButton}>
            <Ionicons name="settings-outline" size={22} color={colors.textMuted} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
  },
  timestamp: {
    fontSize: 13,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 6,
  },
  iconButton: {
    padding: 2,
  },
});
