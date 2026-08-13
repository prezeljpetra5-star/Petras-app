const Anthropic = require('@anthropic-ai/sdk');

const MODEL = 'claude-sonnet-4-6';

if (!process.env.ANTHROPIC_API_KEY) {
  console.warn(
    '[server] ANTHROPIC_API_KEY is not set. Add it to server/.env — see server/.env.example.'
  );
}

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/**
 * Extracts the concatenated text from a non-streaming Anthropic response.
 */
function textFromMessage(message) {
  return message.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('');
}

/**
 * Strips accidental markdown code fences from a model response so JSON.parse
 * doesn't choke on models that ignore the "no markdown" instruction.
 */
function stripCodeFences(text) {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced ? fenced[1].trim() : trimmed;
}

async function completeJSON({ system, user, maxTokens = 2000 }) {
  const message = await client.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    temperature: 0.4,
    system,
    messages: [{ role: 'user', content: user }],
  });
  const raw = stripCodeFences(textFromMessage(message));
  return JSON.parse(raw);
}

module.exports = { client, MODEL, textFromMessage, stripCodeFences, completeJSON };
