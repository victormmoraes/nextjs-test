'use client';

import { useEffect, useRef, RefObject } from 'react';

export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null>,
  handler: () => void,
  enabled: boolean = true
) {
  const enabledAtTimeOfEvent = useRef(false);

  // Track when enabled changes to true
  useEffect(() => {
    if (enabled) {
      // Mark that we just became enabled - use requestAnimationFrame to wait
      // until after the current event finishes processing
      enabledAtTimeOfEvent.current = false;
      const frameId = requestAnimationFrame(() => {
        enabledAtTimeOfEvent.current = true;
      });
      return () => cancelAnimationFrame(frameId);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    const listener = (event: MouseEvent | TouchEvent) => {
      // Ignore if we just became enabled (same frame as the triggering click)
      if (!enabledAtTimeOfEvent.current) {
        return;
      }
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler();
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler, enabled]);
}
