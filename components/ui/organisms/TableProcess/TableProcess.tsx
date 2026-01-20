'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  Download,
  FileText,
  FileEdit,
  Star,
  ChevronRight,
  ArrowUpDown,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { DataTable } from '@/components/ui/organisms/DataTable';
import { Spinner } from '@/components/ui/atoms/Spinner';
import { Modal } from '@/components/ui/molecules/Modal';
import { Pagination } from '@/components/ui/molecules/Pagination';
import {
  ProcessNumberCell,
  SortableHeader,
  TruncatedTextCell,
  CellActionButton,
} from '@/components/ui/organisms/DataTable/cells';
import type { DataTableColumn } from '@/components/ui/organisms/DataTable';
import type { ProcessWithRelations } from '@/types/process';
import type { ProcessSummary } from '@prisma/client';
import {
  isFiscalizationBaseSummary,
  isFiscalizationFuelQualitySummary,
} from '@/types/process';

type SortDirection = 'asc' | 'desc' | null;

export interface TableProcessProps {
  processes: ProcessWithRelations[];
  loading?: boolean;
  favoritesOnly?: boolean;
  favoriteProcessIds?: Set<string>;
  onFavoriteToggle?: (processId: string) => void;
  onProcessCountChange?: (count: number) => void;
  onLoadSummary?: (processId: string) => Promise<ProcessSummary | null>;
}

export function TableProcess({
  processes,
  loading = false,
  favoritesOnly = false,
  favoriteProcessIds = new Set(),
  onFavoriteToggle,
  onProcessCountChange,
  onLoadSummary,
}: TableProcessProps) {
  const t = useTranslations();

  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [currentSummary, setCurrentSummary] = useState<ProcessSummary | null>(null);


  // Mobile pagination
  const [mobileCurrentPage, setMobileCurrentPage] = useState(1);
  const mobileItemsPerPage = 10;

  // Notify parent of process count changes
  useEffect(() => {
    onProcessCountChange?.(processes.length);
  }, [processes.length, onProcessCountChange]);

  // Sorted processes
  const sortedProcesses = useMemo(() => {
    const data = [...processes];
    if (!sortDirection) return data;

    return data.sort((a, b) => {
      const dateA = new Date(a.lastUpdateDate).getTime();
      const dateB = new Date(b.lastUpdateDate).getTime();
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    });
  }, [processes, sortDirection]);

  // Paginated data for mobile view
  const paginatedMobileData = useMemo(() => {
    const start = (mobileCurrentPage - 1) * mobileItemsPerPage;
    return sortedProcesses.slice(start, start + mobileItemsPerPage);
  }, [sortedProcesses, mobileCurrentPage]);

  const formatDate = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  const isFavorite = useCallback(
    (id: string): boolean => favoriteProcessIds.has(id),
    [favoriteProcessIds]
  );

  const handleFavoriteClick = (process: ProcessWithRelations) => {
    onFavoriteToggle?.(process.id);
  };

  const handleSummaryClick = async (process: ProcessWithRelations) => {
    setShowSummaryModal(true);
    setLoadingSummary(true);
    setCurrentSummary(null);

    try {
      if (onLoadSummary) {
        const summary = await onLoadSummary(process.id);
        setCurrentSummary(summary);
      }
    } catch (err) {
      console.error('Failed to load summary:', err);
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleDownloadClick = (process: ProcessWithRelations) => {
    if (process.pdfUrl) {
      // Validate URL protocol before opening
      try {
        const url = new URL(process.pdfUrl, window.location.origin);
        if (url.protocol === 'http:' || url.protocol === 'https:') {
          window.open(url.href, '_blank', 'noopener,noreferrer');
        }
      } catch {
        // Invalid URL, ignore
      }
    }
  };

  const closeSummaryModal = () => {
    setShowSummaryModal(false);
    setCurrentSummary(null);
  };

  const toggleSort = () => {
    setSortDirection((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    setMobileCurrentPage(1);
  };

  // Summary helpers
  const getSummaryText = (): string => {
    const data = currentSummary?.summaryData;
    if (!data) return '';

    if (isFiscalizationBaseSummary(data)) {
      return data.resume?.small || data.resume?.full || '';
    }

    if (isFiscalizationFuelQualitySummary(data)) {
      return data.summary || '';
    }

    const generic = data as Record<string, unknown>;
    if (typeof generic['summary'] === 'string') return generic['summary'];
    if (typeof generic['resume'] === 'string') return generic['resume'];
    return '';
  };

  // FiscalizationBase helpers
  const isBaseSummary = () => isFiscalizationBaseSummary(currentSummary?.summaryData);
  const isFuelQualitySummary = () => isFiscalizationFuelQualitySummary(currentSummary?.summaryData);

  const hasEmails = () => {
    const data = currentSummary?.summaryData;
    return isFiscalizationBaseSummary(data) && !!data.emails?.trim();
  };
  const getEmails = () => {
    const data = currentSummary?.summaryData;
    return isFiscalizationBaseSummary(data) ? data.emails || '' : '';
  };

  const hasCompanies = () => {
    const data = currentSummary?.summaryData;
    return isFiscalizationBaseSummary(data) && !!data.companies?.trim();
  };
  const getCompanies = () => {
    const data = currentSummary?.summaryData;
    return isFiscalizationBaseSummary(data) ? data.companies || '' : '';
  };

  const hasGeography = () => {
    const data = currentSummary?.summaryData;
    return isFiscalizationBaseSummary(data) && !!data.geography?.trim();
  };
  const getGeography = () => {
    const data = currentSummary?.summaryData;
    return isFiscalizationBaseSummary(data) ? data.geography || '' : '';
  };

  const hasRelatedActivities = () => {
    const data = currentSummary?.summaryData;
    return isFiscalizationBaseSummary(data) && !!data.related_activities?.trim();
  };
  const getRelatedActivities = () => {
    const data = currentSummary?.summaryData;
    return isFiscalizationBaseSummary(data) ? data.related_activities || '' : '';
  };

  const hasEquipments = () => {
    const data = currentSummary?.summaryData;
    return isFiscalizationBaseSummary(data) && !!data.equipments?.trim();
  };
  const getEquipments = () => {
    const data = currentSummary?.summaryData;
    return isFiscalizationBaseSummary(data) ? data.equipments || '' : '';
  };

  // FiscalizationFuelQuality helpers
  const hasViolation = () => {
    const data = currentSummary?.summaryData;
    return isFiscalizationFuelQualitySummary(data) && !!data.violation?.trim();
  };
  const getViolation = () => {
    const data = currentSummary?.summaryData;
    return isFiscalizationFuelQualitySummary(data) ? data.violation || '' : '';
  };

  const hasSubstances = () => {
    const data = currentSummary?.summaryData;
    return isFiscalizationFuelQualitySummary(data) && !!data.substances?.trim();
  };
  const getSubstances = () => {
    const data = currentSummary?.summaryData;
    return isFiscalizationFuelQualitySummary(data) ? data.substances || '' : '';
  };

  const hasExpectedRange = () => {
    const data = currentSummary?.summaryData;
    return isFiscalizationFuelQualitySummary(data) && !!data.expectedRange?.trim();
  };
  const getExpectedRange = () => {
    const data = currentSummary?.summaryData;
    return isFiscalizationFuelQualitySummary(data) ? data.expectedRange || '' : '';
  };

  const hasMeasuredRange = () => {
    const data = currentSummary?.summaryData;
    return isFiscalizationFuelQualitySummary(data) && !!data.measuredRange?.trim();
  };
  const getMeasuredRange = () => {
    const data = currentSummary?.summaryData;
    return isFiscalizationFuelQualitySummary(data) ? data.measuredRange || '' : '';
  };

  const hasCnpj = () => {
    const data = currentSummary?.summaryData;
    return isFiscalizationFuelQualitySummary(data) && !!data.cnpj?.trim();
  };
  const getCnpj = () => {
    const data = currentSummary?.summaryData;
    return isFiscalizationFuelQualitySummary(data) ? data.cnpj || '' : '';
  };

  const hasDefenseInfo = () => {
    const data = currentSummary?.summaryData;
    return isFiscalizationFuelQualitySummary(data) && !!data.defensePresented?.trim();
  };
  const getDefenseSubmitted = () => {
    const data = currentSummary?.summaryData;
    if (!isFiscalizationFuelQualitySummary(data)) return '';
    const value = data.defensePresented?.toLowerCase();
    if (value === 'yes' || value === 'sim') return t('common.yes');
    if (value === 'no' || value === 'não' || value === 'nao') return t('common.no');
    return data.defensePresented || '';
  };

  const hasDefenseDate = () => {
    const data = currentSummary?.summaryData;
    return isFiscalizationFuelQualitySummary(data) && !!data.defenseDate?.trim();
  };
  const getDefenseDate = () => {
    const data = currentSummary?.summaryData;
    return isFiscalizationFuelQualitySummary(data) ? data.defenseDate || '' : '';
  };

  const hasCompanyName = () => {
    const data = currentSummary?.summaryData;
    return isFiscalizationFuelQualitySummary(data) && !!data.companyName?.trim();
  };
  const getCompanyName = () => {
    const data = currentSummary?.summaryData;
    return isFiscalizationFuelQualitySummary(data) ? data.companyName || '' : '';
  };

  const hasViolationDetails = () =>
    hasViolation() || hasSubstances() || hasExpectedRange() || hasMeasuredRange();

  const hasProcessDetails = () =>
    hasDefenseInfo() || hasDefenseDate() || hasCnpj() || hasCompanyName();

  // Column definitions
  const columns = useMemo(
    (): DataTableColumn<ProcessWithRelations>[] => [
      {
        key: 'processNumber',
        header: t('table.headers.processNumber'),
        frozen: true,
        width: 'w-48',
        render: (row) => (
          <ProcessNumberCell
            processNumber={row.processNumber}
            processLink={`/processes/details/${row.id}`}
            isFavorite={isFavorite(row.id)}
            showFavorite
            onFavoriteToggle={() => handleFavoriteClick(row)}
          />
        ),
      },
      {
        key: 'lastUpdateDate',
        header: t('table.headers.lastUpdate'),
        width: 'w-32',
        align: 'center',
        cellClassName: 'text-secondary',
        headerComponent: SortableHeader,
        headerProps: {
          label: t('table.headers.lastUpdate'),
          sortDirection,
          onSort: toggleSort,
        },
        render: (row) => formatDate(row.lastUpdateDate),
      },
      {
        key: 'interestedParties',
        header: t('table.headers.interested'),
        width: 'w-56',
        align: 'center',
        cellClassName: 'text-secondary truncate',
        render: (row) => row.interestedParties.join(', '),
      },
      {
        key: 'classification',
        header: t('table.headers.processType'),
        width: 'w-44',
        align: 'center',
        cellClassName: 'text-secondary',
        render: (row) => (
          <TruncatedTextCell text={row.classification.name} maxWidth="170px" />
        ),
      },
      {
        key: 'generationDate',
        header: t('table.headers.generationDate'),
        width: 'w-36',
        align: 'center',
        cellClassName: 'text-secondary',
        render: (row) => formatDate(row.generationDate),
      },
      {
        key: 'protocols',
        header: t('table.headers.protocolNumber'),
        width: 'w-52',
        align: 'center',
        cellClassName: 'text-secondary',
        render: (row) => row.protocols[0]?.protocolNumber || '-',
      },
      {
        key: 'protocolType',
        header: t('table.headers.protocolType'),
        width: 'w-36',
        align: 'center',
        cellClassName: 'text-secondary',
        render: (row) => row.protocols[0]?.protocolType || '-',
      },
      {
        key: '_count',
        header: t('table.headers.associatedProtocols'),
        width: 'w-48',
        align: 'center',
        cellClassName: 'text-secondary',
        render: (row) => row._count.protocols > 0 ? row._count.protocols.toString() : '-',
      },
      {
        key: 'summary',
        header: t('table.headers.regmanagerSummary'),
        width: 'w-48',
        align: 'center',
        render: (row) => (
          <CellActionButton
            icon={FileEdit}
            disabled={!row.summary}
            onClick={() => handleSummaryClick(row)}
          />
        ),
      },
      {
        key: 'download',
        header: t('table.headers.download'),
        width: 'w-32',
        align: 'center',
        render: (row) => (
          <CellActionButton
            icon={Download}
            onClick={() => handleDownloadClick(row)}
          />
        ),
      },
    ],
    [t, sortDirection, isFavorite]
  );

  const emptyState = {
    icon: <FileText className="w-12 h-12 text-gray-400" />,
    message: favoritesOnly
      ? t('table.noFavorites')
      : t('table.noProcessesFound'),
    subtitle: favoritesOnly
      ? t('table.noFavoritesMessage')
      : t('table.noProcessesAvailable'),
  };

  const trackById = (row: ProcessWithRelations) => row.id;

  return (
    <>
      {/* Desktop: Data Table */}
      <div className="hidden lg:block">
        <DataTable
          data={sortedProcesses}
          columns={columns}
          isLoading={loading}
          emptyState={emptyState}
          trackBy={trackById}
        />
      </div>

      {/* Mobile: Card View */}
      <div className="lg:hidden">
        {loading ? (
          <div className="py-8">
            <Spinner type="dots" message={t('table.loadingProcesses')} />
          </div>
        ) : sortedProcesses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 space-y-3">
            <FileText className="w-12 h-12 text-gray-400" />
            <div className="space-y-1 text-center">
              <p className="text-sm font-medium text-gray-900">
                {favoritesOnly
                  ? t('table.noFavorites')
                  : t('table.noProcessesFound')}
              </p>
              <p className="text-sm text-gray-500">
                {favoritesOnly
                  ? t('table.noFavoritesMessage')
                  : t('table.noProcessesAvailable')}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Sort Button */}
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <span className="text-xs font-medium text-gray-600 uppercase">
                {t('table.headers.processes')} ({sortedProcesses.length})
              </span>
              <button
                onClick={toggleSort}
                className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowUpDown className="w-4 h-4" />
                {sortDirection === 'desc'
                  ? t('table.newestFirst')
                  : t('table.oldestFirst')}
              </button>
            </div>

            {/* Process Cards */}
            <div className="divide-y divide-gray-100">
              {paginatedMobileData.map((process) => (
                <div
                  key={process.id}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  {/* Header: Process Number + Actions */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/processes/details/${process.id}`}
                        className="text-sm font-semibold text-primary-800 hover:text-primary-900 hover:underline block truncate"
                      >
                        {process.processNumber}
                      </Link>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {t('table.headers.lastUpdate')}:{' '}
                        {formatDate(process.lastUpdateDate)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleFavoriteClick(process)}
                        className={cn(
                          'p-1.5 rounded-lg transition-colors',
                          isFavorite(process.id)
                            ? 'text-yellow-500'
                            : 'text-gray-400 hover:bg-yellow-50'
                        )}
                      >
                        <Star
                          className={cn(
                            'w-4 h-4',
                            isFavorite(process.id) && 'fill-current'
                          )}
                        />
                      </button>
                      <button
                        onClick={() => handleSummaryClick(process)}
                        disabled={!process.summary}
                        className={cn(
                          'p-1.5 rounded-lg text-gray-500 hover:text-primary-800 hover:bg-gray-100 transition-colors',
                          !process.summary &&
                            'opacity-40 cursor-not-allowed'
                        )}
                      >
                        <FileEdit className="w-4 h-4" />
                      </button>
                      <Link
                        href={`/processes/details/${process.id}`}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-primary-800 hover:bg-gray-100 transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                    <div>
                      <span className="text-gray-500">
                        {t('table.headers.interested')}
                      </span>
                      <p className="text-gray-900 font-medium truncate mt-0.5">
                        {process.interestedParties.join(', ') || '-'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">
                        {t('table.headers.processType')}
                      </span>
                      <p className="text-gray-900 font-medium truncate mt-0.5">
                        {process.classification.name || '-'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">
                        {t('table.headers.generationDate')}
                      </span>
                      <p className="text-gray-900 font-medium mt-0.5">
                        {formatDate(process.generationDate)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">
                        {t('table.headers.protocolNumber')}
                      </span>
                      <p className="text-gray-900 font-medium truncate mt-0.5">
                        {process.protocols[0]?.protocolNumber || '-'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile Pagination */}
            {sortedProcesses.length > mobileItemsPerPage && (
              <Pagination
                currentPage={mobileCurrentPage}
                totalItems={sortedProcesses.length}
                itemsPerPage={mobileItemsPerPage}
                onPageChange={setMobileCurrentPage}
              />
            )}
          </>
        )}
      </div>

      {/* Summary Modal */}
      {showSummaryModal && (
        <Modal
          title={t('table.modal.summaryTitle')}
          maxWidth="max-w-4xl"
          onClose={closeSummaryModal}
        >
        {loadingSummary ? (
          <Spinner type="dots" message={t('table.loadingSummary')} />
        ) : currentSummary ? (
          <div className="space-y-6 text-sm text-gray-700 leading-relaxed max-h-[70vh] overflow-y-auto pr-2">
            {/* RegManager Summary */}
            <div>
              <p className="font-semibold text-gray-900 mb-2">
                {t('processDetails.regmanagerSummary')}
              </p>
              <p className="whitespace-pre-line">{getSummaryText()}</p>
            </div>

            {/* FiscalizationFuelQuality: Violation Details */}
            {isFuelQualitySummary() && hasViolationDetails() && (
              <div className="pt-4 border-t border-gray-200">
                <p className="font-semibold text-gray-900 mb-3">
                  {t('processDetails.violationDetails')}
                </p>
                <div className="space-y-1">
                  {hasViolation() && (
                    <p>
                      <span className="font-medium text-gray-900">
                        {t('processDetails.violationType')}
                      </span>{' '}
                      {getViolation()}
                    </p>
                  )}
                  {hasExpectedRange() && (
                    <p>
                      <span className="font-medium text-gray-900">
                        {t('processDetails.expectedRange')}
                      </span>{' '}
                      {getExpectedRange()}
                    </p>
                  )}
                  {hasMeasuredRange() && (
                    <p>
                      <span className="font-medium text-gray-900">
                        {t('processDetails.measuredRange')}
                      </span>{' '}
                      {getMeasuredRange()}
                    </p>
                  )}
                  {hasSubstances() && (
                    <p>
                      <span className="font-medium text-gray-900">
                        {t('processDetails.substances')}
                      </span>{' '}
                      {getSubstances()}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* FiscalizationFuelQuality: Process Details */}
            {isFuelQualitySummary() && hasProcessDetails() && (
              <div className="pt-4 border-t border-gray-200">
                <p className="font-semibold text-gray-900 mb-3">
                  {t('processDetails.processDetailsSection')}
                </p>
                <div className="space-y-1">
                  {hasDefenseInfo() && (
                    <p>
                      <span className="font-medium text-gray-900">
                        {t('processDetails.defenseSubmitted')}
                      </span>{' '}
                      {getDefenseSubmitted()}
                    </p>
                  )}
                  {hasDefenseDate() && (
                    <p>
                      <span className="font-medium text-gray-900">
                        {t('processDetails.defenseDate')}
                      </span>{' '}
                      {getDefenseDate()}
                    </p>
                  )}
                  {hasCnpj() && (
                    <p>
                      <span className="font-medium text-gray-900">
                        {t('processDetails.cnpjs')}
                      </span>{' '}
                      {getCnpj()}
                    </p>
                  )}
                  {hasCompanyName() && (
                    <p>
                      <span className="font-medium text-gray-900">
                        {t('processDetails.companyNames')}
                      </span>{' '}
                      {getCompanyName()}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* FiscalizationBase fields */}
            {isBaseSummary() && (
              <>
                {hasEmails() && (
                  <div className="pt-4 border-t border-gray-200">
                    <p className="font-semibold text-gray-900 mb-2">
                      {t('processDetails.citedEmails')}
                    </p>
                    <p>{getEmails()}</p>
                  </div>
                )}
                {hasCompanies() && (
                  <div className="pt-4 border-t border-gray-200">
                    <p className="font-semibold text-gray-900 mb-2">
                      {t('processDetails.citedCompanies')}
                    </p>
                    <p>{getCompanies()}</p>
                  </div>
                )}
                {hasGeography() && (
                  <div className="pt-4 border-t border-gray-200">
                    <p className="font-semibold text-gray-900 mb-2">
                      {t('processDetails.basinsFieldsPlatforms')}
                    </p>
                    <p>{getGeography()}</p>
                  </div>
                )}
                {hasRelatedActivities() && (
                  <div className="pt-4 border-t border-gray-200">
                    <p className="font-semibold text-gray-900 mb-2">
                      {t('processDetails.relatedActivities')}
                    </p>
                    <p>{getRelatedActivities()}</p>
                  </div>
                )}
                {hasEquipments() && (
                  <div className="pt-4 border-t border-gray-200">
                    <p className="font-semibold text-gray-900 mb-2">
                      {t('processDetails.equipmentsAndSystems')}
                    </p>
                    <p>{getEquipments()}</p>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="text-sm text-gray-500 italic py-4">
            {t('processDetails.noSummaryAvailable')}
          </div>
        )}
        </Modal>
      )}
    </>
  );
}
