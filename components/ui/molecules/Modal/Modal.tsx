'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ModalProps } from './Modal.types';

export function Modal({ title, maxWidth = 'max-w-md', footer, children, onClose }: ModalProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const startClosing = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
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
        className={cn(
          'bg-white rounded-lg shadow-8 w-full p-6 relative animate-modal',
          maxWidth,
          isClosing && 'modal-out'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={startClosing}
          className="absolute cursor-pointer top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {title && <h2 className="text-xl font-semibold text-primary-800 mb-4 pr-8">{title}</h2>}

        <div className="text-gray-700">{children}</div>

        {footer && <div className="mt-6 flex justify-end gap-3">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}
