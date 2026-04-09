import { useCallback, useEffect, useRef, useState } from "react";

export function useAsyncData(fetcher, dependency = null) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [nonce, setNonce] = useState(0);
  const fetcherRef = useRef(fetcher);

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
    setNonce((prev) => prev + 1);
  }, []);

  useEffect(() => {
    execute();
  }, [execute, dependency, nonce]);

  return { data, loading, error, reload, setData };
}
