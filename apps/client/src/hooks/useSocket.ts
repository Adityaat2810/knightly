import { useEffect, useState, useRef } from "react";
import { useUser } from "./useUser";

const WS_URL = import.meta.env.VITE_APP_WS_URL ?? 'ws://localhost:8080';

export const useSocket = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const user = useUser()

  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting');
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connectSocket = () => {
    console.log("Attempting to connect to WebSocket...");
    setConnectionStatus('connecting');

    try {
      const ws = new WebSocket(`${WS_URL}?token=${user.token}`);


      ws.onopen = () => {
        setSocket(ws);
        setConnectionStatus('connected');
        reconnectAttempts.current = 0;
      };

      ws.onclose = (event) => {
        setSocket(null);
        setConnectionStatus('disconnected');

        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;

          reconnectTimeoutRef.current = setTimeout(() => {
            connectSocket();
          }, 2000 * reconnectAttempts.current); // Exponential backoff
        } else if (reconnectAttempts.current >= maxReconnectAttempts) {
          setConnectionStatus('error');
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setConnectionStatus('error');
      };

      return ws;
    } catch (error) {
      console.error("Failed to create WebSocket:", error);
      setConnectionStatus('error');
      return null;
    }
  };

  useEffect(() => {
    const ws = connectSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close(1000, "Component unmounting");
      }
    };
  }, []);

  return { socket, connectionStatus };
};