'use client';

import { useState, useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useSidenav } from '@/contexts/SidenavContext';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { PrivateOptions } from './PrivateOptions';
import { PublicOptions } from './PublicOptions';

export interface SidenavProps {
  isVibraTenant?: boolean;
}

export function Sidenav({ isVibraTenant = false }: SidenavProps) {
  const pathname = usePathname();
  const { isCollapsed, isMobileOpen, closeMobile } = useSidenav();
  const isMobile = useMediaQuery('(max-width: 1023px)');

  const [isPublicRoute, setIsPublicRoute] = useState(false);

  // Check route on mount and navigation
  useEffect(() => {
    setIsPublicRoute(pathname.startsWith('/public'));
  }, [pathname]);

  // Close mobile menu on navigation
  useEffect(() => {
    if (isMobile) {
      closeMobile();
    }
  }, [pathname, isMobile, closeMobile]);

  // Close mobile menu when switching to desktop
  useEffect(() => {
    if (!isMobile && isMobileOpen) {
      closeMobile();
    }
  }, [isMobile, isMobileOpen, closeMobile]);

  // No mobile, always show expanded when open
  const isCollapsedForDisplay = isMobile ? false : isCollapsed;

  // Dynamic CSS classes for sidenav
  const sidenavClasses = useMemo(() => {
    const baseClasses = isCollapsed ? 'w-[80px]' : 'w-[265px]';

    if (isMobile) {
      // Mobile: hidden by default, slide-in when open
      return isMobileOpen
        ? 'w-[280px] translate-x-0'
        : 'w-[280px] -translate-x-full';
    }

    return baseClasses;
  }, [isCollapsed, isMobile, isMobileOpen]);

  return (
    <>
      {/* Backdrop overlay for mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[999] lg:hidden backdrop-blur-sm transition-opacity duration-300"
          onClick={closeMobile}
        />
      )}

      {/* Sidenav */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-screen bg-gray-200 shadow-lg transition-all duration-300',
          sidenavClasses,
          isMobileOpen ? 'z-[1001]' : 'z-[1000]'
        )}
      >
        <div className="flex flex-col h-full py-6">
          {/* Close button for mobile */}
          <div className="lg:hidden flex justify-end px-4 mb-2">
            <button
              onClick={closeMobile}
              className="p-2 hover:bg-gray-300 rounded-lg transition-colors duration-200"
            >
              <X className="w-6 h-6 text-gray-700" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto">
            {isPublicRoute ? (
              <PublicOptions isCollapsed={isCollapsedForDisplay} />
            ) : (
              <PrivateOptions
                isCollapsed={isCollapsedForDisplay}
                isVibraTenant={isVibraTenant}
              />
            )}
          </nav>

          {/* Logo */}
          {!isCollapsedForDisplay ? (
            <div className="px-6 pb-2 mt-auto">
              <Image
                src="/images/regmanager-logo-final.png"
                alt="RegManager"
                className="w-full h-auto"
                height={210}
                width={858}
              />
            </div>
          ) : (
            <div className="pb-2 mt-auto flex justify-center">
              <Image
                src="/images/regmanager-simbolo-final-transparente-02.png"
                alt="RegManager"
                className="w-[70px] h-auto"
                height={100}
                width={100}
              />
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
