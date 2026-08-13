import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useTheme } from '@/theme/ThemeProvider';
import { useChatContext } from '@/contexts/ChatContext';
import { useDigest } from '@/hooks/useDigest';
import { TabHeader } from '@/components/TabHeader';
import { MoodBadge } from '@/components/MoodBadge';
import { ArticleCard } from '@/components/ArticleCard';
import { DigestCardSkeleton, MoodBadgeSkeleton } from '@/components/Skeleton';
import { EmptyState } from '@/components/EmptyState';
import {
  dismissArticle,
  getDismissedIds,
  getSavedArticles,
  toggleSavedArticle,
} from '@/lib/storage';
import type { DigestItem } from '@/lib/types';
import { router } from 'expo-router';

export default function InvestingScreen() {
  const { colors, accentFor } = useTheme();
  const accent = accentFor('investing');
  const { setSource } = useChatContext();
  const { digest, lastUpdated, loading, refreshing, error, refresh } = useDigest('investing');
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    getDismissedIds().then(setDismissedIds);
    getSavedArticles().then((list) => setSavedIds(new Set(list.map((a) => a.id))));
  }, []);

  const items = useMemo(
    () => (digest?.items ?? []).filter((item) => !dismissedIds.has(item.id)),
    [digest, dismissedIds]
  );

  useFocusEffect(
    useCallback(() => {
      setSource({ type: 'investing-tab', items });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [setSource, items])
  );

  const handleDismiss = useCallback(async (id: string) => {
    setDismissedIds((prev) => new Set(prev).add(id));
    await dismissArticle(id);
  }, []);

  const handleToggleSave = useCallback(async (item: DigestItem) => {
    const nowSaved = await toggleSavedArticle(item);
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (nowSaved) next.add(item.id);
      else next.delete(item.id);
      return next;
    });
  }, []);

  if (error && !digest) {
    return (
      <View style={[styles.flex, { backgroundColor: colors.background }]}>
        <TabHeader title="Investing" accent={accent} />
        <EmptyState
          icon="cloud-offline-outline"
          title="Couldn't load today's briefing"
          message={error}
          actionLabel="Try again"
          onAction={refresh}
        />
      </View>
    );
  }

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <FlatList
        data={loading ? [] : items}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing && !loading} onRefresh={refresh} tintColor={accent} />
        }
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            <TabHeader
              title="Investing"
              accent={accent}
              lastUpdated={lastUpdated}
              onBookmarkPress={() => router.push('/favorites')}
            />
            {loading ? (
              <MoodBadgeSkeleton />
            ) : digest?.mood ? (
              <MoodBadge mood={digest.mood} reason={digest.moodReason} />
            ) : null}
          </>
        }
        ListEmptyComponent={
          loading ? (
            <View>
              <DigestCardSkeleton />
              <DigestCardSkeleton />
              <DigestCardSkeleton />
            </View>
          ) : (
            <EmptyState
              icon="newspaper-outline"
              title="All caught up"
              message="You've cleared today's briefing. Pull to refresh for the latest markets news."
              actionLabel="Refresh"
              onAction={refresh}
            />
          )
        }
        renderItem={({ item }) => (
          <ArticleCard
            item={item}
            accent={accent}
            saved={savedIds.has(item.id)}
            onToggleSave={() => handleToggleSave(item)}
            onDismiss={() => handleDismiss(item.id)}
            onExpand={() => setSource({ type: 'article', item })}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  listContent: { paddingHorizontal: 16, paddingBottom: 120 },
});
