"use client";

import { useCallback, useEffect, useState } from "react";
import { browserApi, ApiError } from "@/lib/api";
import type { User } from "@/types/api";

interface SessionState {
  user: User | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useSession(): SessionState {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const data = await browserApi.getSession(signal);
      setUser(data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setUser(null);
      } else if ((err as Error).name !== "AbortError") {
        setError(err as Error);
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const refresh = useCallback(async () => {
    await load();
  }, [load]);

  return { user, loading, error, refresh };
}
