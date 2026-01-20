'use client';

import { useState, useMemo, useEffect, createElement } from 'react';
import { FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Pagination } from '@/components/ui/molecules/Pagination';
import type { DataTableProps, DataTableColumn, ActionColumnConfig } from './DataTable.types';

function getValue<T>(row: T, key: string): string {
  const value = (row as Record<string, unknown>)[key];
  if (value === null || value === undefined) return '-';
  if (Array.isArray(value)) return value.join(', ');
  return String(value);
}

function getHeaderCellClass<T>(col: DataTableColumn<T> | ActionColumnConfig<T>): string {
  const classes = [
    'px-4',
    'py-3',
    'text-xs',
    'font-bold',
    'tracking-wider',
    'text-[#757575]',
    'uppercase',
    'whitespace-nowrap',
  ];

  const align = col.align || 'left';
  classes.push(align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left');

  if ('headerClassName' in col && col.headerClassName) {
    classes.push(col.headerClassName);
  }
  if ('width' in col && col.width) {
    classes.push(col.width);
  }

  return classes.join(' ');
}

function getCellClass<T>(col: DataTableColumn<T> | ActionColumnConfig<T>): string {
  const classes = ['px-4', 'py-4', 'text-sm', 'whitespace-nowrap'];

  const align = col.align || 'left';
  classes.push(align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left');

  if ('cellClassName' in col && col.cellClassName) {
    classes.push(col.cellClassName);
  }
  if ('width' in col && col.width) {
    classes.push(col.width);
  }

  return classes.join(' ');
}

function getSkeletonWidth(key: string): string {
  const widths = ['w-20', 'w-24', 'w-32', 'w-40', 'w-48'];
  return widths[key.charCodeAt(0) % widths.length];
}

export function DataTable<T>({
  data,
  columns,
  actionColumn,
  isLoading = false,
  skeletonConfig,
  emptyState,
  hoverable = false,
  zebraStriping = false,
  paginated = false,
  itemsPerPage = 10,
  onRowClick,
  trackBy,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page when data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [data]);

  const skeletonRows = useMemo(() => {
    return Array.from({ length: skeletonConfig?.rows || 5 }, (_, i) => i);
  }, [skeletonConfig]);

  const displayData = useMemo(() => {
    if (!paginated) return data;
    const start = (currentPage - 1) * itemsPerPage;
    return data.slice(start, start + itemsPerPage);
  }, [data, paginated, currentPage, itemsPerPage]);

  const getRowClass = (isEven: boolean): string => {
    const classes: string[] = [];

    if (zebraStriping) {
      classes.push(isEven ? 'bg-gray-50' : 'bg-white');
    } else {
      classes.push('bg-white');
    }

    if (hoverable) {
      classes.push('hover:bg-gray-100', 'transition-colors', 'duration-150');
    }

    if (onRowClick) {
      classes.push('cursor-pointer');
    }

    return classes.join(' ');
  };

  const handleRowClick = (row: T, index: number, event: React.MouseEvent) => {
    if (!onRowClick) return;

    const target = event.target as HTMLElement;
    if (target.closest('button, a, input, select, textarea, [data-no-row-click]')) return;

    onRowClick({ row, index, event });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Empty state
  if (!isLoading && data.length === 0) {
    return (
      <div className="overflow-hidden rounded-lg">
        <div className="flex flex-col items-center justify-center py-16 px-4 space-y-3">
          {emptyState?.icon ? (
            emptyState.icon
          ) : (
            <FileText size={48} className="text-gray-400" />
          )}
          <div className="space-y-1 text-center">
            <p className="text-sm font-medium text-gray-900">
              {emptyState?.message || 'No data found'}
            </p>
            {emptyState?.subtitle && (
              <p className="text-sm text-gray-500">{emptyState.subtitle}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {actionColumn?.position === 'left' && (
                <th className={getHeaderCellClass(actionColumn)}>
                  {actionColumn.header || 'Actions'}
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    getHeaderCellClass(col),
                    col.frozen && 'sticky left-0 z-20 bg-gray-50 shadow-[1px_0_0_0_#e5e7eb]'
                  )}
                >
                  {col.headerComponent ? (
                    createElement(col.headerComponent, col.headerProps || {})
                  ) : (
                    col.header
                  )}
                </th>
              ))}
              {(!actionColumn?.position || actionColumn?.position === 'right') && actionColumn && (
                <th className={getHeaderCellClass(actionColumn)}>
                  {actionColumn.header || 'Actions'}
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 bg-white">
            {isLoading
              ? skeletonRows.map((i) => (
                  <tr key={i} className="animate-pulse">
                    {actionColumn?.position === 'left' && (
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="h-4 w-20 rounded bg-gray-200" />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn(
                          'px-4 py-4 whitespace-nowrap',
                          col.frozen && 'sticky left-0 z-10 bg-white shadow-[1px_0_0_0_#e5e7eb]'
                        )}
                      >
                        <div className={cn('h-4 rounded bg-gray-200', getSkeletonWidth(col.key))} />
                      </td>
                    ))}
                    {(!actionColumn?.position || actionColumn?.position === 'right') &&
                      actionColumn && (
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="h-4 w-20 rounded bg-gray-200" />
                        </td>
                      )}
                  </tr>
                ))
              : displayData.map((row, index) => {
                  const isEven = index % 2 === 0;
                  const isOdd = !isEven;
                  const key = trackBy ? trackBy(row, index) : index;

                  return (
                    <tr
                      key={key}
                      className={getRowClass(isEven)}
                      onClick={(e) => handleRowClick(row, index, e)}
                    >
                      {actionColumn?.position === 'left' && (
                        <td className={getCellClass(actionColumn)}>
                          {actionColumn.render(row, index)}
                        </td>
                      )}
                      {columns.map((col) => (
                        <td
                          key={col.key}
                          className={cn(
                            getCellClass(col),
                            col.frozen && 'sticky left-0 z-10 shadow-[1px_0_0_0_#e5e7eb]',
                            col.frozen && (!zebraStriping || isOdd) && 'bg-white',
                            col.frozen && zebraStriping && isEven && 'bg-gray-50'
                          )}
                        >
                          {col.component ? (
                            createElement(col.component, col.getProps?.(row, index) || {})
                          ) : col.render ? (
                            col.render(row, index)
                          ) : (
                            getValue(row, col.key)
                          )}
                        </td>
                      ))}
                      {(!actionColumn?.position || actionColumn?.position === 'right') &&
                        actionColumn && (
                          <td className={getCellClass(actionColumn)}>
                            {actionColumn.render(row, index)}
                          </td>
                        )}
                    </tr>
                  );
                })}
          </tbody>
        </table>
      </div>

      {paginated && data.length > itemsPerPage && (
        <Pagination
          currentPage={currentPage}
          totalItems={data.length}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
