"use client";

import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

const STALE_TIME_MS = 30_000;

export interface CacheEntry<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  timestamp: number;
}

interface DataCacheContextType {
  get: <T>(key: string) => CacheEntry<T> | undefined;
  set: <T>(key: string, data: T) => void;
  fetch: <T>(key: string, fetcher: () => Promise<T>) => CacheEntry<T>;
  prefetch: <T>(key: string, fetcher: () => Promise<T>) => void;
  invalidate: (keyPrefix: string) => void;
  invalidateAll: () => void;
}

export type { DataCacheContextType };

const DataCacheContext = createContext<DataCacheContextType | null>(null);

export function useDataCache(): DataCacheContextType {
  const ctx = useContext(DataCacheContext);
  if (!ctx) throw new Error("useDataCache must be used within DataCacheProvider");
  return ctx;
}

function useForceUpdate(): () => void {
  const [, setState] = useState(0);
  return useCallback(() => setState((n) => n + 1), []);
}

export function DataCacheProvider({ children }: { children: React.ReactNode }) {
  const cacheRef = useRef(new Map<string, CacheEntry<unknown>>());
  const forceUpdate = useForceUpdate();

  const get = useCallback(<T,>(key: string): CacheEntry<T> | undefined => {
    return cacheRef.current.get(key) as CacheEntry<T> | undefined;
  }, []);

  const set = useCallback(
    <T,>(key: string, data: T) => {
      cacheRef.current.set(key, {
        data,
        error: null,
        loading: false,
        timestamp: Date.now(),
      });
      forceUpdate();
    },
    [forceUpdate],
  );

  const fetchEntry = useCallback(
    <T,>(key: string, fetcher: () => Promise<T>): CacheEntry<T> => {
      const existing = cacheRef.current.get(key) as CacheEntry<T> | undefined;
      const now = Date.now();

      if (existing && !existing.loading && now - existing.timestamp < STALE_TIME_MS) {
        return existing;
      }

      if (existing?.loading) {
        return existing;
      }

      const entry: CacheEntry<T> = {
        data: existing?.data ?? null,
        error: null,
        loading: true,
        timestamp: existing?.timestamp ?? 0,
      };
      cacheRef.current.set(key, entry);
      forceUpdate();

      fetcher()
        .then((data) => {
          cacheRef.current.set(key, {
            data,
            error: null,
            loading: false,
            timestamp: Date.now(),
          });
          forceUpdate();
        })
        .catch((err) => {
          cacheRef.current.set(key, {
            data: null,
            error: err instanceof Error ? err.message : String(err),
            loading: false,
            timestamp: Date.now(),
          });
          forceUpdate();
        });

      return entry;
    },
    [forceUpdate],
  );

  const prefetch = useCallback(
    <T,>(key: string, fetcher: () => Promise<T>) => {
      const existing = cacheRef.current.get(key) as CacheEntry<T> | undefined;
      const now = Date.now();

      if (existing && !existing.loading && now - existing.timestamp < STALE_TIME_MS) {
        return;
      }

      cacheRef.current.set(key, {
        data: existing?.data ?? null,
        error: null,
        loading: true,
        timestamp: existing?.timestamp ?? 0,
      });
      forceUpdate();

      fetcher()
        .then((data) => {
          cacheRef.current.set(key, {
            data,
            error: null,
            loading: false,
            timestamp: Date.now(),
          });
          forceUpdate();
        })
        .catch(() => {});
    },
    [forceUpdate],
  );

  const invalidate = useCallback(
    (keyPrefix: string) => {
      for (const key of cacheRef.current.keys()) {
        if (key.startsWith(keyPrefix)) {
          cacheRef.current.delete(key);
        }
      }
      forceUpdate();
    },
    [forceUpdate],
  );

  const invalidateAll = useCallback(() => {
    cacheRef.current.clear();
    forceUpdate();
  }, [forceUpdate]);

  const value: DataCacheContextType = {
    get,
    set,
    fetch: fetchEntry,
    prefetch,
    invalidate,
    invalidateAll,
  };

  return (
    <DataCacheContext.Provider value={value}>
      {children}
    </DataCacheContext.Provider>
  );
}

export function useCache<T>(
  key: string,
  fetcher: () => Promise<T>,
): {
  data: T | null;
  error: string | null;
  loading: boolean;
  refresh: () => void;
} {
  const cache = useDataCache();
  const fetcherRef = useRef(fetcher);
  useEffect(() => { fetcherRef.current = fetcher; }, [fetcher]);

  const entry = cache.get<T>(key);
  // Date.now() used for cache staleness check — acceptable impurity in render
  // eslint-disable-next-line react-hooks/purity
  const needsFetch = !entry || (!entry.loading && entry.timestamp + STALE_TIME_MS <= Date.now());

  useEffect(() => {
    if (needsFetch) {
      cache.fetch<T>(key, () => fetcherRef.current());
    }
  }, [key, needsFetch, cache]);

  const current = entry ?? {
    data: null,
    error: null,
    loading: !entry,
    timestamp: 0,
  };

  const refresh = useCallback(() => {
    cache.invalidate(key);
    cache.fetch<T>(key, () => fetcherRef.current());
  }, [cache, key]);

  return {
    data: current.data,
    error: current.error,
    loading: current.loading,
    refresh,
  };
}