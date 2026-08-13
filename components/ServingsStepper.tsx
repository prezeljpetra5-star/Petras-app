import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/ThemeProvider';
import { haptics } from '@/lib/haptics';

type Props = {
  servings: number;
  onChange: (next: number) => void;
  accent: string;
  min?: number;
  max?: number;
};

export function ServingsStepper({ servings, onChange, accent, min = 1, max = 12 }: Props) {
  const { colors } = useTheme();

  const step = (delta: number) => {
    const next = Math.min(max, Math.max(min, servings + delta));
    if (next !== servings) {
      haptics.select();
      onChange(next);
    }
  };

  return (
    <View style={styles.row}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>Servings</Text>
      <View style={[styles.control, { borderColor: colors.border }]}>
        <Pressable onPress={() => step(-1)} hitSlop={8} style={styles.button}>
          <Ionicons name="remove" size={18} color={accent} />
        </Pressable>
        <Text style={[styles.value, { color: colors.text }]}>{servings}</Text>
        <Pressable onPress={() => step(1)} hitSlop={8} style={styles.button}>
          <Ionicons name="add" size={18} color={accent} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
  },
  control: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 20,
    paddingHorizontal: 4,
  },
  button: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 16,
    fontWeight: '700',
    minWidth: 24,
    textAlign: 'center',
  },
});
