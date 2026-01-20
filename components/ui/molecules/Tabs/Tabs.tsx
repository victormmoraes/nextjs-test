'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import type { TabsProps } from './Tabs.types';

const INDICATOR_PADDING = 40;

export function Tabs({ tabs, selectedTab: controlledSelectedTab, onTabChange }: TabsProps) {
  const [internalSelectedTab, setInternalSelectedTab] = useState(tabs[0]?.id || '');
  const selectedTab = controlledSelectedTab ?? internalSelectedTab;

  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, left: 0 });

  const updateIndicator = useCallback(() => {
    const currentIndex = tabs.findIndex((tab) => tab.id === selectedTab);
    if (currentIndex === -1 || !containerRef.current) return;

    const button = buttonRefs.current[currentIndex];
    const container = containerRef.current;

    if (!button) return;

    const buttonRect = button.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    if (buttonRect.width === 0 || containerRect.width === 0) return;

    const buttonLeft = buttonRect.left - containerRect.left;
    const buttonWidth = buttonRect.width;

    const newWidth = buttonWidth + INDICATOR_PADDING;
    const newLeft = buttonLeft - INDICATOR_PADDING / 2;

    setIndicatorStyle({ width: newWidth, left: newLeft });
  }, [tabs, selectedTab]);

  // Update indicator when selected tab changes
  useEffect(() => {
    // Wait for fonts to load
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        requestAnimationFrame(updateIndicator);
      });
    } else {
      requestAnimationFrame(updateIndicator);
    }
  }, [updateIndicator]);

  // Observe resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      updateIndicator();
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [updateIndicator]);

  const selectTab = (tabId: string) => {
    if (onTabChange) {
      onTabChange(tabId);
    } else {
      setInternalSelectedTab(tabId);
    }
  };

  return (
    <div ref={containerRef} className="flex items-center justify-center gap-12 mb-8 relative">
      {tabs.map((tab, index) => (
        <button
          key={tab.id}
          ref={(el) => {
            buttonRefs.current[index] = el;
          }}
          className={cn(
            'uppercase text-sm pb-2 transition-colors relative z-10 cursor-pointer',
            selectedTab === tab.id ? 'text-primary-800' : 'text-gray-600 hover:text-primary-800'
          )}
          onClick={() => selectTab(tab.id)}
        >
          {tab.label}
        </button>
      ))}

      <div
        className="absolute bottom-0 h-0.5 bg-primary-800 transition-all duration-25 ease-out"
        style={{
          width: indicatorStyle.width,
          left: indicatorStyle.left,
        }}
      />
    </div>
  );
}
