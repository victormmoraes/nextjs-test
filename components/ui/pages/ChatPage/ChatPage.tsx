'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/hooks/useChat';
import { Modal } from '@/components/ui/molecules/Modal';
import { Button } from '@/components/ui/atoms/Button';
import { ChatInput } from '@/components/ui/molecules/ChatInput';
import { ChatMessageList } from '@/components/ui/molecules/ChatMessageList';
import type { ChatPageProps } from './ChatPage.types';

// LocalStorage key for modal dismissal
const MODAL_DISMISSED_KEY = 'genai_modal_dismissed';

/**
 * Main chat page component for Gen AI feature.
 *
 * Features:
 * - Warning modal on first visit (dismissal persisted in localStorage)
 * - Two UI states: initial (centered input) and chat (messages + bottom input)
 * - Streaming AI responses with typing indicators
 * - Auto-scroll with manual scroll detection
 * - Reset/new chat functionality
 * - Error handling with retry
 *
 * Multi-tenant:
 * - Vibra tenant (ID 3) uses LlamaIndex backend
 * - Other tenants use OpenAI Assistants API
 *
 * @example
 * ```tsx
 * // In a Next.js page
 * export default function GenAIPage() {
 *   return <ChatPage />;
 * }
 * ```
 */
export function ChatPage({ className }: ChatPageProps) {
  const t = useTranslations('genai');
  const tCommon = useTranslations('common');
  const { user } = useAuth();

  // Warning modal state
  const [showModal, setShowModal] = useState(false);

  // Chat hook
  const {
    messages,
    isLoading,
    isStreaming,
    sendMessage,
    retryLastMessage,
    resetChat,
  } = useChat();

  // Check if modal was previously dismissed
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const dismissed = localStorage.getItem(MODAL_DISMISSED_KEY);
      if (!dismissed) {
        setShowModal(true);
      }
    }
  }, []);

  // Close modal and persist dismissal
  const closeModal = useCallback(() => {
    setShowModal(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem(MODAL_DISMISSED_KEY, 'true');
    }
  }, []);

  // Get modal content based on tenant
  const getModalContent = useCallback(() => {
    // Vibra tenant (ID 3) gets different modal text
    if (user?.tenantId === 3) {
      return t.raw('modal_text_tenant3');
    }
    return t.raw('modal_text');
  }, [t, user?.tenantId]);

  // Handle send message
  const handleSend = useCallback(
    (message: string) => {
      sendMessage(message);
    },
    [sendMessage]
  );

  const hasMessages = messages.length > 0;
  const isDisabled = isLoading || isStreaming;

  return (
    <div className={cn('flex flex-col h-full min-h-[400px] w-full bg-white', className)}>
      {/* Initial state - centered input */}
      {!hasMessages && (
        <div className="flex-1 flex flex-col items-center justify-center px-4 pb-32">
          <h1 className="text-2xl md:text-3xl text-center text-gray-800 mb-12">
            {t('initialTitle')}
          </h1>
          <div className="w-full max-w-3xl">
            <ChatInput
              onSend={handleSend}
              disabled={isDisabled}
              placeholder={t('placeholder')}
            />
          </div>
        </div>
      )}

      {/* Chat state - messages + bottom input */}
      {hasMessages && (
        <>
          {/* Message list */}
          <ChatMessageList
            messages={messages}
            onRetry={retryLastMessage}
            retryText={t('retry')}
            className="flex-1"
          />

          {/* Input area */}
          <div className="w-full px-4 bg-white">
            <div className="max-w-3xl mx-auto pb-2">
              <ChatInput
                onSend={handleSend}
                disabled={isDisabled}
                placeholder={t('placeholder')}
                showResetButton={hasMessages}
                onReset={resetChat}
                resetTitle={t('newChat')}
              />
              <p className="text-xs text-gray-500 text-center mt-3">{t('disclaimer')}</p>
            </div>
          </div>
        </>
      )}

      {/* Warning modal */}
      {showModal && (
        <Modal title={tCommon('warning')} maxWidth="max-w-2xl" onClose={closeModal}>
          <div
            className="space-y-4 text-gray-800 text-sm"
            dangerouslySetInnerHTML={{ __html: getModalContent() }}
          />
          <div className="mt-6 flex justify-end">
            <Button variant="primary" onClick={closeModal}>
              {tCommon('understood')}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
