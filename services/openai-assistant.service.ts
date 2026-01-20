import OpenAI from 'openai';
import type { ChatStreamEvent } from '@/types/chat.types';

// Initialize OpenAI client (only on server-side)
const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }
  return new OpenAI({ apiKey });
};

const getAssistantId = () => {
  const assistantId = process.env.OPENAI_ASSISTANT_ID;
  if (!assistantId) {
    throw new Error('OPENAI_ASSISTANT_ID is not configured');
  }
  return assistantId;
};

/**
 * Service for interacting with OpenAI Assistants API
 *
 * This service provides methods to:
 * - Create conversation threads
 * - Add messages to threads
 * - Run the assistant with streaming responses
 */
export const openaiAssistantService = {
  /**
   * Creates a new conversation thread
   * @returns The thread ID
   */
  async createThread(): Promise<string> {
    const openai = getOpenAIClient();
    const thread = await openai.beta.threads.create();
    return thread.id;
  },

  /**
   * Adds a user message to a thread
   * @param threadId - The thread ID
   * @param content - The message content
   */
  async addMessage(threadId: string, content: string): Promise<void> {
    const openai = getOpenAIClient();
    await openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content,
    });
  },

  /**
   * Runs the assistant on a thread with streaming
   * @param threadId - The thread ID
   * @yields ChatStreamEvent objects as the response streams
   */
  async *runStream(threadId: string): AsyncGenerator<ChatStreamEvent> {
    const openai = getOpenAIClient();
    const assistantId = getAssistantId();

    const stream = openai.beta.threads.runs.stream(threadId, {
      assistant_id: assistantId,
    });

    for await (const event of stream) {
      // Handle different event types from the OpenAI Assistants API
      switch (event.event) {
        case 'thread.message.delta': {
          const delta = event.data.delta;
          if (delta.content && delta.content.length > 0) {
            const textContent = delta.content[0];
            if (textContent.type === 'text' && textContent.text?.value) {
              yield {
                type: 'message.delta',
                content: textContent.text.value,
              };
            }
          }
          break;
        }

        case 'thread.message.completed': {
          yield {
            type: 'message.completed',
          };
          break;
        }

        case 'thread.run.completed': {
          yield {
            type: 'done',
          };
          break;
        }

        case 'thread.run.failed': {
          const error = event.data.last_error;
          yield {
            type: 'error',
            error: error?.message || 'Run failed',
          };
          break;
        }

        case 'thread.run.cancelled': {
          yield {
            type: 'error',
            error: 'Run was cancelled',
          };
          break;
        }

        case 'thread.run.expired': {
          yield {
            type: 'error',
            error: 'Run expired',
          };
          break;
        }

        // Handle requires_action for tool calls if needed in the future
        case 'thread.run.requires_action': {
          // For now, just complete - tool calls can be implemented later
          yield {
            type: 'error',
            error: 'Tool calls not yet supported',
          };
          break;
        }
      }
    }
  },

  /**
   * Gets the full message history for a thread
   * @param threadId - The thread ID
   * @returns Array of messages with role and content
   */
  async getThreadMessages(threadId: string): Promise<Array<{ role: string; content: string }>> {
    const openai = getOpenAIClient();
    const messages = await openai.beta.threads.messages.list(threadId, {
      order: 'asc',
    });

    return messages.data.map((msg) => ({
      role: msg.role,
      content: msg.content
        .filter((c) => c.type === 'text')
        .map((c) => (c.type === 'text' ? c.text.value : ''))
        .join('\n'),
    }));
  },

  /**
   * Checks if OpenAI is configured
   * @returns true if OPENAI_API_KEY and OPENAI_ASSISTANT_ID are set
   */
  isConfigured(): boolean {
    return !!(process.env.OPENAI_API_KEY && process.env.OPENAI_ASSISTANT_ID);
  },
};

