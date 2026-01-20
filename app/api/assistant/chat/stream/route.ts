import { NextRequest } from 'next/server';
import { verifyToken, type JWTPayload } from '@/lib/auth/jwt';
import { errorResponse } from '@/lib/utils/response';
import { openaiAssistantService } from '@/services/openai-assistant.service';
import { loggingService } from '@/services/logging.service';
import type { ChatStreamEvent } from '@/types/chat';

/**
 * POST /api/assistant/chat/stream
 *
 * Streams a chat response using Server-Sent Events (SSE).
 *
 * Request body:
 * - message: string - The user's message
 * - threadId?: string - Optional thread ID for conversation continuity
 *
 * Response:
 * SSE stream with events:
 * - thread.created: Returns the thread ID
 * - message.delta: Text content chunk
 * - done: Stream complete
 * - error: Error occurred
 */
export async function POST(request: NextRequest) {
  // Manual auth check since withAuth returns NextResponse but we need plain Response for SSE
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse('Authorization header missing or invalid', 401);
  }

  const token = authHeader.substring(7);
  let user: JWTPayload;
  try {
    user = verifyToken(token);
  } catch {
    return errorResponse('Invalid or expired token', 401);
  }

  const startTime = Date.now();
  let fullResponse = '';
  let activeThreadId: string | undefined;

  try {
    const body = await request.json();
    const { message, threadId } = body;

    if (!message?.trim()) {
      return errorResponse('Message is required', 400);
    }

    if (!openaiAssistantService.isConfigured()) {
      return errorResponse('OpenAI is not configured. Please contact support.', 503);
    }

    // Create a readable stream for SSE
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (event: ChatStreamEvent) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        };

        try {
          // Create thread if not provided
          activeThreadId = threadId;
          if (!activeThreadId) {
            activeThreadId = await openaiAssistantService.createThread();
            sendEvent({
              type: 'thread.created',
              threadId: activeThreadId,
            });
          }

          // Add the user message to the thread
          await openaiAssistantService.addMessage(activeThreadId, message);

          // Stream the assistant's response
          for await (const event of openaiAssistantService.runStream(activeThreadId)) {
            sendEvent(event);

            // Track response content
            if ((event.type === 'message.delta' || event.type === 'text') && event.content) {
              fullResponse += event.content;
            }
            if (event.type === 'error') {
              break;
            }
          }

          // Send final done event if not already sent
          sendEvent({ type: 'done' });
        } catch (error) {
          console.error('Chat stream error:', error);
          sendEvent({
            type: 'error',
            error: error instanceof Error ? error.message : 'An unexpected error occurred',
          });
        } finally {
          controller.close();

          // Log the interaction asynchronously
          const responseTimeMs = Date.now() - startTime;
          logInteraction(user, message, fullResponse, activeThreadId, responseTimeMs).catch((err) =>
            console.error('Failed to log interaction:', err)
          );
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no', // Disable nginx buffering
      },
    });
  } catch (error) {
    console.error('Chat endpoint error:', error);
    return errorResponse(error instanceof Error ? error.message : 'Internal server error', 500);
  }
}

/**
 * Logs the chat interaction to the database
 */
async function logInteraction(
  user: JWTPayload,
  userMessage: string,
  assistantResponse: string,
  threadId: string | undefined,
  responseTimeMs: number
): Promise<void> {
  try {
    await loggingService.createInteractionLog({
      userId: user.userId,
      tenantId: user.tenantId,
      interactionType: 'CHAT_MESSAGE',
      threadId,
      userMessage,
      assistantResponse,
      responseTimeMs,
      status: assistantResponse ? 'completed' : 'failed',
    });
  } catch (error) {
    // Log but don't throw - this shouldn't affect the user experience
    console.error('Failed to log chat interaction:', error);
  }
}
