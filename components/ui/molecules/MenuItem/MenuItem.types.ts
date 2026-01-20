import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

export type MenuItemVariant = 'default' | 'sub-item';

export interface MenuItemProps {
  variant?: MenuItemVariant;
  disabled?: boolean;
  isActive?: boolean;
  icon?: LucideIcon;
  hasDropdown?: boolean;
  isOpen?: boolean;
  onClick?: () => void;
  children: ReactNode;
}
