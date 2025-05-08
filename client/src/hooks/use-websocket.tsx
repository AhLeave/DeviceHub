import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './use-auth';
import { useToast } from './use-toast';

type WebSocketStatus = 'connecting' | 'connected' | 'disconnected';
type MessageHandler = (data: any) => void;

export function useWebSocket() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [status, setStatus] = useState<WebSocketStatus>('disconnected');
  const socketRef = useRef<WebSocket | null>(null);
  const handlersRef = useRef<Map<string, MessageHandler[]>>(new Map());

  const connect = useCallback(() => {
    if (!user) return;
    
    try {
      if (socketRef.current?.readyState === WebSocket.OPEN) return;
      
      setStatus('connecting');
      
      // Close any existing connection
      if (socketRef.current) {
        socketRef.current.close();
      }
      
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws?userId=${user.id}`;
      const socket = new WebSocket(wsUrl);
      
      socket.onopen = () => {
        setStatus('connected');
        toast({
          title: 'Connected',
          description: 'Real-time connection established.',
        });
      };
      
      socket.onclose = () => {
        setStatus('disconnected');
        // Don't show toast on normal disconnection
      };
      
      socket.onerror = (error) => {
        setStatus('disconnected');
        toast({
          title: 'Connection Error',
          description: 'Could not connect to the server.',
          variant: 'destructive',
        });
        console.error('WebSocket error:', error);
      };
      
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const msgType = data.type || 'message';
          
          const handlers = handlersRef.current.get(msgType) || [];
          handlers.forEach(handler => handler(data));
          
          // Also call global message handlers
          const globalHandlers = handlersRef.current.get('*') || [];
          globalHandlers.forEach(handler => handler(data));
        } catch (error) {
          console.error('Error processing message:', error);
        }
      };
      
      socketRef.current = socket;
    } catch (error) {
      setStatus('disconnected');
      console.error('WebSocket connection error:', error);
    }
  }, [user, toast]);
  
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
      setStatus('disconnected');
    }
  }, []);
  
  const sendMessage = useCallback((data: any) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(data));
      return true;
    }
    return false;
  }, []);
  
  const addMessageHandler = useCallback((type: string, handler: MessageHandler) => {
    if (!handlersRef.current.has(type)) {
      handlersRef.current.set(type, []);
    }
    handlersRef.current.get(type)!.push(handler);
    
    // Return remove function
    return () => {
      const handlers = handlersRef.current.get(type) || [];
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    };
  }, []);
  
  useEffect(() => {
    if (user) {
      connect();
    } else {
      disconnect();
    }
    
    return () => {
      disconnect();
    };
  }, [user, connect, disconnect]);
  
  return {
    status,
    connect,
    disconnect,
    sendMessage,
    addMessageHandler,
  };
}
