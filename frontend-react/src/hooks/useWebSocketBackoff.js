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

  const [status, setStatus] = useState("idle");
  const [attempt, setAttempt] = useState(0);
  const [reconnectInMs, setReconnectInMs] = useState(0);

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
        if (onOpen) {
          onOpen();
        }
      };

      socket.onmessage = (event) => {
        if (onMessage) {
          onMessage(event);
        }
      };

      socket.onerror = () => {
        if (onError) {
          onError();
        }
      };

      socket.onclose = () => {
        setStatus("disconnected");
        if (onClose) {
          onClose();
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
  }, [baseDelayMs, enabled, maxDelayMs, onClose, onError, onMessage, onOpen, url]);

  return {
    status: enabled && url ? status : "idle",
    attempt,
    reconnectInMs,
    isConnected: enabled && url ? status === "connected" : false,
  };
}
