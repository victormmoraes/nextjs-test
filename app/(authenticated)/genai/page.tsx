'use client';

import { ChatPage } from '@/components/ui/pages/ChatPage';

/**
 * Gen AI Chat Page
 *
 * This page provides an AI chat interface that:
 * - Uses OpenAI Assistants API
 * - Supports streaming responses
 * - Persists conversation within session
 */
export default function GenAIPage() {
  return <ChatPage className="h-[calc(100vh-80px)]" />;
}
