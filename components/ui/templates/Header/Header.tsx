'use client';

import { useState, useMemo, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Headset,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useSidenav } from '@/contexts/SidenavContext';
import { Modal } from '@/components/ui/molecules/Modal';
import { Button } from '@/components/ui/atoms/Button';
import { useClickOutside } from '@/hooks/useClickOutside';

export interface HeaderProps {
  demoMode?: boolean;
  userName?: string;
  tenantName?: string;
  onLogout?: () => void;
}

const routeTitleMap: Record<string, string> = {
  '/genai': 'menu.private.genAI',
  '/home/gen-ai': 'menu.private.genAI',
  '/home/last-updates': 'menu.private.lastUpdates',
  '/home/dashboards': 'menu.private.dashboards',
  '/home/interdictions': 'menu.private.interdictions',
  '/home/conditioners': 'menu.private.conditioners',
  '/home/processes': 'menu.private.processes',
  '/home/processes/favorites': 'menu.private.favorites',
  '/home/processes/search': 'menu.private.searchProcesses',
  '/home/processes/vectorization-search': 'menu.private.vectorizationSearch',
  '/home/alerts/create': 'menu.private.createAlerts',
  '/home/alerts/manage': 'menu.private.manageAlerts',
  '/home/admin': 'menu.private.admin',
  '/home/settings/language': 'language.title',
  '/public/gen-ai': 'menu.private.genAI',
  '/public': 'menu.private.genAI',
};

export function Header({
  demoMode = false,
  userName = '',
  tenantName = 'DEFAULT',
  onLogout,
}: HeaderProps) {
  const pathname = usePathname();
  const t = useTranslations();
  const { isCollapsed, toggle, toggleMobile } = useSidenav();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  useClickOutside(dropdownRef, () => {
    setIsDropdownOpen(false);
  });

  const displayTenantName = demoMode ? 'DEMO' : tenantName.toUpperCase();

  const currentPageTitle = useMemo(() => {
    const route = pathname.split('?')[0];

    // Check for dynamic process details route
    if (route.startsWith('/home/processes/details/')) {
      return t('menu.private.processDetails');
    }

    const translationKey = routeTitleMap[route];
    if (translationKey) {
      return t(translationKey);
    }

    return '';
  }, [pathname, t]);

  const handleLogout = () => {
    setIsDropdownOpen(false);
    onLogout?.();
  };

  return (
    <>
      <header className="w-full bg-white border-b border-gray-200 shadow-sm">
        <div className="relative flex items-center justify-between px-3 lg:px-6 py-2.5 lg:py-4 gap-2 lg:gap-4">
          {/* Left: Page Title & Navigation Controls */}
          <div className="flex items-center gap-2 lg:gap-4 flex-1 min-w-0 overflow-hidden">
            {/* Hamburger menu (mobile) */}
            <button
              onClick={toggleMobile}
              className="lg:hidden p-1.5 hover:bg-gray-100 rounded-lg transition-all duration-200 cursor-pointer shrink-0"
            >
              <Menu className="w-5 h-5 text-gray-900" />
            </button>

            {/* Sidenav collapse button (desktop) */}
            <button
              onClick={toggle}
              className="hidden lg:block p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 cursor-pointer"
            >
              {isCollapsed ? (
                <ChevronRight className="w-5 h-5 text-gray-900" />
              ) : (
                <ChevronLeft className="w-5 h-5 text-gray-900" />
              )}
            </button>

            {currentPageTitle && (
              <h2 className="text-sm lg:text-lg text-gray-900 truncate max-w-[140px] sm:max-w-none">
                {currentPageTitle}
              </h2>
            )}
          </div>

          {/* Right: User Menu */}
          <div className="flex items-center gap-1.5 lg:gap-4 shrink-0">
            {/* Help & Tenant Info */}
            <div className="flex items-center gap-1.5 lg:gap-3">
              <div className="relative group">
                <button
                  className={cn(
                    'p-1 rounded-lg transition-all duration-200',
                    demoMode
                      ? 'cursor-not-allowed opacity-50'
                      : 'hover:bg-gray-100 cursor-pointer'
                  )}
                  disabled={demoMode}
                  onClick={() => !demoMode && setShowHelpModal(true)}
                >
                  <Headset className="w-5 h-5 text-gray-900" />
                </button>
                {/* Tooltip */}
                {!demoMode && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                    {t('common.support')}
                  </div>
                )}
              </div>
              <span className="hidden sm:inline text-sm lg:text-md text-gray-900">
                Ambiente: {displayTenantName}
              </span>
              <span className="sm:hidden text-sm text-gray-900">
                {displayTenantName}
              </span>
            </div>

            {/* Vertical Divider */}
            <div className="h-6 lg:h-8 w-px bg-gray-300" />

            {/* User Menu */}
            <div className="relative" ref={dropdownRef}>
              {demoMode ? (
                <button
                  className="flex items-center gap-1 lg:gap-2 px-2 lg:px-4 py-2 rounded-lg cursor-not-allowed opacity-50"
                  disabled
                >
                  <span className="text-sm lg:text-md text-gray-900">Demo</span>
                  <ChevronDown className="w-4 lg:w-5 h-4 lg:h-5 text-gray-900" />
                </button>
              ) : (
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center cursor-pointer gap-1 lg:gap-2 px-2 lg:px-4 py-2 hover:bg-gray-100 rounded-lg transition-all duration-200"
                >
                  <span className="text-sm lg:text-md text-gray-900 max-w-[80px] lg:max-w-none truncate">
                    {userName}
                  </span>
                  <ChevronDown
                    className={cn(
                      'w-4 lg:w-5 h-4 lg:h-5 text-gray-900 transition-transform duration-200',
                      isDropdownOpen && 'rotate-180'
                    )}
                  />
                </button>
              )}

              {/* Dropdown Menu */}
              {isDropdownOpen && !demoMode && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50 min-w-full whitespace-nowrap">
                  <button
                    onClick={handleLogout}
                    className="w-full cursor-pointer flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                  >
                    <LogOut className="w-4 h-4 shrink-0" />
                    <span>{t('common.logout')}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Help Modal */}
      {showHelpModal && (
        <Modal
          title={t('auth.login.helpModal.title')}
          onClose={() => setShowHelpModal(false)}
          footer={
            <Button variant="primary" onClick={() => setShowHelpModal(false)}>
              {t('auth.login.helpModal.close')}
            </Button>
          }
        >
          <div className="space-y-4">
            <p className="text-gray-700">{t('auth.login.helpModal.message')}</p>
            <a
              href="mailto:suporte@rioanalytics.com.br"
              className="block text-primary-800 hover:text-primary-600 font-medium transition-colors"
            >
              suporte@rioanalytics.com.br
            </a>
          </div>
        </Modal>
      )}
    </>
  );
}
