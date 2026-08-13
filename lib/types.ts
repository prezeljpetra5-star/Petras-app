export type MarketMood = 'bullish' | 'neutral' | 'bearish';

export type DigestCategory =
  | 'models-research'
  | 'products'
  | 'business'
  | 'policy'
  | 'general';

export type DigestItem = {
  id: string;
  headline: string;
  summary: string;
  longSummary: string;
  simpleSummary?: string;
  whyItMatters: string;
  sourceName: string;
  sourceUrl: string;
  category: DigestCategory;
  publishedAt: string | null;
};

export type Digest = {
  kind: 'investing' | 'ai-news';
  generatedAt: string;
  mood?: MarketMood;
  moodReason?: string;
  items: DigestItem[];
};

export type NutrientNote = {
  name: string;
  benefit: string;
};

export type RecipeIngredient = {
  amount: number | null;
  unit: string;
  item: string;
};

export type Recipe = {
  id: string;
  title: string;
  description: string;
  servings: number;
  prepTimeMinutes: number;
  goal: string;
  keyNutrients: NutrientNote[];
  ingredients: RecipeIngredient[];
  steps: string[];
  tip: string;
  createdAt: string;
};

export type RecipeRequest = {
  goal: string;
  diet?: 'none' | 'vegetarian' | 'vegan' | 'gluten-free' | 'dairy-free';
  timeAvailable?: '5' | '15' | '30+';
  avoid?: string;
};

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  createdAt: string;
};

export type ChatContextSource =
  | { type: 'investing-tab'; items?: DigestItem[] }
  | { type: 'ai-news-tab'; items?: DigestItem[] }
  | { type: 'recipes-tab' }
  | { type: 'article'; item: DigestItem }
  | { type: 'recipe'; recipe: Recipe };
