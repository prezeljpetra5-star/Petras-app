import React, { useCallback, useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/ThemeProvider';
import { useChatContext } from '@/contexts/ChatContext';
import { TabHeader } from '@/components/TabHeader';
import { Chips, type Chip } from '@/components/Chips';
import { RecipeView } from '@/components/RecipeView';
import { RecipeSkeleton } from '@/components/Skeleton';
import { EmptyState } from '@/components/EmptyState';
import { generateRecipe } from '@/lib/api';
import { haptics } from '@/lib/haptics';
import { isRecipeFavorite, toggleFavoriteRecipe } from '@/lib/storage';
import type { Recipe, RecipeRequest } from '@/lib/types';

const GOAL_CHIPS: Chip<string>[] = [
  { key: 'Strong hair', label: 'Strong hair' },
  { key: 'Glowing skin', label: 'Glowing skin' },
  { key: 'Energy', label: 'Energy' },
  { key: 'Better sleep', label: 'Better sleep' },
  { key: 'Immunity', label: 'Immunity' },
  { key: 'Focus', label: 'Focus' },
  { key: 'Digestion', label: 'Digestion' },
];

const DIET_CHIPS: Chip<NonNullable<RecipeRequest['diet']>>[] = [
  { key: 'none', label: 'No preference' },
  { key: 'vegetarian', label: 'Vegetarian' },
  { key: 'vegan', label: 'Vegan' },
  { key: 'gluten-free', label: 'Gluten-free' },
  { key: 'dairy-free', label: 'Dairy-free' },
];

const TIME_CHIPS: Chip<NonNullable<RecipeRequest['timeAvailable']>>[] = [
  { key: '5', label: '5 min' },
  { key: '15', label: '15 min' },
  { key: '30+', label: '30+ min' },
];

export default function RecipesScreen() {
  const { colors, accentFor } = useTheme();
  const accent = accentFor('recipes');
  const { setSource } = useChatContext();
  const [goal, setGoal] = useState('');
  const [diet, setDiet] = useState<NonNullable<RecipeRequest['diet']>>('none');
  const [time, setTime] = useState<NonNullable<RecipeRequest['timeAvailable']>>('15');
  const [avoid, setAvoid] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [saved, setSaved] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setSource(recipe ? { type: 'recipe', recipe } : { type: 'recipes-tab' });
    }, [setSource, recipe])
  );

  useEffect(() => {
    if (recipe) isRecipeFavorite(recipe.id).then(setSaved);
  }, [recipe]);

  const handleGenerate = async (goalOverride?: string) => {
    const effectiveGoal = (goalOverride ?? goal).trim();
    if (!effectiveGoal) return;
    haptics.tap();
    setLoading(true);
    setError(null);
    try {
      const result = await generateRecipe({
        goal: effectiveGoal,
        diet,
        timeAvailable: time,
        avoid: avoid.trim() || undefined,
      });
      setRecipe(result);
      haptics.success();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
      haptics.warning();
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSave = async () => {
    if (!recipe) return;
    const nowSaved = await toggleFavoriteRecipe(recipe);
    setSaved(nowSaved);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.flex, { backgroundColor: colors.background }]}>
        <ScrollView
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
        >
          <TabHeader
            title="Recipes"
            accent={accent}
            onBookmarkPress={() => router.push('/favorites')}
          />

          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.prompt, { color: colors.text }]}>
              What do you need today?
            </Text>
            <TextInput
              value={goal}
              onChangeText={setGoal}
              placeholder="e.g. a smoothie for strong hair"
              placeholderTextColor={colors.textMuted}
              style={[
                styles.input,
                { color: colors.text, borderColor: colors.border, backgroundColor: colors.background },
              ]}
              multiline
            />

            <View style={styles.chipSection}>
              <Chips
                chips={GOAL_CHIPS}
                selected={goal}
                onSelect={(g) => {
                  setGoal(g);
                }}
                accent={accent}
              />
            </View>

            <Pressable
              onPress={() => setShowOptions((v) => !v)}
              style={styles.optionsToggle}
            >
              <Text style={[styles.optionsToggleText, { color: colors.textSecondary }]}>
                Preferences
              </Text>
              <Ionicons
                name={showOptions ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={colors.textSecondary}
              />
            </Pressable>

            {showOptions ? (
              <View style={styles.optionsPanel}>
                <Text style={[styles.optionLabel, { color: colors.textMuted }]}>Diet</Text>
                <Chips chips={DIET_CHIPS} selected={diet} onSelect={setDiet} accent={accent} />
                <Text style={[styles.optionLabel, { color: colors.textMuted, marginTop: 12 }]}>
                  Time available
                </Text>
                <Chips chips={TIME_CHIPS} selected={time} onSelect={setTime} accent={accent} />
                <Text style={[styles.optionLabel, { color: colors.textMuted, marginTop: 12 }]}>
                  Ingredients to avoid
                </Text>
                <TextInput
                  value={avoid}
                  onChangeText={setAvoid}
                  placeholder="e.g. nuts, honey"
                  placeholderTextColor={colors.textMuted}
                  style={[
                    styles.avoidInput,
                    { color: colors.text, borderColor: colors.border, backgroundColor: colors.background },
                  ]}
                />
              </View>
            ) : null}

            <Pressable
              onPress={() => handleGenerate()}
              disabled={!goal.trim() || loading}
              style={({ pressed }) => [
                styles.generateButton,
                {
                  backgroundColor: !goal.trim() || loading ? colors.border : accent,
                  opacity: pressed ? 0.9 : 1,
                },
              ]}
            >
              <Text style={styles.generateText}>
                {loading ? 'Creating your recipe…' : 'Generate recipe'}
              </Text>
            </Pressable>
          </View>

          {loading ? <RecipeSkeleton /> : null}

          {!loading && error ? (
            <EmptyState
              icon="alert-circle-outline"
              title="Couldn't generate a recipe"
              message={error}
              actionLabel="Try again"
              onAction={() => handleGenerate()}
            />
          ) : null}

          {!loading && !error && recipe ? (
            <RecipeView recipe={recipe} accent={accent} saved={saved} onToggleSave={handleToggleSave} />
          ) : null}

          {!loading && !error && !recipe ? (
            <EmptyState
              icon="restaurant-outline"
              title="Tell me what you need"
              message="Describe a goal, or tap a quick pick above, and I'll create a recipe just for it."
            />
          ) : null}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  listContent: { paddingHorizontal: 16, paddingBottom: 140 },
  card: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 18,
    marginBottom: 8,
  },
  prompt: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 10,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    padding: 12,
    fontSize: 15,
    minHeight: 48,
    textAlignVertical: 'top',
  },
  chipSection: {
    marginTop: 12,
  },
  optionsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 14,
    alignSelf: 'flex-start',
  },
  optionsToggleText: {
    fontSize: 13,
    fontWeight: '600',
  },
  optionsPanel: {
    marginTop: 10,
  },
  optionLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 6,
  },
  avoidInput: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  generateButton: {
    marginTop: 18,
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
  },
  generateText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
