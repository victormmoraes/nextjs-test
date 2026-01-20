import { ReactNode } from 'react';

export type ColumnAlignment = 'left' | 'center' | 'right';
export type SortDirection = 'asc' | 'desc' | null;

/**
 * Component type that accepts any props.
 * Used for custom header and cell components in DataTable columns.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyComponent = React.ComponentType<any>;

export interface DataTableColumn<T = unknown> {
  key: string;
  header: string;
  align?: ColumnAlignment;
  width?: string;
  frozen?: boolean;
  headerClassName?: string;
  cellClassName?: string;
  /** Custom header component. Use with headerProps to pass props. */
  headerComponent?: AnyComponent;
  headerProps?: Record<string, unknown>;
  render?: (item: T, index: number) => ReactNode;
  /** Custom cell component. Use with getProps to pass props. */
  component?: AnyComponent;
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
