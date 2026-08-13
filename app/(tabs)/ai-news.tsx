import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useTheme } from '@/theme/ThemeProvider';
import { useChatContext } from '@/contexts/ChatContext';
import { useDigest } from '@/hooks/useDigest';
import { TabHeader } from '@/components/TabHeader';
import { MoodBadge } from '@/components/MoodBadge';
import { ArticleCard } from '@/components/ArticleCard';
import { Chips, type Chip } from '@/components/Chips';
import { DigestCardSkeleton, MoodBadgeSkeleton } from '@/components/Skeleton';
import { EmptyState } from '@/components/EmptyState';
import {
  dismissArticle,
  getDismissedIds,
  getSavedArticles,
  toggleSavedArticle,
} from '@/lib/storage';
import { fetchSimpleSummary } from '@/lib/api';
import type { DigestCategory, DigestItem } from '@/lib/types';

type FilterKey = 'all' | DigestCategory;

const FILTERS: Chip<FilterKey>[] = [
  { key: 'all', label: 'All' },
  { key: 'models-research', label: 'Models & Research' },
  { key: 'products', label: 'Products' },
  { key: 'business', label: 'Business' },
  { key: 'policy', label: 'Policy' },
];

export default function AiNewsScreen() {
  const { colors, accentFor } = useTheme();
  const accent = accentFor('aiNews');
  const { setSource } = useChatContext();
  const { digest, lastUpdated, loading, refreshing, error, refresh } = useDigest('ai-news');
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<FilterKey>('all');
  const [eliItems, setEliItems] = useState<Set<string>>(new Set());
  const [eliLoading, setEliLoading] = useState<Set<string>>(new Set());
  const [simpleSummaries, setSimpleSummaries] = useState<Record<string, string>>({});

  useEffect(() => {
    getDismissedIds().then(setDismissedIds);
    getSavedArticles().then((list) => setSavedIds(new Set(list.map((a) => a.id))));
  }, []);

  const items = useMemo(() => {
    const base = (digest?.items ?? []).filter((item) => !dismissedIds.has(item.id));
    if (filter === 'all') return base;
    return base.filter((item) => item.category === filter);
  }, [digest, dismissedIds, filter]);

  useFocusEffect(
    useCallback(() => {
      setSource({ type: 'ai-news-tab', items });
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

  const handleToggleEli = useCallback(
    async (item: DigestItem) => {
      const isActive = eliItems.has(item.id);
      if (isActive) {
        setEliItems((prev) => {
          const next = new Set(prev);
          next.delete(item.id);
          return next;
        });
        return;
      }
      if (simpleSummaries[item.id]) {
        setEliItems((prev) => new Set(prev).add(item.id));
        return;
      }
      setEliLoading((prev) => new Set(prev).add(item.id));
      try {
        const simple = await fetchSimpleSummary(item.headline, item.longSummary);
        setSimpleSummaries((prev) => ({ ...prev, [item.id]: simple }));
        setEliItems((prev) => new Set(prev).add(item.id));
      } catch {
        // silently ignore; the toggle just stays off
      } finally {
        setEliLoading((prev) => {
          const next = new Set(prev);
          next.delete(item.id);
          return next;
        });
      }
    },
    [eliItems, simpleSummaries]
  );

  if (error && !digest) {
    return (
      <View style={[styles.flex, { backgroundColor: colors.background }]}>
        <TabHeader title="AI News" accent={accent} />
        <EmptyState
          icon="cloud-offline-outline"
          title="Couldn't load today's AI news"
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
              title="AI News"
              accent={accent}
              lastUpdated={lastUpdated}
              onBookmarkPress={() => router.push('/favorites')}
            />
            {loading ? (
              <MoodBadgeSkeleton />
            ) : digest?.mood ? (
              <MoodBadge mood={digest.mood} reason={digest.moodReason} />
            ) : null}
            {!loading ? (
              <View style={styles.filters}>
                <Chips chips={FILTERS} selected={filter} onSelect={setFilter} accent={accent} />
              </View>
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
              icon="sparkles-outline"
              title="Nothing here"
              message="No stories match this filter right now. Try another category or refresh."
              actionLabel="Show all"
              onAction={() => setFilter('all')}
            />
          )
        }
        renderItem={({ item }) => {
          const withSimple: DigestItem = simpleSummaries[item.id]
            ? { ...item, simpleSummary: simpleSummaries[item.id] }
            : item;
          return (
            <ArticleCard
              item={withSimple}
              accent={accent}
              saved={savedIds.has(item.id)}
              onToggleSave={() => handleToggleSave(item)}
              onDismiss={() => handleDismiss(item.id)}
              showCategory
              eliMode={eliItems.has(item.id)}
              eliLoading={eliLoading.has(item.id)}
              onToggleEli={() => handleToggleEli(item)}
              onExpand={() => setSource({ type: 'article', item })}
            />
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  listContent: { paddingHorizontal: 16, paddingBottom: 120 },
  filters: { paddingHorizontal: 4, marginBottom: 8 },
});
