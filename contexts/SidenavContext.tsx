'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface SidenavContextValue {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  toggle: () => void;
  setCollapsed: (collapsed: boolean) => void;
  toggleMobile: () => void;
  openMobile: () => void;
  closeMobile: () => void;
}

const SidenavContext = createContext<SidenavContextValue | undefined>(undefined);

interface SidenavProviderProps {
  children: ReactNode;
  defaultCollapsed?: boolean;
}

export function SidenavProvider({ children, defaultCollapsed = false }: SidenavProviderProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggle = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  const setCollapsed = useCallback((collapsed: boolean) => {
    setIsCollapsed(collapsed);
  }, []);

  const toggleMobile = useCallback(() => {
    setIsMobileOpen((prev) => !prev);
  }, []);

  const openMobile = useCallback(() => {
    setIsMobileOpen(true);
  }, []);

  const closeMobile = useCallback(() => {
    setIsMobileOpen(false);
  }, []);

  return (
    <SidenavContext.Provider
      value={{
        isCollapsed,
        isMobileOpen,
        toggle,
        setCollapsed,
        toggleMobile,
        openMobile,
        closeMobile,
      }}
    >
      {children}
    </SidenavContext.Provider>
  );
}

export function useSidenav() {
  const context = useContext(SidenavContext);
  if (context === undefined) {
    throw new Error('useSidenav must be used within a SidenavProvider');
  }
  return context;
}
