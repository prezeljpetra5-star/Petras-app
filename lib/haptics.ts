import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const isSupported = Platform.OS === 'ios' || Platform.OS === 'android';

export const haptics = {
  tap: () => isSupported && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  save: () => isSupported && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  refresh: () => isSupported && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  success: () => isSupported && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  warning: () => isSupported && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
  select: () => isSupported && Haptics.selectionAsync(),
};
