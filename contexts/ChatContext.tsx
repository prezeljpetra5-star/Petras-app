import React, { createContext, useContext, useMemo, useState } from 'react';
import type { ChatContextSource } from '@/lib/types';

type ChatContextValue = {
  source: ChatContextSource;
  setSource: (source: ChatContextSource) => void;
};

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatContextProvider({ children }: { children: React.ReactNode }) {
  const [source, setSource] = useState<ChatContextSource>({ type: 'investing-tab' });
  const value = useMemo(() => ({ source, setSource }), [source]);
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChatContext() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChatContext must be used within ChatContextProvider');
  return ctx;
}

export function starterQuestionsFor(source: ChatContextSource): string[] {
  switch (source.type) {
    case 'investing-tab':
      return [
        "What does today's market mood mean for me?",
        'Explain the biggest story in simple terms',
        'What should I keep an eye on this week?',
      ];
    case 'ai-news-tab':
      return [
        "What's the most important AI story today?",
        'How could this affect regular people?',
        'Explain this like I\'m new to AI',
      ];
    case 'recipes-tab':
      return [
        'Suggest a goal based on how I\'m feeling',
        'What ingredients boost energy?',
        'Give me a quick 5-minute recipe idea',
      ];
    case 'article':
      return [
        'Why does this matter for my savings?',
        'Can you explain this more simply?',
        'What happens next with this story?',
      ];
    case 'recipe':
      return [
        'Can I swap an ingredient?',
        'How do I store leftovers?',
        'Make this recipe simpler',
      ];
    default:
      return [];
  }
}
