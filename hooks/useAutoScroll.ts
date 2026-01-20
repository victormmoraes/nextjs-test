'use client';

import { useRef, useCallback, useState, useEffect } from 'react';

export interface UseAutoScrollOptions {
  /** Distance from bottom to consider "at bottom" (default: 100px) */
  threshold?: number;
  /** Scroll behavior (default: 'smooth') */
  behavior?: ScrollBehavior;
}

export interface UseAutoScrollReturn {
  /** Ref to attach to the scrollable container */
  containerRef: React.RefObject<HTMLDivElement | null>;
  /** Manually scroll to bottom */
  scrollToBottom: () => void;
  /** Whether the container is currently at/near the bottom */
  isAtBottom: boolean;
  /** Whether the user is manually scrolling (not at bottom) */
  isUserScrolling: boolean;
  /** Should auto-scroll (true when at bottom) */
  shouldAutoScroll: boolean;
  /** Handle scroll event - call this on the container's onScroll */
  handleScroll: () => void;
}

/**
 * Hook for managing auto-scroll behavior in chat-like interfaces.
 *
 * Features:
 * - Auto-scrolls to bottom when new content is added (if user is at bottom)
 * - Pauses auto-scroll when user manually scrolls up
 * - Resumes auto-scroll when user scrolls back to bottom
 *
 * @example
 * ```tsx
 * const { containerRef, scrollToBottom, isAtBottom, handleScroll } = useAutoScroll();
 *
 * // In your component
 * <div ref={containerRef} onScroll={handleScroll}>
 *   {messages.map(...)}
 * </div>
 *
 * // After adding new messages
 * useEffect(() => {
 *   if (shouldAutoScroll) {
 *     scrollToBottom();
 *   }
 * }, [messages, shouldAutoScroll, scrollToBottom]);
 * ```
 */
export function useAutoScroll(options: UseAutoScrollOptions = {}): UseAutoScrollReturn {
  const { threshold = 100, behavior = 'smooth' } = options;

  const containerRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [isUserScrolling, setIsUserScrolling] = useState(false);

  // Calculate if we're at the bottom
  const checkIfAtBottom = useCallback(() => {
    const container = containerRef.current;
    if (!container) return true;

    const { scrollHeight, scrollTop, clientHeight } = container;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    return distanceFromBottom <= threshold;
  }, [threshold]);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior,
    });

    // After scrolling, we're at the bottom
    setIsAtBottom(true);
    setIsUserScrolling(false);
  }, [behavior]);

  // Handle scroll events
  const handleScroll = useCallback(() => {
    const atBottom = checkIfAtBottom();
    setIsAtBottom(atBottom);
    setIsUserScrolling(!atBottom);
  }, [checkIfAtBottom]);

  // Initial check when container is mounted
  useEffect(() => {
    if (containerRef.current) {
      setIsAtBottom(checkIfAtBottom());
    }
  }, [checkIfAtBottom]);

  return {
    containerRef,
    scrollToBottom,
    isAtBottom,
    isUserScrolling,
    shouldAutoScroll: isAtBottom,
    handleScroll,
  };
}
