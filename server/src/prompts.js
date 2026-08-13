function buildDigestUserPrompt(kind, articles) {
  const list = articles
    .map(
      (a, i) =>
        `[${i}] (${a.sourceName}) ${a.headline}${a.snippet ? ` — ${a.snippet}` : ''}`
    )
    .join('\n');

  const audience =
    kind === 'investing'
      ? 'a smart, busy reader who is not a finance professional'
      : 'a smart, busy reader who is not a technical AI expert';

  const categoryInstruction =
    kind === 'ai-news'
      ? `Assign each chosen item a "category", one of exactly: "models-research", "products", "business", "policy", "general".`
      : '';

  const moodInstruction =
    kind === 'investing'
      ? `Also infer an overall "mood" for the day's markets from these headlines: one of exactly "bullish", "neutral", or "bearish". Give a one-line "moodReason" justifying it in plain English.`
      : '';

  return `Here are today's raw headlines, each with an index in brackets:

${list}

Pick the 5 to 7 most important, interesting, or high-impact items for ${audience}. For each chosen item, write:
- "index": the bracketed number of the source headline you used
- "headline": a clear, plain-English version of the headline (rewrite it if the original is jargon-heavy; keep it factual, do not sensationalize)
- "summary": 1-2 sentences in plain English, no jargon, suitable for a quick daily briefing
- "longSummary": 3-5 sentences giving more context and nuance, still plain English
- "whyItMatters": one sentence on why this is worth knowing
${categoryInstruction}

${moodInstruction}

Return ONLY strict JSON matching this shape, no markdown, no preamble, no trailing commentary:
{${kind === 'investing' ? '"mood": "bullish|neutral|bearish", "moodReason": "string", ' : ''}"items": [{"index": 0, "headline": "string", "summary": "string", "longSummary": "string", "whyItMatters": "string"${kind === 'ai-news' ? ', "category": "string"' : ''}}]}`;
}

const DIGEST_SYSTEM_PROMPT =
  'You are a careful news editor who writes short, factual, plain-English daily briefings. You never invent facts beyond what the headlines and snippets support. You always respond with strict JSON only — no markdown code fences, no commentary before or after the JSON.';

function buildSimplifyPrompt(headline, summary) {
  return {
    system:
      "You rewrite short news summaries in very simple, friendly language for someone completely new to the topic, as if explaining to a curious friend. Avoid jargon entirely, use short sentences, and keep it to 2-3 sentences. Respond with strict JSON only: {\"simpleSummary\": \"string\"}, no markdown, no commentary.",
    user: `Headline: ${headline}\nCurrent summary: ${summary}\n\nRewrite the summary in very simple language for someone new to this topic.`,
  };
}

const RECIPE_SYSTEM_PROMPT =
  'You are a warm, knowledgeable nutrition-minded recipe creator. You design simple, realistic, tasty recipes tailored to a stated wellness goal and constraints. You always respond with strict JSON only — no markdown code fences, no commentary before or after the JSON. Ingredient amounts must be numeric where possible (use null only for amounts like "a pinch" or "to taste", and put that description in the unit field instead).';

function buildRecipePrompt({ goal, diet, timeAvailable, avoid }) {
  const constraints = [];
  if (diet && diet !== 'none') constraints.push(`Dietary preference: ${diet}.`);
  if (timeAvailable) {
    const label = timeAvailable === '30+' ? '30 minutes or more' : `about ${timeAvailable} minutes`;
    constraints.push(`Time available: ${label}.`);
  }
  if (avoid) constraints.push(`Must avoid these ingredients: ${avoid}.`);

  return `Create one recipe for this goal: "${goal}".
${constraints.length ? constraints.join(' ') : 'No other constraints.'}

Return ONLY strict JSON matching exactly this shape, no markdown, no preamble:
{
  "title": "string",
  "description": "one to two sentence description",
  "servings": number,
  "prepTimeMinutes": number,
  "goal": "string, short label for the goal this serves",
  "keyNutrients": [{"name": "string", "benefit": "one short sentence"}],
  "ingredients": [{"amount": number or null, "unit": "string", "item": "string"}],
  "steps": ["string", "..."],
  "tip": "one short helpful tip"
}
Include 3-6 key nutrients, a realistic ingredient list, and 3-8 clear steps.`;
}

function buildChatSystemPrompt(context) {
  const base =
    "You are the in-app assistant for Petra's App, a calm daily companion app with market news, AI news, and wellness recipes. Be warm, concise, and genuinely helpful. Use short paragraphs. If you don't know something specific (like real-time prices), say so honestly instead of guessing.";

  if (!context) return base;

  switch (context.type) {
    case 'investing-tab': {
      const items = context.items || [];
      if (items.length === 0) return base;
      const list = items
        .map((it) => `- ${it.headline}: ${it.summary}`)
        .join('\n');
      return `${base}\n\nShe is currently looking at today's Investing briefing. Here are the stories currently visible to her:\n${list}\n\nAnswer questions with this context in mind when relevant.`;
    }
    case 'ai-news-tab': {
      const items = context.items || [];
      if (items.length === 0) return base;
      const list = items
        .map((it) => `- ${it.headline}: ${it.summary}`)
        .join('\n');
      return `${base}\n\nShe is currently looking at today's AI News briefing. Here are the stories currently visible to her:\n${list}\n\nAnswer questions with this context in mind when relevant.`;
    }
    case 'recipes-tab':
      return `${base}\n\nShe is currently on the Recipes tab, which generates recipes on demand based on wellness goals (e.g. strong hair, glowing skin, energy, sleep, immunity, focus, digestion).`;
    case 'article':
      return `${base}\n\nShe currently has this article open:\nHeadline: ${context.item.headline}\nSummary: ${context.item.longSummary}\nWhy it matters: ${context.item.whyItMatters}\nSource: ${context.item.sourceName}\n\nAnswer questions about this article specifically when relevant.`;
    case 'recipe': {
      const r = context.recipe;
      const ingredients = r.ingredients
        .map((ing) => `${ing.amount ?? ''} ${ing.unit} ${ing.item}`.trim())
        .join(', ');
      return `${base}\n\nShe currently has this recipe open:\nTitle: ${r.title}\nGoal: ${r.goal}\nServings: ${r.servings}\nIngredients: ${ingredients}\nSteps: ${r.steps.join(' | ')}\n\nAnswer questions about this recipe specifically when relevant, such as ingredient swaps or storage.`;
    }
    default:
      return base;
  }
}

module.exports = {
  DIGEST_SYSTEM_PROMPT,
  buildDigestUserPrompt,
  buildSimplifyPrompt,
  RECIPE_SYSTEM_PROMPT,
  buildRecipePrompt,
  buildChatSystemPrompt,
};
