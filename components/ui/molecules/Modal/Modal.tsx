'use client';

import { useState, useEffect, useCallback, useRef, useId } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ModalProps } from './Modal.types';

export function Modal({ title, maxWidth = 'max-w-md', footer, children, onClose }: ModalProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousActiveElement = useRef<Element | null>(null);
  const titleId = useId();

  useEffect(() => {
    setMounted(true);
    previousActiveElement.current = document.activeElement;

    // Focus the modal on mount
    modalRef.current?.focus();

    return () => {
      setMounted(false);
      // Clear timeout on unmount
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
      // Restore focus on unmount
      if (previousActiveElement.current instanceof HTMLElement) {
        previousActiveElement.current.focus();
      }
    };
  }, []);

  const startClosing = useCallback(() => {
    setIsClosing(true);
    closeTimeoutRef.current = setTimeout(() => {
      onClose();
    }, 150);
  }, [onClose]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        startClosing();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [startClosing]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const onBackdropClick = () => {
    startClosing();
  };

  // Focus trap handler
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key !== 'Tab' || !modalRef.current) return;

      const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    },
    []
  );

  if (!mounted) return null;

  return createPortal(
    <div
      className={cn(
        'fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in',
        isClosing && 'animate-out fade-out'
      )}
      onClick={onBackdropClick}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className={cn(
          'bg-white rounded-lg shadow-8 w-full p-6 relative animate-modal outline-none',
          maxWidth,
          isClosing && 'modal-out'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={startClosing}
          aria-label="Close"
          className="absolute cursor-pointer top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" aria-hidden="true" />
        </button>

        {title && (
          <h2 id={titleId} className="text-xl font-semibold text-primary-800 mb-4 pr-8">
            {title}
          </h2>
        )}

        <div className="text-gray-700">{children}</div>

        {footer && <div className="mt-6 flex justify-end gap-3">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}
