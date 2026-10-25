'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { ChatMessage } from '../api/messaging';

export interface UseMessagingSocketOptions {
  conversationId?: string | null;
  onMessageReceived?: (message: ChatMessage) => void;
  onMessagesRead?: (payload: {
    conversationId: string;
    readBy: string;
    readAt: string;
  }) => void;
  onConversationUpdated?: (payload: {
    conversationId: string;
    lastMessage: ChatMessage;
  }) => void;
  onUnreadCountUpdated?: (payload: { unreadCount: number }) => void;
}

export function useMessagingSocket(options: UseMessagingSocketOptions = {}) {
  const {
    conversationId,
    onMessageReceived,
    onMessagesRead,
    onConversationUpdated,
    onUnreadCountUpdated,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Keep callback references fresh without triggering reconnection
  const onMessageReceivedRef = useRef(onMessageReceived);
  onMessageReceivedRef.current = onMessageReceived;

  const onMessagesReadRef = useRef(onMessagesRead);
  onMessagesReadRef.current = onMessagesRead;

  const onConversationUpdatedRef = useRef(onConversationUpdated);
  onConversationUpdatedRef.current = onConversationUpdated;

  const onUnreadCountUpdatedRef = useRef(onUnreadCountUpdated);
  onUnreadCountUpdatedRef.current = onUnreadCountUpdated;

  const conversationIdRef = useRef(conversationId);
  conversationIdRef.current = conversationId;

  // Initialize socket connection
  useEffect(() => {
    let isCancelled = false;

    async function initSocket() {
      try {
        // Fetch current session access token
        const res = await fetch('/api/auth/token');
        if (!res.ok) {
          return;
        }
        const data = await res.json();
        const token = data.token;

        if (isCancelled || !token) return;

        const wsUrl =
          process.env.NEXT_PUBLIC_WS_URL ||
          (typeof window !== 'undefined'
            ? `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.hostname}:4000/messaging`
            : 'http://localhost:4000/messaging');

        const socket = io(wsUrl, {
          auth: { token },
          transports: ['websocket', 'polling'],
          withCredentials: true,
          reconnection: true,
          reconnectionAttempts: 10,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
        });

        socketRef.current = socket;

        socket.on('connect', () => {
          if (!isCancelled) setIsConnected(true);
        });

        socket.on('disconnect', () => {
          if (!isCancelled) setIsConnected(false);
        });

        socket.on('message_received', (msg: ChatMessage) => {
          onMessageReceivedRef.current?.(msg);
        });

        socket.on('message:new', (msg: ChatMessage) => {
          onMessageReceivedRef.current?.(msg);
        });

        socket.on(
          'messages_read',
          (payload: {
            conversationId: string;
            readBy: string;
            readAt: string;
          }) => {
            onMessagesReadRef.current?.(payload);
          }
        );

        socket.on(
          'typing_indicator',
          (payload: {
            conversationId: string;
            userId: string;
            isTyping: boolean;
          }) => {
            if (payload.conversationId === conversationIdRef.current) {
              setTypingUsers((prev) => ({
                ...prev,
                [payload.userId]: payload.isTyping,
              }));
            }
          }
        );

        socket.on(
          'conversation_updated',
          (payload: { conversationId: string; lastMessage: ChatMessage }) => {
            onConversationUpdatedRef.current?.(payload);
          }
        );

        socket.on(
          'unread_count_updated',
          (payload: { unreadCount: number }) => {
            onUnreadCountUpdatedRef.current?.(payload);
          }
        );
      } catch (err) {
        console.warn('Socket connection error:', err);
      }
    }

    initSocket();

    return () => {
      isCancelled = true;
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  // Join/leave conversation room when conversationId changes
  useEffect(() => {
    if (!socketRef.current || !isConnected || !conversationId) return;

    socketRef.current.emit('join_conversation', { conversationId });

    return () => {
      if (socketRef.current && isConnected) {
        socketRef.current.emit('leave_conversation', { conversationId });
      }
    };
  }, [conversationId, isConnected]);

  // Send message via WebSocket
  const sendMessage = useCallback(
    (convId: string, content: string): Promise<ChatMessage> => {
      return new Promise((resolve, reject) => {
        if (!socketRef.current || !socketRef.current.connected) {
          reject(new Error('Socket is not connected'));
          return;
        }

        socketRef.current.emit(
          'send_message',
          { conversationId: convId, content },
          (response: any) => {
            if (response?.status === 'sent' && response.data) {
              resolve(response.data);
            } else {
              reject(new Error(response?.message || 'Failed to send message'));
            }
          }
        );
      });
    },
    []
  );

  // Typing stop
  const sendTypingStop = useCallback((convId: string) => {
    if (!socketRef.current || !socketRef.current.connected) return;
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    socketRef.current.emit('typing_stop', { conversationId: convId });
  }, []);

  // Typing start
  const sendTypingStart = useCallback((convId: string) => {
    if (!socketRef.current || !socketRef.current.connected) return;

    socketRef.current.emit('typing_start', { conversationId: convId });

    // Auto-stop typing after 3 seconds if not cancelled
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingStop(convId);
    }, 3000);
  }, [sendTypingStop]);

  // Mark as read
  const markAsRead = useCallback(
    (convId: string, messageIds?: string[]) => {
      if (!socketRef.current || !socketRef.current.connected) return;
      socketRef.current.emit('mark_as_read', {
        conversationId: convId,
        messageIds,
      });
    },
    []
  );

  return {
    socket: socketRef.current,
    isConnected,
    typingUsers,
    sendMessage,
    sendTypingStart,
    sendTypingStop,
    markAsRead,
  };
}
