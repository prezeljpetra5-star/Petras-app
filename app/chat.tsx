import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { useChatContext, starterQuestionsFor } from '@/contexts/ChatContext';
import { streamChat } from '@/lib/api';
import { getChatHistory, setChatHistory } from '@/lib/storage';
import { haptics } from '@/lib/haptics';
import type { ChatMessage } from '@/lib/types';

const THREAD_ID = 'main';

function contextLabel(source: ReturnType<typeof useChatContext>['source']): string {
  switch (source.type) {
    case 'investing-tab':
      return "Talking about today's Investing briefing";
    case 'ai-news-tab':
      return "Talking about today's AI News briefing";
    case 'recipes-tab':
      return 'Talking about recipes';
    case 'article':
      return `About: ${source.item.headline}`;
    case 'recipe':
      return `About: ${source.recipe.title}`;
    default:
      return '';
  }
}

export default function ChatScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { source } = useChatContext();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    getChatHistory(THREAD_ID).then((history) => {
      setMessages(history);
      setLoaded(true);
    });
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const persist = (next: ChatMessage[]) => {
    setMessages(next);
    setChatHistory(THREAD_ID, next);
  };

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    haptics.tap();
    setInput('');

    const userMessage: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: trimmed,
      createdAt: new Date().toISOString(),
    };
    const assistantId = `a-${Date.now()}`;
    const withUser = [...messages, userMessage];
    persist(withUser);
    setSending(true);

    const withPlaceholder = [
      ...withUser,
      { id: assistantId, role: 'assistant' as const, text: '', createdAt: new Date().toISOString() },
    ];
    setMessages(withPlaceholder);

    const controller = new AbortController();
    abortRef.current = controller;
    let full = '';

    try {
      await streamChat(
        withUser,
        source,
        (delta) => {
          full += delta;
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, text: full } : m))
          );
        },
        controller.signal
      );
      persist([...withUser, { id: assistantId, role: 'assistant', text: full, createdAt: new Date().toISOString() }]);
    } catch {
      const errorText = "Sorry, I couldn't respond just now. Please try again.";
      persist([...withUser, { id: assistantId, role: 'assistant', text: errorText, createdAt: new Date().toISOString() }]);
    } finally {
      setSending(false);
    }
  };

  const starters = starterQuestionsFor(source);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <View style={[styles.flex, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: colors.text }]}>Chat</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]} numberOfLines={1}>
              {contextLabel(source)}
            </Text>
          </View>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Ionicons name="close" size={26} color={colors.textMuted} />
          </Pressable>
        </View>

        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.messages}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {loaded && messages.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Ask me anything</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                I can see what you're currently looking at.
              </Text>
              <View style={styles.starters}>
                {starters.map((q) => (
                  <Pressable
                    key={q}
                    onPress={() => send(q)}
                    style={[styles.starterChip, { borderColor: colors.border, backgroundColor: colors.surface }]}
                  >
                    <Text style={[styles.starterText, { color: colors.text }]}>{q}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : (
            messages.map((m) => (
              <View
                key={m.id}
                style={[
                  styles.bubble,
                  m.role === 'user'
                    ? [styles.userBubble, { backgroundColor: colors.accent }]
                    : [styles.assistantBubble, { backgroundColor: colors.surface, borderColor: colors.border }],
                ]}
              >
                {m.role === 'assistant' && m.text === '' && sending ? (
                  <ActivityIndicator size="small" color={colors.textMuted} />
                ) : (
                  <Text style={[styles.bubbleText, { color: m.role === 'user' ? '#FFF' : colors.text }]}>
                    {m.text}
                  </Text>
                )}
              </View>
            ))
          )}
        </ScrollView>

        <View style={[styles.inputRow, { borderTopColor: colors.border, paddingBottom: insets.bottom + 10 }]}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Type a message"
            placeholderTextColor={colors.textMuted}
            style={[styles.input, { color: colors.text, backgroundColor: colors.surfaceRaised, borderColor: colors.border }]}
            multiline
            onSubmitEditing={() => send(input)}
          />
          <Pressable
            onPress={() => send(input)}
            disabled={!input.trim() || sending}
            style={[
              styles.sendButton,
              { backgroundColor: !input.trim() || sending ? colors.border : colors.accent },
            ]}
          >
            <Ionicons name="arrow-up" size={20} color="#FFF" />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  messages: {
    padding: 16,
    gap: 10,
    flexGrow: 1,
  },
  emptyWrap: {
    paddingTop: 24,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  starters: {
    width: '100%',
    gap: 10,
  },
  starterChip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  starterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  bubble: {
    maxWidth: '84%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  userBubble: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
    minWidth: 40,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 21,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  input: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 120,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
