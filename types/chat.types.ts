/**
 * Types for the Gen AI Chat feature
 */

// Message role types
export type MessageRole = 'user' | 'assistant';

// Chat message interface
export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  displayedContent?: string; // For streaming - shows partial content
  timestamp: Date;
  isTyping?: boolean;
  isStreaming?: boolean;
  isError?: boolean;
  sources?: ChatSource[];
}

// Source document reference
export interface ChatSource {
  title: string;
  url?: string;
  content?: string;
}

// SSE Event types - unified across LlamaIndex and OpenAI backends
export type ChatEventType =
  | 'session'          // LlamaIndex: session ID
  | 'thread.created'   // OpenAI: thread ID
  | 'text'             // LlamaIndex: text chunk
  | 'message.delta'    // OpenAI: text chunk
  | 'sources'          // LlamaIndex: source documents
  | 'message.completed'// OpenAI: message complete
  | 'done'             // Both: stream complete
  | 'error';           // Both: error occurred

// Unified stream event interface
export interface ChatStreamEvent {
  type: ChatEventType;
  content?: string;
  threadId?: string;
  sessionId?: string;
  sources?: ChatSource[];
  error?: string;
}

// Chat request body
export interface ChatRequest {
  message: string;
  threadId?: string;
  sessionId?: string;
  chatHistory?: Array<{ role: string; content: string }>;
}

// Error types for chat
export type ChatErrorType =
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'SERVICE_UNAVAILABLE'
  | 'BAD_REQUEST'
  | 'OPENAI_NOT_CONFIGURED'
  | 'UNKNOWN';

export interface ChatError {
  type: ChatErrorType;
  message: string;
  retryable: boolean;
}

// AI Provider type
export type AIProvider = 'llamaindex' | 'openai-assistant';

// Hook return type
export interface UseChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  isStreaming: boolean;
  error: ChatError | null;
  threadId: string | null;
  sendMessage: (content: string) => Promise<void>;
  retryLastMessage: () => Promise<void>;
  resetChat: () => void;
  abortStream: () => void;
}

// Hook options
export interface UseChatOptions {
  onError?: (error: ChatError) => void;
  onThreadCreated?: (threadId: string) => void;
}
