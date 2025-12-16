// src/hooks/useWebsocket.js
import { useEffect, useRef } from "react";

/**
 * useWebsocket(url, { onMessage, protocols, reconnectDelay })
 * - calls onMessage(parsedData) for each JSON message.
 */
export default function useWebsocket(url, { onMessage, protocols = [], reconnectDelay = 3000 } = {}) {
  const wsRef = useRef(null);
  const reconnectRef = useRef(null);

  useEffect(() => {
    let closedByUser = false;

    function connect() {
      try {
        const ws = new (window.WebSocket || window.MozWebSocket)(url, protocols);
        wsRef.current = ws;

        ws.onopen = () => {
          console.debug("[WS] connected", url);
        };
        ws.onmessage = (ev) => {
          try {
            const data = JSON.parse(ev.data);
            if (typeof onMessage === "function") onMessage(data);
          } catch (e) {
            console.warn("[WS] invalid json", e, ev.data);
          }
        };
        ws.onclose = () => {
          wsRef.current = null;
          if (!closedByUser) {
            console.debug("[WS] closed, reconnecting in", reconnectDelay);
            reconnectRef.current = setTimeout(connect, reconnectDelay);
          }
        };
        ws.onerror = (err) => {
          console.error("[WS] error", err);
          ws.close();
        };
      } catch (err) {
        console.error("[WS] connect failed", err);
      }
    }

    connect();

    return () => {
      closedByUser = true;
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [url, JSON.stringify(protocols), reconnectDelay, onMessage]);
}
