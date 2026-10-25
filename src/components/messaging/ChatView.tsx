'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  Search,
  Send,
  ArrowLeft,
  Calendar,
  ExternalLink,
  MessageSquare,
  Check,
  CheckCheck,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import {
  messagingApi,
  ConversationSummary,
  ChatMessage,
} from '@/lib/api/messaging';
import { useMessagingSocket } from '@/lib/hooks/useMessagingSocket';

interface ChatViewProps {
  currentUserId: string;
  initialConversationId?: string | null;
  onSelectConversation?: (conversationId: string) => void;
  userRole?: 'MENTEE' | 'MENTOR' | string;
}

export const ChatView: React.FC<ChatViewProps> = ({
  currentUserId,
  initialConversationId,
  onSelectConversation,
  userRole,
}) => {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(initialConversationId || null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoadingEarlier, setIsLoadingEarlier] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Mobile view toggle (show list vs show conversation)
  const [mobileShowChat, setMobileShowChat] = useState(
    Boolean(initialConversationId)
  );

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Active conversation object
  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId
  );

  // WebSocket hook integration
  const {
    isConnected,
    typingUsers,
    sendMessage: socketSendMessage,
    sendTypingStart,
    sendTypingStop,
    markAsRead,
  } = useMessagingSocket({
    conversationId: activeConversationId,
    onMessageReceived: (newMsg) => {
      // If message is in active conversation, append to list
      if (newMsg.conversationId === activeConversationId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });

        // If from other participant, mark as read
        if (newMsg.senderId !== currentUserId) {
          markAsRead(activeConversationId, [newMsg.id]);
        }
      }

      // Update conversations list preview
      setConversations((prev) => {
        return prev.map((c) => {
          if (c.id === newMsg.conversationId) {
            const isCurrentActive = c.id === activeConversationId;
            return {
              ...c,
              lastMessageAt: newMsg.createdAt,
              lastMessage: {
                id: newMsg.id,
                content: newMsg.content,
                senderId: newMsg.senderId,
                isRead: isCurrentActive || newMsg.isRead,
                createdAt: newMsg.createdAt,
              },
              unreadCount:
                isCurrentActive || newMsg.senderId === currentUserId
                  ? 0
                  : c.unreadCount + 1,
            };
          }
          return c;
        });
      });
    },
    onMessagesRead: (payload) => {
      if (payload.conversationId === activeConversationId) {
        setMessages((prev) =>
          prev.map((m) =>
            m.senderId === currentUserId ? { ...m, isRead: true } : m
          )
        );
      }
    },
    onConversationUpdated: (payload) => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === payload.conversationId) {
            return {
              ...c,
              lastMessageAt: payload.lastMessage.createdAt,
              lastMessage: payload.lastMessage,
            };
          }
          return c;
        })
      );
    },
  });

  // Fetch conversations on mount
  const fetchConversations = useCallback(async () => {
    try {
      setIsLoadingConversations(true);
      const res = await messagingApi.getConversations();
      const list = res.data || [];
      setConversations(list);

      // Auto-select first conversation if none selected
      if (!activeConversationId && list.length > 0) {
        setActiveConversationId(list[0].id);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setIsLoadingConversations(false);
    }
  }, [activeConversationId]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Fetch messages when active conversation changes
  useEffect(() => {
    if (!activeConversationId) return;

    let isCancelled = false;

    async function loadMessages() {
      setIsLoadingMessages(true);
      try {
        const res = await messagingApi.getMessages(activeConversationId!);
        if (!isCancelled) {
          setMessages(res.data || []);
          setNextCursor(res.nextCursor);
          setHasMore(res.hasMore);

          // Mark active conversation messages as read
          markAsRead(activeConversationId!);

          // Reset unread badge in state
          setConversations((prev) =>
            prev.map((c) =>
              c.id === activeConversationId ? { ...c, unreadCount: 0 } : c
            )
          );
        }
      } catch (err) {
        console.error('Failed to load messages:', err);
      } finally {
        if (!isCancelled) setIsLoadingMessages(false);
      }
    }

    loadMessages();

    return () => {
      isCancelled = true;
    };
  }, [activeConversationId, markAsRead]);

  // Auto scroll to bottom
  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'auto',
    });
  }, []);

  useEffect(() => {
    scrollToBottom(false);
  }, [messages.length, scrollToBottom]);

  // Load earlier messages (pagination)
  const loadEarlierMessages = async () => {
    if (!activeConversationId || !nextCursor || isLoadingEarlier) return;

    setIsLoadingEarlier(true);
    try {
      const res = await messagingApi.getMessages(
        activeConversationId,
        nextCursor
      );
      setMessages((prev) => [...(res.data || []), ...prev]);
      setNextCursor(res.nextCursor);
      setHasMore(res.hasMore);
    } catch (err) {
      console.error('Failed to load earlier messages:', err);
    } finally {
      setIsLoadingEarlier(false);
    }
  };

  // Handle Send Message
  const handleSend = async () => {
    const trimmed = inputText.trim();
    if (!trimmed || !activeConversationId || isSending) return;

    setIsSending(true);
    sendTypingStop(activeConversationId);

    try {
      // Optimistically create UI message or send via socket / REST fallback
      let sentMessage: ChatMessage;

      if (isConnected) {
        try {
          sentMessage = await socketSendMessage(
            activeConversationId,
            trimmed
          );
        } catch {
          // Fallback to REST if socket fails
          const res = await messagingApi.sendMessage(
            activeConversationId,
            trimmed
          );
          sentMessage = res.data;
        }
      } else {
        const res = await messagingApi.sendMessage(
          activeConversationId,
          trimmed
        );
        sentMessage = res.data;
      }

      setMessages((prev) => {
        if (prev.some((m) => m.id === sentMessage.id)) return prev;
        return [...prev, sentMessage];
      });

      setInputText('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }

      // Update conversations list preview
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversationId
            ? {
                ...c,
                lastMessageAt: sentMessage.createdAt,
                lastMessage: sentMessage,
              }
            : c
        )
      );

      scrollToBottom(true);
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  };

  // Handle Textarea keydown (Enter to send, Shift+Enter for newline)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle text change with typing indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    if (activeConversationId) {
      sendTypingStart(activeConversationId);
    }

    // Auto-grow textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        140
      )}px`;
    }
  };

  // Filter conversations
  const filteredConversations = conversations.filter((c) =>
    c.otherParticipant?.name
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  // Helper to format timestamp
  const formatTime = (isoString?: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateHeader = (isoString: string) => {
    const date = new Date(isoString);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) return 'Today';
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      year:
        date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    });
  };

  // Helper to detect links in message text
  const renderMessageContent = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-blue-300 hover:text-blue-200 inline-flex items-center gap-0.5 break-all font-medium"
          >
            {part}
            <ExternalLink className="w-3 h-3 inline flex-shrink-0" />
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const otherParticipantTyping =
    activeConversation &&
    Boolean(typingUsers[activeConversation.otherParticipant.id]);

  return (
    <div
      id="chat-view-container"
      className="flex h-[calc(100vh-140px)] min-h-[580px] w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative"
    >
      {/* ── LEFT PANE: Conversations Sidebar ── */}
      <div
        className={`w-full md:w-80 lg:w-96 flex-shrink-0 bg-slate-900/90 border-r border-slate-800 flex flex-col transition-all duration-300 ${
          mobileShowChat ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight">
                Messages
              </h2>
              {isConnected && (
                <span
                  title="Live WebSocket Connected"
                  className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"
                />
              )}
            </div>
            <button
              onClick={fetchConversations}
              title="Refresh messages"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              id="conversation-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-[#FF6B00] transition-colors"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/50">
          {isLoadingConversations ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-2">
              <div className="w-6 h-6 border-2 border-[#FF6B00] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs">Loading conversations...</span>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <MessageSquare className="w-10 h-10 mx-auto mb-2 text-slate-600" />
              <p className="text-sm font-medium text-slate-300">
                No conversations yet
              </p>
              <p className="text-xs mt-1 text-slate-500">
                When a mentorship application is accepted, direct messaging will
                activate here.
              </p>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isActive = conv.id === activeConversationId;
              const other = conv.otherParticipant;
              const initial = other?.name?.charAt(0).toUpperCase() || 'U';

              return (
                <button
                  key={conv.id}
                  id={`conversation-item-${conv.id}`}
                  onClick={() => {
                    setActiveConversationId(conv.id);
                    setMobileShowChat(true);
                    onSelectConversation?.(conv.id);
                  }}
                  className={`w-full text-left p-3.5 flex items-start gap-3 transition-colors relative hover:bg-slate-800/60 ${
                    isActive
                      ? 'bg-slate-800/90 border-l-4 border-[#FF6B00]'
                      : 'border-l-4 border-transparent'
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    {other?.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={other.avatarUrl}
                        alt={other.name}
                        className="w-11 h-11 rounded-full object-cover border border-slate-700"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#FF6B00] to-[#FFA048] flex items-center justify-center font-bold text-white shadow-md">
                        {initial}
                      </div>
                    )}
                    {other?.isMentor && (
                      <span
                        title="Verified Mentor"
                        className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-amber-500 border border-slate-900 flex items-center justify-center text-[9px] text-white font-bold"
                      >
                        ✓
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-semibold text-sm text-white truncate">
                        {other?.name}
                      </span>
                      <span className="text-[11px] text-slate-400 flex-shrink-0 ml-2">
                        {formatTime(conv.lastMessage?.createdAt || conv.lastMessageAt)}
                      </span>
                    </div>

                    {conv.mentorship?.planTitle && (
                      <div className="text-[11px] text-orange-400/90 truncate font-medium">
                        {conv.mentorship.planTitle}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-slate-400 truncate pr-2">
                        {conv.lastMessage?.content || 'Started conversation'}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="flex-shrink-0 px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#FF6B00] text-white">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── RIGHT PANE: Message Stream & Input ── */}
      <div
        className={`flex-1 flex flex-col bg-slate-950 transition-all duration-300 ${
          mobileShowChat ? 'flex' : 'hidden md:flex'
        }`}
      >
        {activeConversation ? (
          <>
            {/* Active Header */}
            <div className="h-16 px-4 md:px-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/60 backdrop-blur-md">
              <div className="flex items-center gap-3">
                {/* Mobile Back Button */}
                <button
                  onClick={() => setMobileShowChat(false)}
                  className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FF6B00] to-[#FFA048] flex items-center justify-center font-bold text-white shadow-sm flex-shrink-0">
                  {activeConversation.otherParticipant.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={activeConversation.otherParticipant.avatarUrl}
                      alt={activeConversation.otherParticipant.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    activeConversation.otherParticipant.name
                      ?.charAt(0)
                      .toUpperCase()
                  )}
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-white">
                      {activeConversation.otherParticipant.name}
                    </span>
                    {activeConversation.otherParticipant.isMentor && (
                      <span className="text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Mentor
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 truncate max-w-[200px] md:max-w-md">
                    {otherParticipantTyping ? (
                      <span className="text-[#FF6B00] font-medium animate-pulse">
                        typing...
                      </span>
                    ) : (
                      activeConversation.otherParticipant.title ||
                      activeConversation.otherParticipant.headline ||
                      'Participant'
                    )}
                  </span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2">
                <Link
                  href={
                    userRole === 'MENTEE'
                      ? '/mentee/dashboard/bookings'
                      : '/mentor/dashboard'
                  }
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors border border-slate-700"
                >
                  <Calendar className="w-3.5 h-3.5 text-[#FF6B00]" />
                  Schedule Call
                </Link>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
              {/* Load Earlier Messages Button */}
              {hasMore && (
                <div className="flex justify-center pb-2">
                  <button
                    onClick={loadEarlierMessages}
                    disabled={isLoadingEarlier}
                    className="px-3 py-1 rounded-full text-xs font-medium text-slate-400 bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors border border-slate-700 flex items-center gap-1.5"
                  >
                    {isLoadingEarlier && (
                      <div className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                    )}
                    Load earlier messages
                  </button>
                </div>
              )}

              {isLoadingMessages ? (
                <div className="flex items-center justify-center h-48 text-slate-400">
                  <div className="w-6 h-6 border-2 border-[#FF6B00] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 py-12">
                  <Sparkles className="w-10 h-10 mb-2 text-[#FF6B00]" />
                  <p className="text-sm font-semibold text-slate-300">
                    Start the conversation!
                  </p>
                  <p className="text-xs text-slate-500 max-w-xs mt-1">
                    Introduce yourself, ask questions, or agree on the next session
                    date and agenda.
                  </p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isMine = msg.senderId === currentUserId;
                  const prevMsg = messages[index - 1];
                  const showDate =
                    !prevMsg ||
                    new Date(prevMsg.createdAt).toDateString() !==
                      new Date(msg.createdAt).toDateString();

                  return (
                    <React.Fragment key={msg.id}>
                      {showDate && (
                        <div className="flex justify-center my-3">
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800/80 text-slate-400 border border-slate-700/60">
                            {formatDateHeader(msg.createdAt)}
                          </span>
                        </div>
                      )}

                      <div
                        className={`flex items-end gap-2 ${
                          isMine ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        {!isMine && (
                          <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 flex-shrink-0 mb-1">
                            {msg.sender?.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                        )}

                        <div
                          className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-2.5 shadow-md ${
                            isMine
                              ? 'bg-gradient-to-r from-[#FF6B00] to-[#FA5A00] text-white rounded-br-sm'
                              : 'bg-slate-800 border border-slate-700/60 text-slate-100 rounded-bl-sm'
                          }`}
                        >
                          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                            {renderMessageContent(msg.content)}
                          </p>

                          <div
                            className={`flex items-center gap-1 justify-end mt-1 text-[10px] ${
                              isMine ? 'text-orange-100/80' : 'text-slate-400'
                            }`}
                          >
                            <span>{formatTime(msg.createdAt)}</span>
                            {isMine &&
                              (msg.isRead ? (
                                <span title="Read">
                                  <CheckCheck className="w-3.5 h-3.5 text-white" />
                                </span>
                              ) : (
                                <span title="Sent">
                                  <Check className="w-3.5 h-3.5 text-orange-200" />
                                </span>
                              ))}
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })
              )}

              {/* Typing indicator bubble */}
              {otherParticipantTyping && (
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                    {activeConversation.otherParticipant.name
                      ?.charAt(0)
                      .toUpperCase()}
                  </div>
                  <div className="bg-slate-800 border border-slate-700 px-3.5 py-2 rounded-2xl rounded-bl-sm flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"
                      style={{ animationDelay: '150ms' }}
                    />
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"
                      style={{ animationDelay: '300ms' }}
                    />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 md:p-4 border-t border-slate-800 bg-slate-900/80">
              <div className="flex items-end gap-2 bg-slate-800 border border-slate-700 rounded-xl p-2 focus-within:border-[#FF6B00] transition-colors shadow-inner">
                <textarea
                  id="chat-message-input"
                  ref={textareaRef}
                  value={inputText}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message... (Enter to send, Shift+Enter for newline)"
                  rows={1}
                  className="flex-1 bg-transparent border-0 text-sm text-white placeholder-slate-400 focus:outline-none resize-none max-h-36 py-1 px-2"
                />
                <button
                  id="chat-send-btn"
                  onClick={handleSend}
                  disabled={!inputText.trim() || isSending}
                  className="p-2 rounded-lg bg-[#FF6B00] text-white hover:bg-[#FA5A00] disabled:opacity-40 disabled:hover:bg-[#FF6B00] transition-all flex-shrink-0 shadow-md shadow-orange-500/20"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center mb-4 text-[#FF6B00]">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">
              Direct Mentorship Messaging
            </h3>
            <p className="text-xs text-slate-400 max-w-sm">
              Select an active conversation on the left to coordinate session
              topics, exchange links, and ask questions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
