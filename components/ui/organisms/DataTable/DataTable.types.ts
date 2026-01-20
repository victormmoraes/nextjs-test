import { ReactNode, ComponentType } from 'react';

export type ColumnAlignment = 'left' | 'center' | 'right';
export type SortDirection = 'asc' | 'desc' | null;

export interface DataTableColumn<T = unknown> {
  key: string;
  header: string;
  align?: ColumnAlignment;
  width?: string;
  frozen?: boolean;
  headerClassName?: string;
  cellClassName?: string;
  headerComponent?: ComponentType<Record<string, unknown>>;
  headerProps?: Record<string, unknown>;
  render?: (item: T, index: number) => ReactNode;
  component?: ComponentType<Record<string, unknown>>;
  getProps?: (item: T, index: number) => Record<string, unknown>;
}

export interface ActionColumnConfig<T = unknown> {
  header?: string;
  position?: 'left' | 'right';
  align?: ColumnAlignment;
  headerClassName?: string;
  cellClassName?: string;
  render: (item: T, index: number) => ReactNode;
}

export interface DataTableCellContext<T = unknown> {
  row: T;
  index: number;
  isEven: boolean;
  isOdd: boolean;
}

export interface EmptyStateConfig {
  icon?: ReactNode;
  message: string;
  subtitle?: string;
}

export interface SkeletonConfig {
  rows?: number;
}

export interface RowClickEvent<T = unknown> {
  row: T;
  index: number;
  event: React.MouseEvent;
}

export interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  actionColumn?: ActionColumnConfig<T>;
  isLoading?: boolean;
  skeletonConfig?: SkeletonConfig;
  emptyState?: EmptyStateConfig;
  hoverable?: boolean;
  zebraStriping?: boolean;
  paginated?: boolean;
  itemsPerPage?: number;
  onRowClick?: (event: RowClickEvent<T>) => void;
  trackBy?: (item: T, index: number) => string | number;
}
