import type { ChatMessage } from '@/types/chat.types';

export interface ChatMessageListProps {
  /** Array of messages to display */
  messages: ChatMessage[];
  /** Callback when retry is clicked on an error message */
  onRetry?: () => void;
  /** Retry button text */
  retryText?: string;
  /** Additional CSS classes */
  className?: string;
}
