'use client';

import { useState, useEffect } from 'react';
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

  // Set active item based on current route
  useEffect(() => {
    setActiveByRoute(pathname);
  }, [pathname]);

  const setActiveByRoute = (url: string) => {
    if (url.includes('/genai') || url.includes('/home/gen-ai')) {
      setActiveItem('genai');
    } else if (url.includes('/home/last-updates')) {
      setActiveItem('updates');
    } else if (url.includes('/home/processes/favorites')) {
      setActiveItem('processos');
      setActiveSubItem('favoritos');
      setOpenDropdown('processos');
    } else if (url.includes('/home/processes/vectorization-search')) {
      setActiveItem('processos');
      setActiveSubItem('vetorizacao');
      setOpenDropdown('processos');
    } else if (url.includes('/home/processes/search')) {
      setActiveItem('processos');
      setActiveSubItem('buscar');
      setOpenDropdown('processos');
    } else if (url.includes('/home/paineis')) {
      setActiveItem('paineis');
    } else if (url.includes('/home/processos')) {
      setActiveItem('processos');
    } else if (url.includes('/home/alertas')) {
      setActiveItem('alertas');
    } else if (url.includes('/home/admin')) {
      setActiveItem('admin');
    } else if (url.includes('/home/settings/language') && !isVibraTenant) {
      setActiveItem('idiomas');
    } else {
      setActiveItem(null);
    }
  };

  const toggleDropdown = (menu: string) => {
    if (openDropdown === menu) {
      setOpenDropdown(null);
    } else {
      setOpenDropdown(menu);
      setActiveItem(menu);
    }
  };

  const toggleMenuItem = (item: string) => {
    // Block language menu for Vibra tenant
    if (item === 'idiomas' && isVibraTenant) {
      return;
    }

    setActiveItem(item);
    setActiveSubItem(null);
    setOpenDropdown(null);

    if (item === 'genai') {
      router.push('/genai');
    } else if (item === 'updates') {
      router.push('/home/last-updates');
    } else if (item === 'idiomas') {
      router.push('/home/settings/language');
    }
  };

  const selectSubItem = (parent: string, subItem: string) => {
    setActiveItem(parent);
    setActiveSubItem(subItem);

    if (parent === 'processos' && subItem === 'favoritos') {
      router.push('/home/processes/favorites');
    } else if (parent === 'processos' && subItem === 'buscar') {
      router.push('/home/processes/search');
    } else if (parent === 'processos' && subItem === 'vetorizacao') {
      router.push('/home/processes/vectorization-search');
    }
  };

  return (
    <div className="px-3">
      {/* Gen AI */}
      <div className="mb-2">
        <MenuItem
          icon={Brain}
          isActive={activeItem === 'genai'}
          onClick={() => toggleMenuItem('genai')}
        >
          {!isCollapsed && t('menu.private.genAI').toUpperCase()}
        </MenuItem>
      </div>

      {/* Last Updates */}
      <div className="mb-2">
        <MenuItem
          icon={Clock}
          isActive={activeItem === 'updates'}
          onClick={() => toggleMenuItem('updates')}
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
                onClick={() => selectSubItem('processos', 'favoritos')}
              >
                {!isCollapsed && t('menu.private.favorites').toUpperCase()}
              </MenuItem>
            </div>
            <div className="mb-1.5">
              <MenuItem
                icon={Search}
                variant="sub-item"
                isActive={activeSubItem === 'buscar'}
                onClick={() => selectSubItem('processos', 'buscar')}
              >
                {!isCollapsed && t('menu.private.searchProcesses').toUpperCase()}
              </MenuItem>
            </div>
            <MenuItem
              icon={SearchCode}
              variant="sub-item"
              isActive={activeSubItem === 'vetorizacao'}
              onClick={() => selectSubItem('processos', 'vetorizacao')}
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
          onClick={() => toggleMenuItem('idiomas')}
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
          onClick={() => toggleMenuItem('training')}
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
          onClick={() => toggleMenuItem('admin')}
        >
          {!isCollapsed && t('menu.private.admin').toUpperCase()}
        </MenuItem>
      </div>
    </div>
  );
}
