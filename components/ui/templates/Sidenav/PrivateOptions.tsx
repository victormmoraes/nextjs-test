'use client';

import { useState, useEffect, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Brain,
  Clock,
  FileText,
  Shield,
  Star,
  Search,
  Languages,
  GraduationCap,
  SearchCode,
} from 'lucide-react';
import { MenuItem } from '@/components/ui/molecules/MenuItem';

export interface PrivateOptionsProps {
  isCollapsed?: boolean;
  isVibraTenant?: boolean;
}

// Route configuration for menu items
const ROUTE_CONFIG = [
  { pattern: '/genai', item: 'genai' },
  { pattern: '/home/gen-ai', item: 'genai' },
  { pattern: '/last-updates', item: 'updates' },
  { pattern: '/home/processes/favorites', item: 'processos', subItem: 'favoritos' },
  { pattern: '/home/processes/vectorization-search', item: 'processos', subItem: 'vetorizacao' },
  { pattern: '/home/processes/search', item: 'processos', subItem: 'buscar' },
  { pattern: '/home/paineis', item: 'paineis' },
  { pattern: '/home/processos', item: 'processos' },
  { pattern: '/home/alertas', item: 'alertas' },
  { pattern: '/home/admin', item: 'admin' },
  { pattern: '/home/settings/language', item: 'idiomas' },
] as const;

// Navigation routes for menu items
const NAV_ROUTES: Record<string, string> = {
  genai: '/genai',
  updates: '/last-updates',
  idiomas: '/home/settings/language',
};

// Sub-item routes
const SUB_ITEM_ROUTES: Record<string, Record<string, string>> = {
  processos: {
    favoritos: '/home/processes/favorites',
    buscar: '/home/processes/search',
    vetorizacao: '/home/processes/vectorization-search',
  },
};

export function PrivateOptions({
  isCollapsed = false,
  isVibraTenant = false,
}: PrivateOptionsProps) {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [activeSubItem, setActiveSubItem] = useState<string | null>(null);

  // Determine active menu item based on current route
  const routeMatch = useMemo(() => {
    for (const config of ROUTE_CONFIG) {
      if (pathname.includes(config.pattern)) {
        // Skip language route for Vibra tenant
        if (config.item === 'idiomas' && isVibraTenant) continue;
        return config;
      }
    }
    return null;
  }, [pathname, isVibraTenant]);

  // Update active state when route changes
  useEffect(() => {
    if (routeMatch) {
      setActiveItem(routeMatch.item);
      if ('subItem' in routeMatch && routeMatch.subItem) {
        setActiveSubItem(routeMatch.subItem);
        setOpenDropdown(routeMatch.item);
      } else {
        setActiveSubItem(null);
      }
    } else {
      setActiveItem(null);
      setActiveSubItem(null);
    }
  }, [routeMatch]);

  const toggleDropdown = (menu: string) => {
    setOpenDropdown(openDropdown === menu ? null : menu);
    setActiveItem(menu);
  };

  const navigateTo = (item: string) => {
    // Block language menu for Vibra tenant
    if (item === 'idiomas' && isVibraTenant) return;

    setActiveItem(item);
    setActiveSubItem(null);
    setOpenDropdown(null);

    const route = NAV_ROUTES[item];
    if (route) {
      router.push(route);
    }
  };

  const navigateToSubItem = (parent: string, subItem: string) => {
    setActiveItem(parent);
    setActiveSubItem(subItem);

    const route = SUB_ITEM_ROUTES[parent]?.[subItem];
    if (route) {
      router.push(route);
    }
  };

  return (
    <div className="px-3">
      {/* Gen AI */}
      <div className="mb-2">
        <MenuItem
          icon={Brain}
          isActive={activeItem === 'genai'}
          onClick={() => navigateTo('genai')}
        >
          {!isCollapsed && t('menu.private.genAI').toUpperCase()}
        </MenuItem>
      </div>

      {/* Last Updates */}
      <div className="mb-2">
        <MenuItem
          icon={Clock}
          isActive={activeItem === 'updates'}
          onClick={() => navigateTo('updates')}
        >
          {!isCollapsed && t('menu.private.lastUpdates').toUpperCase()}
        </MenuItem>
      </div>

      {/* Processes (with dropdown) */}
      <div className="mb-2">
        <MenuItem
          icon={FileText}
          isActive={activeItem === 'processos'}
          hasDropdown={!isCollapsed}
          isOpen={openDropdown === 'processos'}
          onClick={() => toggleDropdown('processos')}
        >
          {!isCollapsed && t('menu.private.processes').toUpperCase()}
        </MenuItem>

        {openDropdown === 'processos' && (
          <div className={isCollapsed ? 'mt-2' : 'ml-4 mt-2'}>
            <div className="mb-1.5">
              <MenuItem
                icon={Star}
                variant="sub-item"
                isActive={activeSubItem === 'favoritos'}
                onClick={() => navigateToSubItem('processos', 'favoritos')}
              >
                {!isCollapsed && t('menu.private.favorites').toUpperCase()}
              </MenuItem>
            </div>
            <div className="mb-1.5">
              <MenuItem
                icon={Search}
                variant="sub-item"
                isActive={activeSubItem === 'buscar'}
                onClick={() => navigateToSubItem('processos', 'buscar')}
              >
                {!isCollapsed && t('menu.private.searchProcesses').toUpperCase()}
              </MenuItem>
            </div>
            <MenuItem
              icon={SearchCode}
              variant="sub-item"
              isActive={activeSubItem === 'vetorizacao'}
              onClick={() => navigateToSubItem('processos', 'vetorizacao')}
            >
              {!isCollapsed && t('menu.private.vectorizationSearch').toUpperCase()}
            </MenuItem>
          </div>
        )}
      </div>

      {/* Languages (disabled for Vibra tenant) */}
      <div className="mb-2">
        <MenuItem
          icon={Languages}
          isActive={activeItem === 'idiomas' && !isVibraTenant}
          disabled={isVibraTenant}
          onClick={() => navigateTo('idiomas')}
        >
          {!isCollapsed && t('menu.private.languages').toUpperCase()}
        </MenuItem>
      </div>

      {/* Training */}
      <div className="mb-2">
        <MenuItem
          icon={GraduationCap}
          isActive={activeItem === 'training'}
          disabled
          onClick={() => navigateTo('training')}
        >
          {!isCollapsed && t('menu.private.training').toUpperCase()}
        </MenuItem>
      </div>

      {/* Admin */}
      <div className="mb-2">
        <MenuItem
          icon={Shield}
          isActive={activeItem === 'admin'}
          disabled
          onClick={() => navigateTo('admin')}
        >
          {!isCollapsed && t('menu.private.admin').toUpperCase()}
        </MenuItem>
      </div>
    </div>
  );
}
