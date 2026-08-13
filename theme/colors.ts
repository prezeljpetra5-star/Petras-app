export type TabAccent = 'investing' | 'aiNews' | 'recipes';

export const palette = {
  light: {
    background: '#FBF9F6',
    surface: '#FFFFFF',
    surfaceRaised: '#FFFFFF',
    border: '#E9E3D9',
    text: '#241F19',
    textSecondary: '#6B6257',
    textMuted: '#9B9284',
    accent: '#8A6E4B',
    accentSoft: '#F0E6D6',
    positive: '#3E7A4C',
    positiveSoft: '#E4F1E6',
    negative: '#B14A3B',
    negativeSoft: '#F7E7E3',
    neutral: '#8A6E4B',
    neutralSoft: '#F0E6D6',
    skeleton: '#EDE7DC',
    danger: '#C24A3B',
    overlay: 'rgba(36, 31, 25, 0.45)',
  },
  dark: {
    background: '#17140F',
    surface: '#211D17',
    surfaceRaised: '#2A251D',
    border: '#3A3327',
    text: '#F3EEE4',
    textSecondary: '#B7AD9C',
    textMuted: '#7E7566',
    accent: '#D8B98A',
    accentSoft: '#3A311F',
    positive: '#7ABE8A',
    positiveSoft: '#243329',
    negative: '#E08A78',
    negativeSoft: '#3A2621',
    neutral: '#D8B98A',
    neutralSoft: '#3A311F',
    skeleton: '#2A251D',
    danger: '#E08A78',
    overlay: 'rgba(0, 0, 0, 0.6)',
  },
};

export const tabAccents = {
  investing: { light: '#2F7D5C', dark: '#7FCDA8' },
  aiNews: { light: '#3E63B3', dark: '#93B2E8' },
  recipes: { light: '#B0654A', dark: '#E0A183' },
};

export type Palette = typeof palette.light;
