import React, { useEffect } from 'react';
import { StyleSheet, View, type DimensionValue } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@/theme/ThemeProvider';

function Pulse({ width, height, radius = 8 }: { width: DimensionValue; height: number; radius?: number }) {
  const { colors } = useTheme();
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 800 }), -1, true);
    return () => cancelAnimation(opacity);
  }, [opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        { width, height, borderRadius: radius, backgroundColor: colors.skeleton },
        style,
      ]}
    />
  );
}

export function DigestCardSkeleton() {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Pulse width="40%" height={14} radius={6} />
      <View style={{ height: 10 }} />
      <Pulse width="92%" height={18} radius={6} />
      <View style={{ height: 8 }} />
      <Pulse width="76%" height={18} radius={6} />
      <View style={{ height: 14 }} />
      <Pulse width="100%" height={14} radius={6} />
      <View style={{ height: 6 }} />
      <Pulse width="88%" height={14} radius={6} />
    </View>
  );
}

export function MoodBadgeSkeleton() {
  const { colors } = useTheme();
  return (
    <View style={[styles.mood, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Pulse width={110} height={28} radius={14} />
      <View style={{ height: 8 }} />
      <Pulse width="70%" height={14} radius={6} />
    </View>
  );
}

export function RecipeSkeleton() {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Pulse width="60%" height={22} radius={6} />
      <View style={{ height: 12 }} />
      <Pulse width="100%" height={14} radius={6} />
      <View style={{ height: 6 }} />
      <Pulse width="90%" height={14} radius={6} />
      <View style={{ height: 18 }} />
      <Pulse width="40%" height={14} radius={6} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    padding: 18,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 14,
  },
  mood: {
    borderRadius: 18,
    padding: 18,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 16,
  },
});
