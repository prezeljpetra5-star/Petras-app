import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/ThemeProvider';
import { haptics } from '@/lib/haptics';
import { ServingsStepper } from './ServingsStepper';
import { CheckableRow } from './CheckableRow';
import type { Recipe } from '@/lib/types';

function formatAmount(amount: number): string {
  const rounded = Math.round(amount * 100) / 100;
  if (Number.isInteger(rounded)) return String(rounded);
  return rounded.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
}

type Props = {
  recipe: Recipe;
  accent: string;
  saved: boolean;
  onToggleSave: () => void;
};

export function RecipeView({ recipe, accent, saved, onToggleSave }: Props) {
  const { colors } = useTheme();
  const [servings, setServings] = useState(recipe.servings);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set());

  useEffect(() => {
    setServings(recipe.servings);
    setCheckedIngredients(new Set());
    setCheckedSteps(new Set());
  }, [recipe.id]);

  const ratio = servings / recipe.servings;

  const scaledIngredients = useMemo(
    () =>
      recipe.ingredients.map((ing) => ({
        ...ing,
        amount: ing.amount !== null ? ing.amount * ratio : null,
      })),
    [recipe.ingredients, ratio]
  );

  const toggleIngredient = (i: number) => {
    setCheckedIngredients((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const toggleStep = (i: number) => {
    setCheckedSteps((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  return (
    <View>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: colors.text }]}>{recipe.title}</Text>
        <Pressable
          hitSlop={10}
          onPress={() => {
            haptics.save();
            onToggleSave();
          }}
        >
          <Ionicons
            name={saved ? 'heart' : 'heart-outline'}
            size={26}
            color={saved ? colors.danger : colors.textMuted}
          />
        </Pressable>
      </View>

      <Text style={[styles.description, { color: colors.textSecondary }]}>{recipe.description}</Text>

      <View style={[styles.metaRow, { borderColor: colors.border }]}>
        <View style={styles.metaItem}>
          <Ionicons name="time-outline" size={16} color={colors.textMuted} />
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>
            {recipe.prepTimeMinutes} min
          </Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="flag-outline" size={16} color={colors.textMuted} />
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>{recipe.goal}</Text>
        </View>
      </View>

      {recipe.keyNutrients.length > 0 ? (
        <View style={styles.nutrientRow}>
          {recipe.keyNutrients.map((n) => (
            <View key={n.name} style={[styles.nutrientPill, { backgroundColor: colors.accentSoft }]}>
              <Text style={[styles.nutrientName, { color: colors.accent }]}>{n.name}</Text>
              <Text style={[styles.nutrientBenefit, { color: colors.textSecondary }]}>{n.benefit}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <ServingsStepper servings={servings} onChange={setServings} accent={accent} />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Ingredients</Text>
        {scaledIngredients.map((ing, i) => (
          <CheckableRow
            key={i}
            label={
              ing.amount !== null
                ? `${formatAmount(ing.amount)} ${ing.unit} ${ing.item}`.trim()
                : `${ing.unit} ${ing.item}`.trim()
            }
            checked={checkedIngredients.has(i)}
            onToggle={() => toggleIngredient(i)}
            accent={accent}
          />
        ))}
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Steps</Text>
        {recipe.steps.map((step, i) => (
          <CheckableRow
            key={i}
            label={step}
            checked={checkedSteps.has(i)}
            onToggle={() => toggleStep(i)}
            accent={accent}
            index={i}
          />
        ))}
      </View>

      {recipe.tip ? (
        <View style={[styles.tipBox, { backgroundColor: colors.accentSoft }]}>
          <Ionicons name="bulb-outline" size={18} color={colors.accent} />
          <Text style={[styles.tipText, { color: colors.text }]}>{recipe.tip}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    flex: 1,
    lineHeight: 30,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 14,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    fontWeight: '600',
  },
  nutrientRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  nutrientPill: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxWidth: '100%',
  },
  nutrientName: {
    fontSize: 13,
    fontWeight: '700',
  },
  nutrientBenefit: {
    fontSize: 12,
    marginTop: 1,
  },
  card: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 18,
    marginTop: 16,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  tipBox: {
    flexDirection: 'row',
    gap: 10,
    borderRadius: 16,
    padding: 14,
    marginTop: 16,
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  tipText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
});
