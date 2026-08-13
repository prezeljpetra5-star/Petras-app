const express = require('express');
const crypto = require('crypto');
const { collectInvestingArticles, collectAiNewsArticles } = require('../feeds');
const { completeJSON, DIGEST_SYSTEM_PROMPT: SYSTEM } = require('../anthropic');
const { buildDigestUserPrompt } = require('../prompts');
const cache = require('../cache');

const router = express.Router();
const CACHE_TTL_MS = 10 * 60 * 1000;

router.get('/digest', async (req, res) => {
  const kind = req.query.kind === 'ai-news' ? 'ai-news' : req.query.kind === 'investing' ? 'investing' : null;
  if (!kind) {
    return res.status(400).json({ error: 'Query param "kind" must be "investing" or "ai-news".' });
  }

  const cached = cache.get(`digest:${kind}`);
  if (cached) return res.json(cached);

  try {
    const articles =
      kind === 'investing' ? await collectInvestingArticles() : await collectAiNewsArticles();

    if (articles.length === 0) {
      return res.status(502).json({ error: 'No news sources were reachable right now.' });
    }

    const trimmed = articles.slice(0, 30);
    const result = await completeJSON({
      system: SYSTEM,
      user: buildDigestUserPrompt(kind, trimmed),
      maxTokens: 3000,
    });

    const now = new Date().toISOString();
    const items = (result.items || [])
      .map((it) => {
        const source = trimmed[it.index];
        if (!source) return null;
        return {
          id: crypto.randomUUID(),
          headline: it.headline || source.headline,
          summary: it.summary || '',
          longSummary: it.longSummary || it.summary || '',
          whyItMatters: it.whyItMatters || '',
          sourceName: source.sourceName,
          sourceUrl: source.sourceUrl,
          category: kind === 'ai-news' ? it.category || 'general' : 'general',
          publishedAt: source.publishedAt,
        };
      })
      .filter(Boolean);

    const digest = {
      kind,
      generatedAt: now,
      items,
      ...(kind === 'investing' ? { mood: result.mood || 'neutral', moodReason: result.moodReason || '' } : {}),
    };

    cache.set(`digest:${kind}`, digest, CACHE_TTL_MS);
    res.json(digest);
  } catch (err) {
    console.error('[digest] error', err);
    res.status(500).json({ error: 'Could not generate the briefing right now.' });
  }
});

module.exports = router;
