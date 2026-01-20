'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { getAccessToken } from '@/contexts/AuthContext';
import type {
  ChatMessage,
  ChatStreamEvent,
  ChatError,
  ChatErrorType,
  UseChatReturn,
  UseChatOptions,
} from '@/types/chat';

/**
 * Hook for managing chat interactions with streaming AI responses.
 *
 * Features:
 * - Manages message state (user and assistant messages)
 * - Handles SSE streaming from the chat API
 * - Supports abort/cancel of in-flight requests
 * - Provides retry functionality for failed messages
 * - Thread/session management for conversation continuity
 *
 * @example
 * ```tsx
 * const { messages, isStreaming, sendMessage, resetChat } = useChat();
 *
 * // Send a message
 * await sendMessage('Hello, how can you help me?');
 *
 * // Reset the conversation
 * resetChat();
 * ```
 */
export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const { onError, onThreadCreated } = options;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<ChatError | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const lastUserMessageRef = useRef<string>('');
  const currentStreamingContentRef = useRef<string>('');
  const messageIdCounterRef = useRef(0);

  // Generate a unique message ID
  const generateMessageId = useCallback(() => {
    messageIdCounterRef.current += 1;
    return `msg_${Date.now()}_${messageIdCounterRef.current}`;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  // Abort the current stream
  const abortStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
    setIsStreaming(false);
  }, []);

  // Reset the chat
  const resetChat = useCallback(() => {
    abortStream();
    setMessages([]);
    setThreadId(null);
    setError(null);
    lastUserMessageRef.current = '';
    currentStreamingContentRef.current = '';
    messageIdCounterRef.current = 0;
  }, [abortStream]);

  // Convert error to ChatError
  const createChatError = useCallback((type: ChatErrorType, message: string): ChatError => {
    return {
      type,
      message,
      retryable: ['NETWORK_ERROR', 'TIMEOUT', 'SERVICE_UNAVAILABLE'].includes(type),
    };
  }, []);

  // Send a message
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading || isStreaming) return;

      const accessToken = getAccessToken();
      if (!accessToken) {
        const err = createChatError('NETWORK_ERROR', 'Not authenticated');
        setError(err);
        onError?.(err);
        return;
      }

      // Save for retry
      lastUserMessageRef.current = content;

      // Add user message
      const userMessage: ChatMessage = {
        id: generateMessageId(),
        role: 'user',
        content,
        timestamp: new Date(),
      };

      // Add typing indicator (assistant message placeholder)
      const assistantMessageId = generateMessageId();
      const typingMessage: ChatMessage = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isTyping: true,
      };

      setMessages((prev) => [...prev, userMessage, typingMessage]);
      setIsLoading(true);
      setError(null);
      currentStreamingContentRef.current = '';

      // Create abort controller
      abortControllerRef.current = new AbortController();

      try {
        // Build chat history for the request
        const chatHistory = messages.map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const response = await fetch('/api/assistant/chat/stream', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            message: content,
            threadId,
            chatHistory,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          let errorType: ChatErrorType = 'UNKNOWN';

          if (response.status === 401) {
            errorType = 'NETWORK_ERROR';
          } else if (response.status === 400) {
            errorType = 'BAD_REQUEST';
          } else if (response.status === 503) {
            errorType = 'SERVICE_UNAVAILABLE';
          } else if (response.status >= 500) {
            errorType = 'SERVICE_UNAVAILABLE';
          }

          throw createChatError(errorType, errorData.error || `HTTP ${response.status}`);
        }

        if (!response.body) {
          throw createChatError('NETWORK_ERROR', 'No response body');
        }

        // Switch from typing to streaming
        setIsLoading(false);
        setIsStreaming(true);

        // Process the SSE stream
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');

          // Keep the last incomplete line
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;

            try {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              const event: ChatStreamEvent = JSON.parse(data);

              switch (event.type) {
                case 'thread.created':
                case 'session':
                  const newThreadId = event.threadId || event.sessionId;
                  if (newThreadId) {
                    setThreadId(newThreadId);
                    onThreadCreated?.(newThreadId);
                  }
                  break;

                case 'text':
                case 'message.delta':
                  if (event.content) {
                    currentStreamingContentRef.current += event.content;

                    // Update the message with streaming content
                    setMessages((prev) =>
                      prev.map((m) =>
                        m.id === assistantMessageId
                          ? {
                              ...m,
                              isTyping: false,
                              isStreaming: true,
                              displayedContent: currentStreamingContentRef.current,
                            }
                          : m
                      )
                    );
                  }
                  break;

                case 'sources':
                  // Add sources to the message
                  if (event.sources) {
                    setMessages((prev) =>
                      prev.map((m) =>
                        m.id === assistantMessageId
                          ? {
                              ...m,
                              sources: event.sources,
                            }
                          : m
                      )
                    );
                  }
                  break;

                case 'done':
                case 'message.completed':
                  // Finalize the message
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantMessageId
                        ? {
                            ...m,
                            content: currentStreamingContentRef.current,
                            displayedContent: currentStreamingContentRef.current,
                            isTyping: false,
                            isStreaming: false,
                          }
                        : m
                    )
                  );
                  break;

                case 'error':
                  const chatError = createChatError('SERVICE_UNAVAILABLE', event.error || 'Unknown error');
                  setError(chatError);
                  onError?.(chatError);

                  // Mark message as error
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantMessageId
                        ? {
                            ...m,
                            content: event.error || 'An error occurred',
                            isTyping: false,
                            isStreaming: false,
                            isError: true,
                          }
                        : m
                    )
                  );
                  break;
              }
            } catch {
              // Ignore parse errors for incomplete chunks
            }
          }
        }

        // Finalize if stream ended without explicit done event
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessageId && (m.isTyping || m.isStreaming)
              ? {
                  ...m,
                  content: currentStreamingContentRef.current || m.content,
                  displayedContent: currentStreamingContentRef.current || m.displayedContent,
                  isTyping: false,
                  isStreaming: false,
                }
              : m
          )
        );
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          // User cancelled, just cleanup
          setMessages((prev) => prev.filter((m) => m.id !== assistantMessageId || m.content));
          return;
        }

        // Handle error
        const chatError =
          err && typeof err === 'object' && 'type' in err && 'retryable' in err
            ? (err as ChatError)
            : createChatError('UNKNOWN', err instanceof Error ? err.message : 'Unknown error');

        setError(chatError);
        onError?.(chatError);

        // Mark message as error
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessageId
              ? {
                  ...m,
                  content: chatError.message,
                  isTyping: false,
                  isStreaming: false,
                  isError: true,
                }
              : m
          )
        );
      } finally {
        setIsLoading(false);
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    [
      isLoading,
      isStreaming,
      messages,
      threadId,
      generateMessageId,
      createChatError,
      onError,
      onThreadCreated,
    ]
  );

  // Retry the last failed message
  const retryLastMessage = useCallback(async () => {
    if (!lastUserMessageRef.current || isLoading || isStreaming) return;

    // Remove the last error message (assistant) and user message
    setMessages((prev) => {
      const msgs = [...prev];
      // Remove last message if it's an error
      if (msgs.length > 0 && msgs[msgs.length - 1].isError) {
        msgs.pop();
      }
      // Remove the user message that triggered the error
      if (msgs.length > 0 && msgs[msgs.length - 1].role === 'user') {
        msgs.pop();
      }
      return msgs;
    });

    // Retry
    await sendMessage(lastUserMessageRef.current);
  }, [isLoading, isStreaming, sendMessage]);

  return {
    messages,
    isLoading,
    isStreaming,
    error,
    threadId,
    sendMessage,
    retryLastMessage,
    resetChat,
    abortStream,
  };
}
