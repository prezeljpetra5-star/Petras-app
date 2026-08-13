const express = require('express');
const { completeJSON } = require('../anthropic');
const { buildSimplifyPrompt } = require('../prompts');

const router = express.Router();

router.post('/simplify', async (req, res) => {
  const { headline, summary } = req.body || {};
  if (!headline || !summary) {
    return res.status(400).json({ error: 'headline and summary are required.' });
  }

  try {
    const { system, user } = buildSimplifyPrompt(headline, summary);
    const result = await completeJSON({ system, user, maxTokens: 300 });
    res.json({ simpleSummary: result.simpleSummary || summary });
  } catch (err) {
    console.error('[simplify] error', err);
    res.status(500).json({ error: 'Could not simplify this right now.' });
  }
});

module.exports = router;
