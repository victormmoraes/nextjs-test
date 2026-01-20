import { ReactNode } from 'react';

export interface CardProps {
  title?: string;
  subtitle?: string;
  noPadding?: boolean;
  footer?: ReactNode;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  children: ReactNode;
}
