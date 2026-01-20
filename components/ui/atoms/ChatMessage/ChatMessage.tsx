'use client';

import { AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChatTypingIndicator } from '../ChatTypingIndicator';
import { ChatMarkdownContent } from '../ChatMarkdownContent';
import type { ChatMessageProps } from './ChatMessage.types';

/**
 * Individual chat message bubble.
 *
 * Renders differently based on role:
 * - User messages: Right-aligned with gray background
 * - Assistant messages: Left-aligned with markdown rendering
 *
 * Supports various states:
 * - Typing (dots animation)
 * - Streaming (content with cursor)
 * - Error (red styling with retry button)
 *
 * @example
 * ```tsx
 * // User message
 * <ChatMessage role="user" content="Hello!" />
 *
 * // Assistant message (streaming)
 * <ChatMessage
 *   role="assistant"
 *   content=""
 *   displayedContent="I'm responding..."
 *   isStreaming
 * />
 *
 * // Error message
 * <ChatMessage
 *   role="assistant"
 *   content="Network error"
 *   isError
 *   onRetry={() => retry()}
 * />
 * ```
 */
export function ChatMessage({
  role,
  content,
  displayedContent,
  isTyping,
  isStreaming,
  isError,
  onRetry,
  retryText = 'Tentar novamente',
  className,
}: ChatMessageProps) {
  const isUser = role === 'user';

  // Get the content to display
  const textContent = displayedContent !== undefined ? displayedContent : content;

  // User message
  if (isUser) {
    return (
      <div className={cn('flex justify-end', className)}>
        <div className="max-w-[80%] px-4 py-3 rounded-2xl bg-gray-200 text-black">
          <p className="text-md leading-relaxed whitespace-pre-wrap">{content}</p>
        </div>
      </div>
    );
  }

  // Assistant message - typing indicator
  if (isTyping) {
    return (
      <div className={cn('flex', className)}>
        <div className="max-w-full">
          <ChatTypingIndicator type="dots" />
        </div>
      </div>
    );
  }

  // Assistant message - error
  if (isError) {
    return (
      <div className={cn('flex', className)}>
        <div className="max-w-full">
          <div className="flex items-start gap-2 text-error-500">
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
            <div>
              <p className="text-md leading-relaxed whitespace-pre-wrap">{content}</p>
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="mt-2 text-sm text-error-500 hover:text-error-400 underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  {retryText}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Assistant message - normal or streaming
  return (
    <div className={cn('flex', className)}>
      <div className="max-w-full">
        <ChatMarkdownContent
          content={textContent}
          className="text-md leading-relaxed text-black"
          removeSourcesSection
        />
        {isStreaming && <ChatTypingIndicator type="cursor" className="ml-1" />}
      </div>
    </div>
  );
}
