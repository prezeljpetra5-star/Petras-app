import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/ThemeProvider';
import type { MarketMood } from '@/lib/types';

const MOOD_META: Record<MarketMood, { label: string; icon: keyof typeof Ionicons.glyphMap }> = {
  bullish: { label: 'Bullish', icon: 'trending-up' },
  neutral: { label: 'Neutral', icon: 'remove-outline' },
  bearish: { label: 'Bearish', icon: 'trending-down' },
};

export function MoodBadge({ mood, reason }: { mood: MarketMood; reason?: string }) {
  const { colors } = useTheme();
  const meta = MOOD_META[mood];
  const tint =
    mood === 'bullish' ? colors.positive : mood === 'bearish' ? colors.negative : colors.neutral;
  const tintSoft =
    mood === 'bullish'
      ? colors.positiveSoft
      : mood === 'bearish'
        ? colors.negativeSoft
        : colors.neutralSoft;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.pill, { backgroundColor: tintSoft }]}>
        <Ionicons name={meta.icon} size={16} color={tint} />
        <Text style={[styles.pillText, { color: tint }]}>Market mood: {meta.label}</Text>
      </View>
      {reason ? (
        <Text style={[styles.reason, { color: colors.textSecondary }]}>{reason}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 16,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 6,
  },
  pillText: {
    fontWeight: '700',
    fontSize: 13,
  },
  reason: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 20,
  },
});
