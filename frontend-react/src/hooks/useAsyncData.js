import { useCallback, useEffect, useRef, useState } from "react";

const UNSET = {};

export function useAsyncData(fetcher, dependency = null) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [nonce, setNonce] = useState(0);
  const fetcherRef = useRef(fetcher);
  const prevDependencyRef = useRef(UNSET);

  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcherRef.current();
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reload = useCallback(() => {
    setNonce((n) => n + 1);
  }, []);

  useEffect(() => {
    const prev = prevDependencyRef.current;

    // Skip if dependency hasn't changed
    if (prev !== UNSET && Object.is(prev, dependency)) {
      return;
    }

    prevDependencyRef.current = dependency;
    execute();
  }, [execute, dependency]);

  useEffect(() => {
    if (nonce > 0) {
      prevDependencyRef.current = dependency;
      execute();
    }
  }, [nonce]);

  return { data, loading, error, reload, setData };
}
