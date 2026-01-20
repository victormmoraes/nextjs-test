import type { MessageRole, ChatSource } from '@/types/chat.types';

export interface ChatMessageProps {
  /** Message role: 'user' or 'assistant' */
  role: MessageRole;
  /** Message content (full content for finalized messages) */
  content: string;
  /** Displayed content (for streaming - may be partial) */
  displayedContent?: string;
  /** Message timestamp */
  timestamp?: Date;
  /** Whether the assistant is currently thinking (shows dots animation) */
  isTyping?: boolean;
  /** Whether the message is currently streaming */
  isStreaming?: boolean;
  /** Whether this message is an error */
  isError?: boolean;
  /** Source documents (for AI responses) */
  sources?: ChatSource[];
  /** Callback when retry is clicked (for error messages) */
  onRetry?: () => void;
  /** Retry button text */
  retryText?: string;
  /** Additional CSS classes */
  className?: string;
}
