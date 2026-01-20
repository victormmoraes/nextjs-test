'use client';

import { useState, useMemo, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { FileText } from 'lucide-react';
import { DataTable } from '@/components/ui/organisms/DataTable';
import { Spinner } from '@/components/ui/atoms/Spinner';
import { Pagination } from '@/components/ui/molecules/Pagination';
import type { DataTableColumn } from '@/components/ui/organisms/DataTable';
import type { Protocol } from '@prisma/client';

export interface TableProtocolsProps {
  protocols: Protocol[];
  loading?: boolean;
  onTotalCountChange?: (count: number) => void;
}

export function TableProtocols({
  protocols,
  loading = false,
  onTotalCountChange,
}: TableProtocolsProps) {
  const t = useTranslations();

  // Mobile pagination
  const [mobileCurrentPage, setMobileCurrentPage] = useState(1);
  const mobileItemsPerPage = 5;

  // Notify parent of count changes
  useEffect(() => {
    onTotalCountChange?.(protocols.length);
  }, [protocols.length, onTotalCountChange]);

  // Paginated data for mobile view
  const paginatedMobileData = useMemo(() => {
    const start = (mobileCurrentPage - 1) * mobileItemsPerPage;
    return protocols.slice(start, start + mobileItemsPerPage);
  }, [protocols, mobileCurrentPage]);

  const formatDate = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  const trackById = (row: Protocol) => row.id;

  // Column definitions
  const columns: DataTableColumn<Protocol>[] = [
    {
      key: 'protocolNumber',
      header: t('tableProtocols.headers.processDocument'),
      width: 'min-w-[200px]',
      cellClassName: 'text-secondary',
    },
    {
      key: 'protocolType',
      header: t('tableProtocols.headers.type'),
      width: 'min-w-[200px]',
      align: 'center',
      cellClassName: 'text-secondary',
    },
    {
      key: 'protocolCreatedAt',
      header: t('tableProtocols.headers.date'),
      width: 'min-w-[140px]',
      align: 'center',
      cellClassName: 'text-secondary',
      render: (row) => formatDate(row.protocolCreatedAt),
    },
    {
      key: 'protocolIncludedAt',
      header: t('tableProtocols.headers.inclusionDate'),
      width: 'min-w-[140px]',
      align: 'center',
      cellClassName: 'text-secondary',
      render: (row) => formatDate(row.protocolIncludedAt),
    },
    {
      key: 'protocolUnit',
      header: t('tableProtocols.headers.unit'),
      width: 'min-w-[180px]',
      align: 'center',
      cellClassName: 'text-secondary',
    },
  ];

  const emptyState = {
    icon: <FileText className="w-12 h-12 text-gray-400" />,
    message: t('tableProtocols.noProtocolsFound'),
    subtitle: t('tableProtocols.noProtocolsAvailable'),
  };

  return (
    <>
      {/* Desktop: Data Table */}
      <div className="hidden lg:block">
        <DataTable
          data={protocols}
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
        ) : protocols.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 space-y-3">
            <FileText className="w-12 h-12 text-gray-400" />
            <div className="space-y-1 text-center">
              <p className="text-sm font-medium text-gray-900">
                {t('tableProtocols.noProtocolsFound')}
              </p>
              <p className="text-sm text-gray-500">
                {t('tableProtocols.noProtocolsAvailable')}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Protocol Cards */}
            <div className="divide-y divide-gray-100">
              {paginatedMobileData.map((protocol) => (
                <div key={protocol.id} className="p-4">
                  {/* Protocol Number */}
                  <p className="text-sm font-semibold text-gray-900 mb-2">
                    {protocol.protocolNumber}
                  </p>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                    <div>
                      <span className="text-gray-500">
                        {t('tableProtocols.headers.type')}
                      </span>
                      <p className="text-gray-700 font-medium">
                        {protocol.protocolType || '-'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">
                        {t('tableProtocols.headers.unit')}
                      </span>
                      <p className="text-gray-700 font-medium truncate">
                        {protocol.protocolUnit || '-'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">
                        {t('tableProtocols.headers.date')}
                      </span>
                      <p className="text-gray-700 font-medium">
                        {formatDate(protocol.protocolCreatedAt)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">
                        {t('tableProtocols.headers.inclusionDate')}
                      </span>
                      <p className="text-gray-700 font-medium">
                        {formatDate(protocol.protocolIncludedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile Pagination */}
            {protocols.length > mobileItemsPerPage && (
              <Pagination
                currentPage={mobileCurrentPage}
                totalItems={protocols.length}
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
