import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { palette, tabAccents, type Palette, type TabAccent } from './colors';

type ThemeContextValue = {
  colors: Palette;
  scheme: 'light' | 'dark';
  accentFor: (tab: TabAccent) => string;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const value = useMemo<ThemeContextValue>(
    () => ({
      colors: palette[scheme],
      scheme,
      accentFor: (tab: TabAccent) => tabAccents[tab][scheme],
    }),
    [scheme]
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
