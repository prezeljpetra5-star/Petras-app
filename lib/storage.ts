import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ChatMessage, Digest, DigestItem, Recipe } from './types';

const KEYS = {
  digestCache: (kind: 'investing' | 'ai-news') => `cache:digest:${kind}`,
  savedArticles: 'saved:articles',
  dismissedArticles: 'dismissed:articles',
  favoriteRecipes: 'favorites:recipes',
  chatHistory: (threadId: string) => `chat:history:${threadId}`,
  settings: 'settings',
};

export type CachedDigest = {
  digest: Digest;
  fetchedAt: string;
};

export async function getCachedDigest(
  kind: 'investing' | 'ai-news'
): Promise<CachedDigest | null> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.digestCache(kind));
    return raw ? (JSON.parse(raw) as CachedDigest) : null;
  } catch {
    return null;
  }
}

export async function setCachedDigest(
  kind: 'investing' | 'ai-news',
  digest: Digest
): Promise<void> {
  const payload: CachedDigest = { digest, fetchedAt: new Date().toISOString() };
  await AsyncStorage.setItem(KEYS.digestCache(kind), JSON.stringify(payload));
}

export function isStale(fetchedAt: string, maxAgeHours = 6): boolean {
  const age = Date.now() - new Date(fetchedAt).getTime();
  return age > maxAgeHours * 60 * 60 * 1000;
}

async function getIdSet(key: string): Promise<Set<string>> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

async function setIdSet(key: string, set: Set<string>): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(Array.from(set)));
}

export async function getDismissedIds(): Promise<Set<string>> {
  return getIdSet(KEYS.dismissedArticles);
}

export async function dismissArticle(id: string): Promise<void> {
  const set = await getDismissedIds();
  set.add(id);
  await setIdSet(KEYS.dismissedArticles, set);
}

export async function getSavedArticles(): Promise<DigestItem[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.savedArticles);
    return raw ? (JSON.parse(raw) as DigestItem[]) : [];
  } catch {
    return [];
  }
}

export async function toggleSavedArticle(item: DigestItem): Promise<boolean> {
  const list = await getSavedArticles();
  const exists = list.some((a) => a.id === item.id);
  const next = exists ? list.filter((a) => a.id !== item.id) : [item, ...list];
  await AsyncStorage.setItem(KEYS.savedArticles, JSON.stringify(next));
  return !exists;
}

export async function isArticleSaved(id: string): Promise<boolean> {
  const list = await getSavedArticles();
  return list.some((a) => a.id === id);
}

export async function getFavoriteRecipes(): Promise<Recipe[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.favoriteRecipes);
    return raw ? (JSON.parse(raw) as Recipe[]) : [];
  } catch {
    return [];
  }
}

export async function toggleFavoriteRecipe(recipe: Recipe): Promise<boolean> {
  const list = await getFavoriteRecipes();
  const exists = list.some((r) => r.id === recipe.id);
  const next = exists ? list.filter((r) => r.id !== recipe.id) : [recipe, ...list];
  await AsyncStorage.setItem(KEYS.favoriteRecipes, JSON.stringify(next));
  return !exists;
}

export async function isRecipeFavorite(id: string): Promise<boolean> {
  const list = await getFavoriteRecipes();
  return list.some((r) => r.id === id);
}

export async function getChatHistory(threadId: string): Promise<ChatMessage[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.chatHistory(threadId));
    return raw ? (JSON.parse(raw) as ChatMessage[]) : [];
  } catch {
    return [];
  }
}

export async function setChatHistory(
  threadId: string,
  messages: ChatMessage[]
): Promise<void> {
  await AsyncStorage.setItem(KEYS.chatHistory(threadId), JSON.stringify(messages));
}

export type AppSettings = {
  notificationsEnabled: boolean;
  notificationHour: number;
  notificationMinute: number;
};

export const defaultSettings: AppSettings = {
  notificationsEnabled: false,
  notificationHour: 8,
  notificationMinute: 0,
};

export async function getSettings(): Promise<AppSettings> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.settings);
    return raw ? { ...defaultSettings, ...(JSON.parse(raw) as AppSettings) } : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

export async function setSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(KEYS.settings, JSON.stringify(settings));
}
