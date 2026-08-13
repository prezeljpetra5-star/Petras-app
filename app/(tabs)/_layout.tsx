import React from 'react';
import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/ThemeProvider';
import { ChatFAB } from '@/components/ChatFAB';

export default function TabsLayout() {
  const { colors, accentFor } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
          },
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
          tabBarInactiveTintColor: colors.textMuted,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Investing',
            tabBarActiveTintColor: accentFor('investing'),
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? 'trending-up' : 'trending-up-outline'} size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="ai-news"
          options={{
            title: 'AI News',
            tabBarActiveTintColor: accentFor('aiNews'),
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? 'sparkles' : 'sparkles-outline'} size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="recipes"
          options={{
            title: 'Recipes',
            tabBarActiveTintColor: accentFor('recipes'),
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? 'restaurant' : 'restaurant-outline'} size={size} color={color} />
            ),
          }}
        />
      </Tabs>
      <ChatFAB />
    </View>
  );
}
