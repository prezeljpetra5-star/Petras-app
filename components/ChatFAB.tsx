import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { haptics } from '@/lib/haptics';

export function ChatFAB() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Pressable
      onPress={() => {
        haptics.tap();
        router.push('/chat');
      }}
      style={({ pressed }) => [
        styles.fab,
        {
          backgroundColor: colors.accent,
          bottom: insets.bottom + 78,
          opacity: pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.96 : 1 }],
        },
      ]}
    >
      <Ionicons name="chatbubble-ellipses" size={24} color="#FFF" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 18,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
});
