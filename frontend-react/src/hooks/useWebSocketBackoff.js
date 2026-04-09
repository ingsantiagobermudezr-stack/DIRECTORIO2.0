import { useEffect, useRef, useState } from "react";

export function useWebSocketBackoff({
  url,
  enabled = true,
  onMessage,
  onOpen,
  onClose,
  onError,
  baseDelayMs = 1000,
  maxDelayMs = 30000,
}) {
  const socketRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const stopRef = useRef(false);
  const attemptRef = useRef(0);
  const onMessageRef = useRef(onMessage);
  const onOpenRef = useRef(onOpen);
  const onCloseRef = useRef(onClose);
  const onErrorRef = useRef(onError);

  const [status, setStatus] = useState("idle");
  const [attempt, setAttempt] = useState(0);
  const [reconnectInMs, setReconnectInMs] = useState(0);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    onOpenRef.current = onOpen;
  }, [onOpen]);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    if (!enabled || !url) {
      return undefined;
    }

    stopRef.current = false;

    const clearReconnect = () => {
      if (reconnectTimerRef.current) {
        window.clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    };

    const scheduleReconnect = () => {
      if (stopRef.current) {
        return;
      }

      attemptRef.current += 1;
      setAttempt(attemptRef.current);

      const delay = Math.min(baseDelayMs * 2 ** (attemptRef.current - 1), maxDelayMs);
      setReconnectInMs(delay);
      setStatus("reconnecting");

      reconnectTimerRef.current = window.setTimeout(() => {
        connect();
      }, delay);
    };

    const connect = () => {
      if (stopRef.current) {
        return;
      }

      clearReconnect();
      setStatus("connecting");

      const socket = new WebSocket(url);
      socketRef.current = socket;

      socket.onopen = () => {
        attemptRef.current = 0;
        setAttempt(0);
        setReconnectInMs(0);
        setStatus("connected");
        if (onOpenRef.current) {
          onOpenRef.current();
        }
      };

      socket.onmessage = (event) => {
        if (onMessageRef.current) {
          onMessageRef.current(event);
        }
      };

      socket.onerror = () => {
        if (onErrorRef.current) {
          onErrorRef.current();
        }
      };

      socket.onclose = () => {
        setStatus("disconnected");
        if (onCloseRef.current) {
          onCloseRef.current();
        }
        scheduleReconnect();
      };
    };

    connect();

    return () => {
      stopRef.current = true;
      clearReconnect();
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [baseDelayMs, enabled, maxDelayMs, url]);

  return {
    status: enabled && url ? status : "idle",
    attempt,
    reconnectInMs,
    isConnected: enabled && url ? status === "connected" : false,
  };
}
