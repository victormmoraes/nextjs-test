'use client';

import { useEffect } from 'react';
import { ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAutoScroll } from '@/hooks/useAutoScroll';
import { ChatMessage } from '@/components/ui/atoms/ChatMessage';
import type { ChatMessageListProps } from './ChatMessageList.types';

/**
 * Scrollable container for chat messages with auto-scroll behavior.
 *
 * Features:
 * - Auto-scrolls to bottom on new messages (if user is at bottom)
 * - Pauses auto-scroll when user manually scrolls up
 * - Shows "scroll to bottom" button when not at bottom
 * - Renders messages with appropriate styling
 *
 * @example
 * ```tsx
 * <ChatMessageList
 *   messages={messages}
 *   onRetry={retryLastMessage}
 * />
 * ```
 */
export function ChatMessageList({
  messages,
  onRetry,
  retryText = 'Tentar novamente',
  className,
}: ChatMessageListProps) {
  const { containerRef, scrollToBottom, isAtBottom, shouldAutoScroll, handleScroll } =
    useAutoScroll();

  // Auto-scroll when messages change
  useEffect(() => {
    if (shouldAutoScroll && messages.length > 0) {
      // Small delay to ensure DOM has updated
      const timeoutId = setTimeout(() => {
        scrollToBottom();
      }, 50);
      return () => clearTimeout(timeoutId);
    }
  }, [messages, shouldAutoScroll, scrollToBottom]);

  return (
    <div className={cn('relative flex-1 overflow-hidden', className)}>
      {/* Scrollable message container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto px-4 py-6"
      >
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              role={message.role}
              content={message.content}
              displayedContent={message.displayedContent}
              timestamp={message.timestamp}
              isTyping={message.isTyping}
              isStreaming={message.isStreaming}
              isError={message.isError}
              sources={message.sources}
              onRetry={message.isError ? onRetry : undefined}
              retryText={retryText}
            />
          ))}
        </div>
      </div>

      {/* Scroll to bottom button */}
      {!isAtBottom && messages.length > 0 && (
        <button
          onClick={scrollToBottom}
          className={cn(
            'absolute bottom-4 left-1/2 -translate-x-1/2',
            'w-8 h-8 flex items-center justify-center',
            'bg-white border border-gray-300 text-gray-600 rounded-full cursor-pointer',
            'hover:bg-gray-50 transition-colors duration-200 shadow-md z-10'
          )}
          aria-label="Scroll to bottom"
        >
          <ArrowDown className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
