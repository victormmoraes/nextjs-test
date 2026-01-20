'use client';

import { useTranslations } from 'next-intl';
import {
  Brain,
  Clock,
  FileText,
  Languages,
  GraduationCap,
  Shield,
} from 'lucide-react';
import { MenuItem } from '@/components/ui/molecules/MenuItem';

export interface PublicOptionsProps {
  isCollapsed?: boolean;
}

export function PublicOptions({ isCollapsed = false }: PublicOptionsProps) {
  const t = useTranslations();

  return (
    <div className="px-3">
      {/* Gen AI (Active) */}
      <div className="mb-2">
        <MenuItem icon={Brain} isActive>
          {!isCollapsed && t('menu.private.genAI').toUpperCase()}
        </MenuItem>
      </div>

      {/* Last Updates (Disabled) */}
      <div className="mb-2">
        <MenuItem icon={Clock} isActive={false} disabled>
          {!isCollapsed && t('menu.private.lastUpdates').toUpperCase()}
        </MenuItem>
      </div>

      {/* Processes (Disabled) */}
      <div className="mb-2">
        <MenuItem icon={FileText} isActive={false} disabled>
          {!isCollapsed && t('menu.private.processes').toUpperCase()}
        </MenuItem>
      </div>

      {/* Languages (Disabled) */}
      <div className="mb-2">
        <MenuItem icon={Languages} isActive={false} disabled>
          {!isCollapsed && t('menu.private.languages').toUpperCase()}
        </MenuItem>
      </div>

      {/* Training (Disabled) */}
      <div className="mb-2">
        <MenuItem icon={GraduationCap} isActive={false} disabled>
          {!isCollapsed && t('menu.private.training').toUpperCase()}
        </MenuItem>
      </div>

      {/* Admin (Disabled) */}
      <div className="mb-2">
        <MenuItem icon={Shield} isActive={false} disabled>
          {!isCollapsed && t('menu.private.admin').toUpperCase()}
        </MenuItem>
      </div>
    </div>
  );
}
