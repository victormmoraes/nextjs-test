'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { FileText, ChevronRight } from 'lucide-react';
import { DataTable } from '@/components/ui/organisms/DataTable';
import { Spinner } from '@/components/ui/atoms/Spinner';
import { Pagination } from '@/components/ui/molecules/Pagination';
import {
  ProcessNumberCell,
  TruncatedTextCell,
  CellTextButton,
} from '@/components/ui/organisms/DataTable/cells';
import type { DataTableColumn } from '@/components/ui/organisms/DataTable';
import type { ProcessWithRelations } from '@/types/process';

export interface TableSearchProps {
  searchTerm?: string;
  startDate?: Date | null;
  endDate?: Date | null;
  processes: ProcessWithRelations[];
  loading?: boolean;
  onTotalCountChange?: (count: number) => void;
}

export function TableSearch({
  searchTerm = '',
  startDate,
  endDate,
  processes,
  loading = false,
  onTotalCountChange,
}: TableSearchProps) {
  const t = useTranslations();

  // Mobile pagination
  const [mobileCurrentPage, setMobileCurrentPage] = useState(1);
  const mobileItemsPerPage = 8;

  // Check if any filters are applied
  const hasFilters = useMemo(() => {
    const hasTerm = searchTerm && searchTerm.trim().length > 0;
    return hasTerm || startDate !== null || endDate !== null;
  }, [searchTerm, startDate, endDate]);

  // Filtered processes (client-side filtering by search term)
  const filteredProcesses = useMemo(() => {
    if (!searchTerm || searchTerm.trim().length === 0) {
      return processes;
    }

    const search = searchTerm.toLowerCase().trim();
    return processes.filter(
      (p) =>
        p.processNumber.toLowerCase().includes(search) ||
        p.classification.name.toLowerCase().includes(search) ||
        p.interestedParties.some((party) =>
          party.toLowerCase().includes(search)
        )
    );
  }, [processes, searchTerm]);

  // Notify parent of count changes
  useEffect(() => {
    onTotalCountChange?.(filteredProcesses.length);
  }, [filteredProcesses.length, onTotalCountChange]);

  // Paginated data for mobile view
  const paginatedMobileData = useMemo(() => {
    const start = (mobileCurrentPage - 1) * mobileItemsPerPage;
    return filteredProcesses.slice(start, start + mobileItemsPerPage);
  }, [filteredProcesses, mobileCurrentPage]);

  const formatDate = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  const trackById = (row: ProcessWithRelations) => row.id;

  // Column definitions
  const columns = useMemo(
    (): DataTableColumn<ProcessWithRelations>[] => [
      {
        key: 'processNumber',
        header: t('table.headers.processNumber'),
        width: 'min-w-[180px]',
        render: (row) => (
          <ProcessNumberCell
            processNumber={row.processNumber}
            processLink={`/home/processes/details/${row.processNumber}`}
          />
        ),
      },
      {
        key: 'interestedParties',
        header: t('table.headers.interested'),
        width: 'min-w-[220px]',
        align: 'center',
        cellClassName: 'text-secondary truncate',
        render: (row) => row.interestedParties.join(', '),
      },
      {
        key: 'classification',
        header: t('table.headers.processType'),
        width: 'min-w-[200px]',
        align: 'center',
        cellClassName: 'text-secondary text-center',
        render: (row) => (
          <TruncatedTextCell text={row.classification.name} maxWidth="180px" />
        ),
      },
      {
        key: 'generationDate',
        header: t('table.headers.date'),
        width: 'min-w-[140px]',
        align: 'center',
        cellClassName: 'text-secondary',
        render: (row) => formatDate(row.generationDate),
      },
      {
        key: 'lastUpdateDate',
        header: t('table.headers.inclusionDate'),
        width: 'min-w-[140px]',
        align: 'center',
        cellClassName: 'text-secondary',
        render: (row) => formatDate(row.lastUpdateDate),
      },
      {
        key: 'actions',
        header: '',
        width: 'w-24',
        align: 'center',
        render: (row) => (
          <CellTextButton
            text={t('common.view')}
            href={`/home/processes/details/${row.processNumber}`}
          />
        ),
      },
    ],
    [t]
  );

  const emptyState = {
    icon: <FileText className="w-12 h-12 text-gray-400" />,
    message: t('table.noProcessesFound'),
    subtitle: t('table.noProcessesWithFilters'),
  };

  // Don't render anything if no filters are applied
  if (!hasFilters) {
    return null;
  }

  return (
    <>
      {/* Desktop: Data Table */}
      <div className="hidden lg:block">
        <DataTable
          data={filteredProcesses}
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
            <Spinner type="dots" message={t('table.searching')} />
          </div>
        ) : filteredProcesses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 space-y-3">
            <FileText className="w-12 h-12 text-gray-400" />
            <div className="space-y-1 text-center">
              <p className="text-sm font-medium text-gray-900">
                {t('table.noProcessesFound')}
              </p>
              <p className="text-sm text-gray-500">
                {t('table.noProcessesWithFilters')}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Process Cards */}
            <div className="divide-y divide-gray-100">
              {paginatedMobileData.map((process) => (
                <Link
                  key={process.id}
                  href={`/home/processes/details/${process.processNumber}`}
                  className="block p-4 hover:bg-gray-50 transition-colors"
                >
                  {/* Header: Process Number */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-primary-800 truncate">
                        {process.processNumber}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {formatDate(process.generationDate)}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                  </div>

                  {/* Info */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    <div>
                      <span className="text-gray-500">
                        {t('table.headers.interested')}
                      </span>
                      <p className="text-gray-900 font-medium truncate">
                        {process.interestedParties.join(', ') || '-'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">
                        {t('table.headers.processType')}
                      </span>
                      <p className="text-gray-900 font-medium truncate">
                        {process.classification.name || '-'}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Mobile Pagination */}
            {filteredProcesses.length > mobileItemsPerPage && (
              <Pagination
                currentPage={mobileCurrentPage}
                totalItems={filteredProcesses.length}
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
