'use client';

import { useState, useMemo, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Clock } from 'lucide-react';
import { DataTable } from '@/components/ui/organisms/DataTable';
import { Spinner } from '@/components/ui/atoms/Spinner';
import { Pagination } from '@/components/ui/molecules/Pagination';
import type { DataTableColumn } from '@/components/ui/organisms/DataTable';
import type { OnGoingList } from '@prisma/client';

export interface TableOngoingProps {
  ongoing: OnGoingList[];
  loading?: boolean;
  onTotalCountChange?: (count: number) => void;
}

export function TableOngoing({
  ongoing,
  loading = false,
  onTotalCountChange,
}: TableOngoingProps) {
  const t = useTranslations();

  // Mobile pagination
  const [mobileCurrentPage, setMobileCurrentPage] = useState(1);
  const mobileItemsPerPage = 5;

  // Notify parent of count changes
  useEffect(() => {
    onTotalCountChange?.(ongoing.length);
  }, [ongoing.length, onTotalCountChange]);

  // Paginated data for mobile view
  const paginatedMobileData = useMemo(() => {
    const start = (mobileCurrentPage - 1) * mobileItemsPerPage;
    return ongoing.slice(start, start + mobileItemsPerPage);
  }, [ongoing, mobileCurrentPage]);

  const formatDateTime = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const dateStr = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    return `${dateStr} ${time}`;
  };

  const trackById = (row: OnGoingList) => row.id;

  // Column definitions
  const columns: DataTableColumn<OnGoingList>[] = [
    {
      key: 'onGoingDate',
      header: t('tableOngoing.headers.dateTime'),
      width: 'min-w-[160px]',
      headerClassName: 'font-bold',
      cellClassName: 'text-secondary',
      render: (row) => formatDateTime(row.onGoingDate),
    },
    {
      key: 'onGoingUnit',
      header: t('tableOngoing.headers.unit'),
      width: 'min-w-[180px]',
      headerClassName: 'font-bold',
      cellClassName: 'text-secondary',
    },
    {
      key: 'onGoingDescription',
      header: t('tableOngoing.headers.description'),
      width: 'min-w-[300px]',
      headerClassName: 'font-bold',
      cellClassName: 'text-secondary',
    },
  ];

  const emptyState = {
    icon: <Clock className="w-12 h-12 text-gray-400" />,
    message: t('tableOngoing.noOngoingFound'),
    subtitle: t('tableOngoing.noOngoingAvailable'),
  };

  return (
    <>
      {/* Desktop: Data Table */}
      <div className="hidden lg:block">
        <DataTable
          data={ongoing}
          columns={columns}
          isLoading={loading}
          zebraStriping
          paginated
          itemsPerPage={5}
          emptyState={emptyState}
          trackBy={trackById}
        />
      </div>

      {/* Mobile: Card View */}
      <div className="lg:hidden">
        {loading ? (
          <div className="py-8">
            <Spinner type="dots" message={t('table.loading')} />
          </div>
        ) : ongoing.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 space-y-3">
            <Clock className="w-12 h-12 text-gray-400" />
            <div className="space-y-1 text-center">
              <p className="text-sm font-medium text-gray-900">
                {t('tableOngoing.noOngoingFound')}
              </p>
              <p className="text-sm text-gray-500">
                {t('tableOngoing.noOngoingAvailable')}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Ongoing Cards */}
            <div className="divide-y divide-gray-100">
              {paginatedMobileData.map((item) => (
                <div key={item.id} className="p-4">
                  {/* Date and Unit */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-primary-800">
                      {formatDateTime(item.onGoingDate)}
                    </span>
                    <span
                      className="text-xs text-gray-500 truncate max-w-[120px]"
                      title={item.onGoingUnit}
                    >
                      {item.onGoingUnit}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {item.onGoingDescription}
                  </p>
                </div>
              ))}
            </div>

            {/* Mobile Pagination */}
            {ongoing.length > mobileItemsPerPage && (
              <Pagination
                currentPage={mobileCurrentPage}
                totalItems={ongoing.length}
                itemsPerPage={mobileItemsPerPage}
                onPageChange={setMobileCurrentPage}
              />
            )}
          </>
        )}
      </div>
    </>
  );
}
