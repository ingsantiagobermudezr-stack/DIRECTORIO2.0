import { useEffect, useRef, useState } from "react";

export function usePollingBackoff({
  enabled = true,
  task,
  baseIntervalMs = 15000,
  maxIntervalMs = 120000,
  immediate = true,
}) {
  const timerRef = useRef(null);
  const stopRef = useRef(false);
  const failuresRef = useRef(0);

  const [failures, setFailures] = useState(0);
  const intervalMs = Math.min(baseIntervalMs * 2 ** failures, maxIntervalMs);

  const clearTimer = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    stopRef.current = false;
    failuresRef.current = 0;

    async function tick() {
      if (!enabled || stopRef.current) {
        return;
      }

      let ok = false;
      try {
        ok = await task();
      } catch {
        ok = false;
      }

      if (ok) {
        failuresRef.current = 0;
        setFailures(0);
      } else {
        failuresRef.current += 1;
        setFailures(failuresRef.current);
      }

      const next = Math.min(baseIntervalMs * 2 ** failuresRef.current, maxIntervalMs);

      clearTimer();
      timerRef.current = window.setTimeout(() => {
        tick();
      }, next);
    }

    if (enabled) {
      if (immediate) {
        tick();
      } else {
        clearTimer();
        timerRef.current = window.setTimeout(() => {
          tick();
        }, baseIntervalMs);
      }
    }

    return () => {
      stopRef.current = true;
      clearTimer();
    };
  }, [baseIntervalMs, enabled, immediate, maxIntervalMs, task]);

  return {
    failures,
    intervalMs,
    runNow: task,
  };
}
