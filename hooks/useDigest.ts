import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchDigest } from '@/lib/api';
import { getCachedDigest, isStale, setCachedDigest } from '@/lib/storage';
import { haptics } from '@/lib/haptics';
import type { Digest } from '@/lib/types';

export function useDigest(kind: 'investing' | 'ai-news') {
  const [digest, setDigest] = useState<Digest | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadedOnce = useRef(false);

  const load = useCallback(
    async (opts: { force?: boolean } = {}) => {
      const { force = false } = opts;
      const cached = await getCachedDigest(kind);
      if (cached && !force) {
        setDigest(cached.digest);
        setLastUpdated(cached.fetchedAt);
        setLoading(false);
        if (!isStale(cached.fetchedAt)) {
          return;
        }
      }

      try {
        if (cached) setRefreshing(true);
        const fresh = await fetchDigest(kind);
        await setCachedDigest(kind, fresh);
        setDigest(fresh);
        setLastUpdated(new Date().toISOString());
        setError(null);
      } catch (e) {
        if (!cached) {
          setError(e instanceof Error ? e.message : 'Something went wrong.');
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [kind]
  );

  const refresh = useCallback(async () => {
    haptics.refresh();
    setRefreshing(true);
    await load({ force: true });
  }, [load]);

  useEffect(() => {
    if (loadedOnce.current) return;
    loadedOnce.current = true;
    load();
  }, [load]);

  return { digest, lastUpdated, loading, refreshing, error, refresh, reload: load };
}
