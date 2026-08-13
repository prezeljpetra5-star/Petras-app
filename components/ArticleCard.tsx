import React, { useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  LinearTransition,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import * as WebBrowser from 'expo-web-browser';
import { useTheme } from '@/theme/ThemeProvider';
import { haptics } from '@/lib/haptics';
import type { DigestCategory, DigestItem } from '@/lib/types';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.32;

const CATEGORY_LABEL: Record<DigestCategory, string> = {
  'models-research': 'Models & Research',
  products: 'Products',
  business: 'Business',
  policy: 'Policy',
  general: 'General',
};

type Props = {
  item: DigestItem;
  accent: string;
  saved: boolean;
  onToggleSave: () => void;
  onDismiss: () => void;
  showCategory?: boolean;
  eliMode?: boolean;
  onToggleEli?: () => void;
  eliLoading?: boolean;
  onExpand?: () => void;
};

export function ArticleCard({
  item,
  accent,
  saved,
  onToggleSave,
  onDismiss,
  showCategory,
  eliMode,
  onToggleEli,
  eliLoading,
  onExpand,
}: Props) {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const translateX = useSharedValue(0);
  const cardHeight = useSharedValue<number | null>(null);
  const dismissed = useSharedValue(false);

  const openSource = async () => {
    haptics.tap();
    try {
      await WebBrowser.openBrowserAsync(item.sourceUrl);
    } catch {
      // ignore
    }
  };

  const toggleExpand = () => {
    haptics.select();
    setExpanded((v) => {
      const next = !v;
      if (next) onExpand?.();
      return next;
    });
  };

  const pan = Gesture.Pan()
    .activeOffsetX([-12, 12])
    .failOffsetY([-10, 10])
    .onUpdate((e) => {
      translateX.value = e.translationX;
    })
    .onEnd((e) => {
      if (Math.abs(e.translationX) > SWIPE_THRESHOLD) {
        const toValue = e.translationX > 0 ? SCREEN_WIDTH : -SCREEN_WIDTH;
        translateX.value = withTiming(toValue, { duration: 220, easing: Easing.out(Easing.quad) });
        dismissed.value = true;
        runOnJS(haptics.tap)();
        runOnJS(onDismiss)();
      } else {
        translateX.value = withTiming(0, { duration: 180 });
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: dismissed.value ? withTiming(0, { duration: 200 }) : 1,
  }));

  const displaySummary = eliMode && item.simpleSummary ? item.simpleSummary : item.summary;
  const displayLong = eliMode && item.simpleSummary ? item.simpleSummary : item.longSummary;

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={cardStyle} layout={LinearTransition.duration(220)}>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.topRow}>
            <View style={styles.metaRow}>
              <Text style={[styles.source, { color: accent }]} numberOfLines={1}>
                {item.sourceName}
              </Text>
              {showCategory ? (
                <View style={[styles.categoryPill, { backgroundColor: colors.accentSoft }]}>
                  <Text style={[styles.categoryText, { color: colors.accent }]}>
                    {CATEGORY_LABEL[item.category]}
                  </Text>
                </View>
              ) : null}
            </View>
            <Pressable
              hitSlop={10}
              onPress={() => {
                haptics.save();
                onToggleSave();
              }}
            >
              <Ionicons
                name={saved ? 'heart' : 'heart-outline'}
                size={22}
                color={saved ? colors.danger : colors.textMuted}
              />
            </Pressable>
          </View>

          <Pressable onPress={toggleExpand}>
            <Text style={[styles.headline, { color: colors.text }]}>{item.headline}</Text>
            <Text style={[styles.summary, { color: colors.textSecondary }]}>
              {expanded ? displayLong : displaySummary}
            </Text>

            {expanded ? (
              <Animated.View
                entering={FadeIn.duration(180)}
                exiting={FadeOut.duration(120)}
                style={[styles.whyBox, { backgroundColor: colors.accentSoft }]}
              >
                <Text style={[styles.whyLabel, { color: colors.accent }]}>Why it matters</Text>
                <Text style={[styles.whyText, { color: colors.text }]}>{item.whyItMatters}</Text>
              </Animated.View>
            ) : null}
          </Pressable>

          <View style={styles.bottomRow}>
            <Pressable onPress={toggleExpand} hitSlop={8} style={styles.expandButton}>
              <Text style={[styles.expandLabel, { color: accent }]}>
                {expanded ? 'Show less' : 'Read more'}
              </Text>
              <Ionicons
                name={expanded ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={accent}
              />
            </Pressable>

            <View style={styles.rightActions}>
              {onToggleEli ? (
                <Pressable
                  onPress={onToggleEli}
                  hitSlop={8}
                  style={[
                    styles.eliButton,
                    { borderColor: colors.border, backgroundColor: eliMode ? colors.accentSoft : 'transparent' },
                  ]}
                >
                  <Text style={[styles.eliText, { color: eliMode ? colors.accent : colors.textMuted }]}>
                    {eliLoading ? 'Simplifying…' : "I'm new to this"}
                  </Text>
                </Pressable>
              ) : null}
              <Pressable onPress={openSource} hitSlop={8}>
                <Ionicons name="open-outline" size={20} color={colors.textMuted} />
              </Pressable>
            </View>
          </View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    padding: 18,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 14,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  source: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  categoryPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  headline: {
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 23,
    marginBottom: 6,
  },
  summary: {
    fontSize: 15,
    lineHeight: 22,
  },
  whyBox: {
    marginTop: 12,
    borderRadius: 12,
    padding: 12,
  },
  whyLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  whyText: {
    fontSize: 14,
    lineHeight: 20,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  expandLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  eliButton: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  eliText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
