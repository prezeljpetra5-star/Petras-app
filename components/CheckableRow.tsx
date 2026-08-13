import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/ThemeProvider';
import { haptics } from '@/lib/haptics';

type Props = {
  label: string;
  checked: boolean;
  onToggle: () => void;
  accent: string;
  index?: number;
};

export function CheckableRow({ label, checked, onToggle, accent, index }: Props) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={() => {
        haptics.select();
        onToggle();
      }}
      style={styles.row}
    >
      {typeof index === 'number' ? (
        <View
          style={[
            styles.stepNumber,
            { backgroundColor: checked ? accent : colors.accentSoft, borderColor: accent },
          ]}
        >
          {checked ? (
            <Ionicons name="checkmark" size={13} color="#FFF" />
          ) : (
            <Text style={[styles.stepNumberText, { color: accent }]}>{index + 1}</Text>
          )}
        </View>
      ) : (
        <View
          style={[
            styles.checkbox,
            {
              borderColor: checked ? accent : colors.border,
              backgroundColor: checked ? accent : 'transparent',
            },
          ]}
        >
          {checked ? <Ionicons name="checkmark" size={14} color="#FFF" /> : null}
        </View>
      )}
      <Text
        style={[
          styles.label,
          { color: checked ? colors.textMuted : colors.text },
          checked && styles.strike,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 9,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: '700',
  },
  label: {
    fontSize: 15,
    lineHeight: 21,
    flex: 1,
  },
  strike: {
    textDecorationLine: 'line-through',
  },
});
