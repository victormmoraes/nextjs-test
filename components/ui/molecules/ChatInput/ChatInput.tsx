'use client';

import { useState, useCallback, KeyboardEvent } from 'react';
import { Send, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChatInputProps } from './ChatInput.types';

/**
 * Chat input component with send button.
 *
 * Features:
 * - Submit on Enter (Shift+Enter for newline would require textarea)
 * - Send button disabled when empty
 * - Optional reset/new chat button
 * - Fully controlled
 *
 * @example
 * ```tsx
 * <ChatInput
 *   onSend={(message) => sendMessage(message)}
 *   placeholder="Type a message..."
 *   disabled={isLoading}
 *   showResetButton={hasMessages}
 *   onReset={resetChat}
 * />
 * ```
 */
export function ChatInput({
  onSend,
  disabled = false,
  placeholder = 'Enviar uma mensagem...',
  maxLength = 4000,
  showResetButton = false,
  onReset,
  resetTitle = 'Iniciar nova conversa',
  className,
}: ChatInputProps) {
  const [value, setValue] = useState('');

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;

    onSend(trimmed);
    setValue('');
  }, [value, disabled, onSend]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const canSend = value.trim().length > 0 && !disabled;

  return (
    <div className={cn('w-full', className)}>
      <div className="relative flex items-center gap-2">
        {/* Reset button */}
        {showResetButton && onReset && (
          <button
            onClick={onReset}
            disabled={disabled}
            title={resetTitle}
            className={cn(
              'w-10 h-10 flex items-center justify-center cursor-pointer',
              'text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full',
              'transition-colors duration-200',
              'disabled:opacity-30 disabled:cursor-not-allowed'
            )}
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        )}

        {/* Input wrapper */}
        <div className="relative flex-1 flex items-center">
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            maxLength={maxLength}
            className={cn(
              'w-full px-5 py-4 pr-14 text-sm text-gray-900 placeholder-gray-400',
              'bg-gray-100 border border-gray-300 rounded-full',
              'focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500',
              'transition-all duration-200 ease-in-out',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          />
          <button
            onClick={handleSend}
            disabled={!canSend}
            className={cn(
              'absolute right-2 w-10 h-10 flex items-center justify-center cursor-pointer',
              'bg-black text-white rounded-full',
              'hover:bg-gray-800 transition-colors duration-200',
              'disabled:opacity-30 disabled:cursor-not-allowed'
            )}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
