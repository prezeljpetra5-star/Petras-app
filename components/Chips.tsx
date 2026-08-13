import React from 'react';
import { ScrollView, StyleSheet, Text, Pressable } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { haptics } from '@/lib/haptics';

export type Chip<T extends string> = { key: T; label: string };

type Props<T extends string> = {
  chips: Chip<T>[];
  selected: T | T[];
  onSelect: (key: T) => void;
  accent: string;
  multi?: boolean;
};

export function Chips<T extends string>({ chips, selected, onSelect, accent, multi }: Props<T>) {
  const { colors } = useTheme();
  const selectedSet = Array.isArray(selected) ? new Set(selected) : new Set([selected]);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {chips.map((chip) => {
        const isActive = selectedSet.has(chip.key);
        return (
          <Pressable
            key={chip.key}
            onPress={() => {
              haptics.select();
              onSelect(chip.key);
            }}
            style={[
              styles.chip,
              {
                backgroundColor: isActive ? accent : colors.surface,
                borderColor: isActive ? accent : colors.border,
              },
            ]}
          >
            <Text style={[styles.label, { color: isActive ? '#FFF' : colors.textSecondary }]}>
              {chip.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
});
