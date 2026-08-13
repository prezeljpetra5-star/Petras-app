import { fetch as expoFetch } from 'expo/fetch';
import { API_BASE_URL } from './config';
import type { ChatContextSource, ChatMessage, Digest, Recipe, RecipeRequest } from './types';

export class ApiError extends Error {}

export async function fetchDigest(kind: 'investing' | 'ai-news'): Promise<Digest> {
  const res = await fetch(`${API_BASE_URL}/api/digest?kind=${kind}`);
  if (!res.ok) {
    throw new ApiError(`Could not load the ${kind} briefing (status ${res.status}).`);
  }
  return (await res.json()) as Digest;
}

export async function fetchSimpleSummary(headline: string, summary: string): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/api/simplify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ headline, summary }),
  });
  if (!res.ok) throw new ApiError('Could not simplify this item.');
  const data = (await res.json()) as { simpleSummary: string };
  return data.simpleSummary;
}

export async function generateRecipe(request: RecipeRequest): Promise<Recipe> {
  const res = await fetch(`${API_BASE_URL}/api/recipe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!res.ok) {
    throw new ApiError('Could not come up with a recipe just now.');
  }
  return (await res.json()) as Recipe;
}

export async function streamChat(
  messages: ChatMessage[],
  context: ChatContextSource,
  onToken: (delta: string) => void,
  signal?: AbortSignal
): Promise<string> {
  const res = await expoFetch(`${API_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: messages.map((m) => ({ role: m.role, text: m.text })),
      context,
    }),
    signal,
  });

  if (!res.ok || !res.body) {
    throw new ApiError('The chat is unavailable right now.');
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let full = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      if (!line.startsWith('data:')) continue;
      const payload = line.slice(5).trim();
      if (!payload || payload === '[DONE]') continue;
      try {
        const parsed = JSON.parse(payload) as { delta?: string; error?: string };
        if (parsed.error) throw new ApiError(parsed.error);
        if (parsed.delta) {
          full += parsed.delta;
          onToken(parsed.delta);
        }
      } catch {
        // ignore malformed keep-alive chunks
      }
    }
  }

  return full;
}
