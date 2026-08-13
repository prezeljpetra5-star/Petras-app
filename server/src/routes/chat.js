const express = require('express');
const { client, MODEL } = require('../anthropic');
const { buildChatSystemPrompt } = require('../prompts');

const router = express.Router();

router.post('/chat', async (req, res) => {
  const { messages, context } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages is required.' });
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  const send = (payload) => {
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  };

  try {
    const anthropicMessages = messages
      .filter((m) => m && typeof m.text === 'string' && m.text.trim())
      .map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.text }));

    const stream = client.messages.stream({
      model: MODEL,
      max_tokens: 1024,
      system: buildChatSystemPrompt(context),
      messages: anthropicMessages,
    });

    stream.on('text', (delta) => {
      send({ delta });
    });

    stream.on('error', (err) => {
      console.error('[chat] stream error', err);
      send({ error: 'The chat connection was interrupted.' });
      res.end();
    });

    await stream.finalMessage();
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    console.error('[chat] error', err);
    send({ error: 'Could not reach the assistant right now.' });
    res.end();
  }

  req.on('close', () => {
    res.end();
  });
});

module.exports = router;
