import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { EmptyState } from '@/components/EmptyState';
import { getFavoriteRecipes, getSavedArticles, toggleFavoriteRecipe, toggleSavedArticle } from '@/lib/storage';
import { haptics } from '@/lib/haptics';
import type { DigestItem, Recipe } from '@/lib/types';

export default function FavoritesScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [articles, setArticles] = useState<DigestItem[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [tab, setTab] = useState<'articles' | 'recipes'>('articles');

  const load = useCallback(() => {
    getSavedArticles().then(setArticles);
    getFavoriteRecipes().then(setRecipes);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const removeArticle = async (item: DigestItem) => {
    haptics.tap();
    await toggleSavedArticle(item);
    load();
  };

  const removeRecipe = async (recipe: Recipe) => {
    haptics.tap();
    await toggleFavoriteRecipe(recipe);
    load();
  };

  return (
    <View style={[styles.flex, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Saved</Text>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="close" size={26} color={colors.textMuted} />
        </Pressable>
      </View>

      <View style={styles.tabRow}>
        <Pressable onPress={() => setTab('articles')} style={styles.tabButton}>
          <Text
            style={[
              styles.tabLabel,
              { color: tab === 'articles' ? colors.text : colors.textMuted },
            ]}
          >
            Articles ({articles.length})
          </Text>
          {tab === 'articles' ? (
            <View style={[styles.tabIndicator, { backgroundColor: colors.accent }]} />
          ) : null}
        </Pressable>
        <Pressable onPress={() => setTab('recipes')} style={styles.tabButton}>
          <Text
            style={[
              styles.tabLabel,
              { color: tab === 'recipes' ? colors.text : colors.textMuted },
            ]}
          >
            Recipes ({recipes.length})
          </Text>
          {tab === 'recipes' ? (
            <View style={[styles.tabIndicator, { backgroundColor: colors.accent }]} />
          ) : null}
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {tab === 'articles' ? (
          articles.length === 0 ? (
            <EmptyState
              icon="bookmark-outline"
              title="No saved articles yet"
              message="Tap the heart on any story in Investing or AI News to save it here."
            />
          ) : (
            articles.map((item) => (
              <View
                key={item.id}
                style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <Pressable
                  style={styles.rowContent}
                  onPress={() => WebBrowser.openBrowserAsync(item.sourceUrl)}
                >
                  <Text style={[styles.rowSource, { color: colors.textMuted }]}>{item.sourceName}</Text>
                  <Text style={[styles.rowTitle, { color: colors.text }]} numberOfLines={2}>
                    {item.headline}
                  </Text>
                </Pressable>
                <Pressable onPress={() => removeArticle(item)} hitSlop={8}>
                  <Ionicons name="heart" size={20} color={colors.danger} />
                </Pressable>
              </View>
            ))
          )
        ) : recipes.length === 0 ? (
          <EmptyState
            icon="restaurant-outline"
            title="No favorite recipes yet"
            message="Generate a recipe in the Recipes tab and tap the heart to save it here."
          />
        ) : (
          recipes.map((recipe) => (
            <View
              key={recipe.id}
              style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View style={styles.rowContent}>
                <Text style={[styles.rowSource, { color: colors.textMuted }]}>
                  {recipe.goal} · {recipe.prepTimeMinutes} min
                </Text>
                <Text style={[styles.rowTitle, { color: colors.text }]} numberOfLines={2}>
                  {recipe.title}
                </Text>
              </View>
              <Pressable onPress={() => removeRecipe(recipe)} hitSlop={8}>
                <Ionicons name="heart" size={20} color={colors.danger} />
              </Pressable>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 24,
    marginBottom: 8,
  },
  tabButton: {
    paddingBottom: 10,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  tabIndicator: {
    height: 2,
    borderRadius: 1,
    marginTop: 6,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  rowContent: {
    flex: 1,
  },
  rowSource: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
});
