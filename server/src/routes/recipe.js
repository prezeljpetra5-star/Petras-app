const express = require('express');
const crypto = require('crypto');
const { completeJSON, RECIPE_SYSTEM_PROMPT: SYSTEM } = require('../anthropic');
const { buildRecipePrompt } = require('../prompts');

const router = express.Router();

router.post('/recipe', async (req, res) => {
  const { goal, diet, timeAvailable, avoid } = req.body || {};
  if (!goal || typeof goal !== 'string' || !goal.trim()) {
    return res.status(400).json({ error: 'goal is required.' });
  }

  try {
    const result = await completeJSON({
      system: SYSTEM,
      user: buildRecipePrompt({ goal, diet, timeAvailable, avoid }),
      maxTokens: 2000,
    });

    const recipe = {
      id: crypto.randomUUID(),
      title: result.title || 'Untitled recipe',
      description: result.description || '',
      servings: Number(result.servings) > 0 ? Number(result.servings) : 1,
      prepTimeMinutes: Number(result.prepTimeMinutes) || 15,
      goal: result.goal || goal,
      keyNutrients: Array.isArray(result.keyNutrients) ? result.keyNutrients : [],
      ingredients: Array.isArray(result.ingredients)
        ? result.ingredients.map((ing) => ({
            amount: typeof ing.amount === 'number' ? ing.amount : null,
            unit: ing.unit || '',
            item: ing.item || '',
          }))
        : [],
      steps: Array.isArray(result.steps) ? result.steps : [],
      tip: result.tip || '',
      createdAt: new Date().toISOString(),
    };

    res.json(recipe);
  } catch (err) {
    console.error('[recipe] error', err);
    res.status(500).json({ error: 'Could not create a recipe right now.' });
  }
});

module.exports = router;
