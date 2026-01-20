'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Download, FileX } from 'lucide-react';
import { authFetch } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/atoms/Button';
import { Spinner } from '@/components/ui/atoms/Spinner';
import { Card } from '@/components/ui/molecules/Card';
import { Tabs } from '@/components/ui/molecules/Tabs';
import { TableProtocols } from '@/components/ui/organisms/TableProtocols';
import { TableOngoing } from '@/components/ui/organisms/TableOngoing';
import type { ProcessWithFullDetails, SummaryData } from '@/types/process';
import {
  isFiscalizationBaseSummary,
  isFiscalizationFuelQualitySummary,
} from '@/types/process';
import type { Protocol, OnGoingList, ProcessSummary } from '@prisma/client';

type TabId = 'overview' | 'protocols' | 'progress';

export default function ProcessDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations();
  const processId = params.id as string;

  const [process, setProcess] = useState<ProcessWithFullDetails | null>(null);
  const [summary, setSummary] = useState<ProcessSummary | null>(null);
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [ongoing, setOngoing] = useState<OnGoingList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<TabId>('overview');
  const [protocolsCount, setProtocolsCount] = useState(0);
  const [ongoingCount, setOngoingCount] = useState(0);

  const tabs = [
    { id: 'overview', label: t('tabs.overview') },
    { id: 'protocols', label: t('tabs.protocols') },
    { id: 'progress', label: t('tabs.progress') },
  ];

  const fetchProcessDetails = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [processRes, protocolsRes, ongoingRes, summaryRes] = await Promise.all([
        authFetch(`/api/processes/${processId}`),
        authFetch(`/api/processes/${processId}/protocols`),
        authFetch(`/api/processes/${processId}/ongoing`),
        authFetch(`/api/processes/${processId}/summary`),
      ]);

      if (!processRes.ok) {
        if (processRes.status === 404) {
          setError('notFound');
        } else {
          throw new Error('Failed to fetch process');
        }
        return;
      }

      const processData = await processRes.json();
      setProcess(processData.data);

      if (protocolsRes.ok) {
        const protocolsData = await protocolsRes.json();
        setProtocols(protocolsData.data || []);
        setProtocolsCount(protocolsData.data?.length || 0);
      }

      if (ongoingRes.ok) {
        const ongoingData = await ongoingRes.json();
        setOngoing(ongoingData.data || []);
        setOngoingCount(ongoingData.data?.length || 0);
      }

      if (summaryRes.ok) {
        const summaryData = await summaryRes.json();
        setSummary(summaryData.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [processId]);

  useEffect(() => {
    if (processId) {
      fetchProcessDetails();
    }
  }, [processId, fetchProcessDetails]);

  const handleBack = () => {
    if (window.history.length <= 2) {
      router.push('/last-updates');
    } else {
      router.back();
    }
  };

  const handleDownload = () => {
    if (!process?.pdfUrl) return;
    window.open(process.pdfUrl, '_blank');
  };

  const formatDate = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  // Parse summary data
  const summaryData: SummaryData | null = summary?.summaryData
    ? (typeof summary.summaryData === 'string'
        ? JSON.parse(summary.summaryData)
        : summary.summaryData) as SummaryData
    : null;

  // Summary helpers
  const getSummaryText = (): string => {
    if (!summaryData) return '';
    if (isFiscalizationBaseSummary(summaryData)) {
      return summaryData.resume?.full || summaryData.resume?.small || '';
    }
    if (isFiscalizationFuelQualitySummary(summaryData)) {
      return summaryData.summary || '';
    }
    const generic = summaryData as Record<string, unknown>;
    if (typeof generic['summary'] === 'string') return generic['summary'];
    if (typeof generic['resume'] === 'string') return generic['resume'];
    return '';
  };

  // FiscalizationBase helpers
  const isBaseSummary = () => summaryData && isFiscalizationBaseSummary(summaryData);
  const isFuelQualitySummary = () => summaryData && isFiscalizationFuelQualitySummary(summaryData);

  const hasEmails = () => isFiscalizationBaseSummary(summaryData) && !!summaryData?.emails?.trim();
  const getEmails = () => (isFiscalizationBaseSummary(summaryData) ? summaryData?.emails || '' : '');

  const hasCompanies = () => isFiscalizationBaseSummary(summaryData) && !!summaryData?.companies?.trim();
  const getCompanies = () => (isFiscalizationBaseSummary(summaryData) ? summaryData?.companies || '' : '');

  const hasGeography = () => isFiscalizationBaseSummary(summaryData) && !!summaryData?.geography?.trim();
  const getGeography = () => (isFiscalizationBaseSummary(summaryData) ? summaryData?.geography || '' : '');

  const hasRelatedActivities = () => isFiscalizationBaseSummary(summaryData) && !!summaryData?.related_activities?.trim();
  const getRelatedActivities = () => (isFiscalizationBaseSummary(summaryData) ? summaryData?.related_activities || '' : '');

  const hasEquipments = () => isFiscalizationBaseSummary(summaryData) && !!summaryData?.equipments?.trim();
  const getEquipments = () => (isFiscalizationBaseSummary(summaryData) ? summaryData?.equipments || '' : '');

  // FiscalizationFuelQuality helpers
  const hasViolation = () => isFiscalizationFuelQualitySummary(summaryData) && !!summaryData?.violation?.trim();
  const getViolation = () => (isFiscalizationFuelQualitySummary(summaryData) ? summaryData?.violation || '' : '');

  const hasSubstances = () => isFiscalizationFuelQualitySummary(summaryData) && !!summaryData?.substances?.trim();
  const getSubstances = () => (isFiscalizationFuelQualitySummary(summaryData) ? summaryData?.substances || '' : '');

  const hasExpectedRange = () => isFiscalizationFuelQualitySummary(summaryData) && !!summaryData?.expectedRange?.trim();
  const getExpectedRange = () => (isFiscalizationFuelQualitySummary(summaryData) ? summaryData?.expectedRange || '' : '');

  const hasMeasuredRange = () => isFiscalizationFuelQualitySummary(summaryData) && !!summaryData?.measuredRange?.trim();
  const getMeasuredRange = () => (isFiscalizationFuelQualitySummary(summaryData) ? summaryData?.measuredRange || '' : '');

  const hasCnpj = () => isFiscalizationFuelQualitySummary(summaryData) && !!summaryData?.cnpj?.trim();
  const getCnpj = () => (isFiscalizationFuelQualitySummary(summaryData) ? summaryData?.cnpj || '' : '');

  const hasDefenseInfo = () => isFiscalizationFuelQualitySummary(summaryData) && !!summaryData?.defensePresented?.trim();
  const getDefenseSubmitted = () => {
    if (!isFiscalizationFuelQualitySummary(summaryData)) return '';
    const value = summaryData?.defensePresented?.toLowerCase();
    if (value === 'yes' || value === 'sim') return t('common.yes');
    if (value === 'no' || value === 'não' || value === 'nao') return t('common.no');
    return summaryData?.defensePresented || '';
  };

  const hasDefenseDate = () => isFiscalizationFuelQualitySummary(summaryData) && !!summaryData?.defenseDate?.trim();
  const getDefenseDate = () => (isFiscalizationFuelQualitySummary(summaryData) ? summaryData?.defenseDate || '' : '');

  const hasCompanyName = () => isFiscalizationFuelQualitySummary(summaryData) && !!summaryData?.companyName?.trim();
  const getCompanyName = () => (isFiscalizationFuelQualitySummary(summaryData) ? summaryData?.companyName || '' : '');

  const hasViolationDetails = () => hasViolation() || hasSubstances() || hasExpectedRange() || hasMeasuredRange();
  const hasProcessDetails = () => hasDefenseInfo() || hasDefenseDate() || hasCnpj() || hasCompanyName();

  // Render loading state
  if (loading) {
    return (
      <div className="p-3 lg:p-6">
        <Card>
          <Spinner type="dots" message={t('processDetails.loading')} />
        </Card>
      </div>
    );
  }

  // Render error/not found state
  if (error === 'notFound' || !process) {
    return (
      <div className="p-3 lg:p-6">
        <Card>
          <div className="flex flex-col items-center justify-center py-8 lg:py-12 px-4">
            <FileX className="w-12 h-12 lg:w-16 lg:h-16 text-gray-400 mb-4" />
            <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-2 text-center">
              {t('processDetails.notFound')}
            </h3>
            <p className="text-sm text-gray-600 text-center mb-4">
              {t('processDetails.notFoundMessage')}
            </p>
            <button
              onClick={handleBack}
              className="text-primary-800 hover:text-primary-600 transition-colors font-medium"
            >
              {t('processDetails.backToList')}
            </button>
          </div>
        </Card>
      </div>
    );
  }

  // Render Overview tab content
  const renderOverview = () => (
    <div>
      {/* Desktop: Horizontal Info Card */}
      <div className="hidden lg:block bg-white rounded-lg border border-gray-300 px-6 py-4 mb-6">
        <div className="flex justify-between items-start">
          <div className="whitespace-nowrap">
            <p className="text-sm font-semibold text-gray-900 mb-2">{t('processDetails.processNumber')}</p>
            <p className="text-sm text-gray-700">{process.processNumber}</p>
          </div>
          <div className="whitespace-nowrap">
            <p className="text-sm font-semibold text-gray-900 mb-2">{t('processDetails.interested')}</p>
            <p className="text-sm text-gray-700">{process.interestedParties?.join(', ') || '-'}</p>
          </div>
          <div className="whitespace-nowrap">
            <p className="text-sm font-semibold text-gray-900 mb-2">{t('processDetails.type')}</p>
            <p className="text-sm text-gray-700 max-w-[200px] truncate" title={process.classification?.name}>
              {process.classification?.name || '-'}
            </p>
          </div>
          <div className="whitespace-nowrap">
            <p className="text-sm font-semibold text-gray-900 mb-2">{t('processDetails.generationDate')}</p>
            <p className="text-sm text-gray-700">{formatDate(process.generationDate)}</p>
          </div>
          <div className="whitespace-nowrap">
            <p className="text-sm font-semibold text-gray-900 mb-2">{t('processDetails.lastUpdate')}</p>
            <p className="text-sm text-gray-700">{formatDate(process.lastUpdateDate)}</p>
          </div>
        </div>
      </div>

      {/* Mobile: 2-column Grid Info Card */}
      <div className="lg:hidden bg-white rounded-lg border border-gray-300 px-4 py-3 mb-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <p className="text-sm font-semibold text-gray-900 mb-1">{t('processDetails.processNumber')}</p>
            <p className="text-sm text-gray-700 break-all">{process.processNumber}</p>
          </div>
          <div className="col-span-2">
            <p className="text-sm font-semibold text-gray-900 mb-1">{t('processDetails.interested')}</p>
            <p className="text-sm text-gray-700">{process.interestedParties?.join(', ') || '-'}</p>
          </div>
          <div className="col-span-2">
            <p className="text-sm font-semibold text-gray-900 mb-1">{t('processDetails.type')}</p>
            <p className="text-sm text-gray-700 line-clamp-2">{process.classification?.name || '-'}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-1">{t('processDetails.generationDate')}</p>
            <p className="text-sm text-gray-700">{formatDate(process.generationDate)}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-1">{t('processDetails.lastUpdate')}</p>
            <p className="text-sm text-gray-700">{formatDate(process.lastUpdateDate)}</p>
          </div>
        </div>
      </div>

      {/* RegManager Summary Card */}
      <Card title={t('processDetails.regmanagerSummary')} collapsible defaultExpanded>
        {summaryData ? (
          <div className="text-sm text-gray-700 leading-relaxed">
            <p className="whitespace-pre-line">{getSummaryText()}</p>
          </div>
        ) : (
          <div className="text-sm text-gray-500 italic">
            {t('processDetails.noSummaryAvailable')}
          </div>
        )}
      </Card>

      {/* FiscalizationFuelQuality: Violation Details */}
      {isFuelQualitySummary() && hasViolationDetails() && (
        <div className="mt-4">
          <Card title={t('processDetails.violationDetails')} collapsible defaultExpanded>
            <div className="space-y-1 text-sm text-gray-700 leading-relaxed">
              {hasViolation() && (
                <p><span className="font-semibold text-gray-900">{t('processDetails.violationType')}</span> {getViolation()}</p>
              )}
              {hasExpectedRange() && (
                <p><span className="font-semibold text-gray-900">{t('processDetails.expectedRange')}</span> {getExpectedRange()}</p>
              )}
              {hasMeasuredRange() && (
                <p><span className="font-semibold text-gray-900">{t('processDetails.measuredRange')}</span> {getMeasuredRange()}</p>
              )}
              {hasSubstances() && (
                <p><span className="font-semibold text-gray-900">{t('processDetails.substances')}</span> {getSubstances()}</p>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* FiscalizationFuelQuality: Process Details */}
      {isFuelQualitySummary() && hasProcessDetails() && (
        <div className="mt-4">
          <Card title={t('processDetails.processDetailsSection')} collapsible defaultExpanded>
            <div className="space-y-1 text-sm text-gray-700 leading-relaxed">
              {hasDefenseInfo() && (
                <p><span className="font-semibold text-gray-900">{t('processDetails.defenseSubmitted')}</span> {getDefenseSubmitted()}</p>
              )}
              {hasDefenseDate() && (
                <p><span className="font-semibold text-gray-900">{t('processDetails.defenseDate')}</span> {getDefenseDate()}</p>
              )}
              {hasCnpj() && (
                <p><span className="font-semibold text-gray-900">{t('processDetails.cnpjs')}</span> {getCnpj()}</p>
              )}
              {hasCompanyName() && (
                <p><span className="font-semibold text-gray-900">{t('processDetails.companyNames')}</span> {getCompanyName()}</p>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* FiscalizationBase: Emails */}
      {isBaseSummary() && hasEmails() && (
        <div className="mt-4">
          <Card title={t('processDetails.citedEmails')} collapsible defaultExpanded>
            <div className="text-sm text-gray-700 leading-relaxed">
              <p>{getEmails()}</p>
            </div>
          </Card>
        </div>
      )}

      {/* FiscalizationBase: Companies */}
      {isBaseSummary() && hasCompanies() && (
        <div className="mt-4">
          <Card title={t('processDetails.citedCompanies')} collapsible defaultExpanded>
            <div className="text-sm text-gray-700 leading-relaxed">
              <p>{getCompanies()}</p>
            </div>
          </Card>
        </div>
      )}

      {/* FiscalizationBase: Geography */}
      {isBaseSummary() && hasGeography() && (
        <div className="mt-4">
          <Card title={t('processDetails.basinsFieldsPlatforms')} collapsible defaultExpanded>
            <div className="text-sm text-gray-700 leading-relaxed">
              <p>{getGeography()}</p>
            </div>
          </Card>
        </div>
      )}

      {/* FiscalizationBase: Related Activities */}
      {isBaseSummary() && hasRelatedActivities() && (
        <div className="mt-4">
          <Card title={t('processDetails.relatedActivities')} collapsible defaultExpanded>
            <div className="text-sm text-gray-700 leading-relaxed">
              <p>{getRelatedActivities()}</p>
            </div>
          </Card>
        </div>
      )}

      {/* FiscalizationBase: Equipments */}
      {isBaseSummary() && hasEquipments() && (
        <div className="mt-4">
          <Card title={t('processDetails.equipmentsAndSystems')} collapsible defaultExpanded>
            <div className="text-sm text-gray-700 leading-relaxed">
              <p>{getEquipments()}</p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );

  // Render Protocols tab content
  const renderProtocols = () => (
    <div>
      <div className="mb-3 lg:mb-4">
        <h3 className="text-base lg:text-lg font-semibold text-gray-900">
          {t('processDetails.protocols')} {protocolsCount > 0 && `(${protocolsCount})`}
        </h3>
      </div>
      <Card noPadding>
        <TableProtocols protocols={protocols} onTotalCountChange={setProtocolsCount} />
      </Card>
    </div>
  );

  // Render Progress tab content
  const renderProgress = () => (
    <div>
      <div className="mb-3 lg:mb-4">
        <h3 className="text-base lg:text-lg font-semibold text-gray-900">
          {t('processDetails.progress')} {ongoingCount > 0 && `(${ongoingCount})`}
        </h3>
      </div>
      <Card noPadding>
        <TableOngoing ongoing={ongoing} onTotalCountChange={setOngoingCount} />
      </Card>
    </div>
  );

  // Render tab content
  const renderTabContent = () => {
    switch (selectedTab) {
      case 'overview':
        return renderOverview();
      case 'protocols':
        return renderProtocols();
      case 'progress':
        return renderProgress();
      default:
        return null;
    }
  };

  return (
    <div className="p-3 lg:p-6">
      {/* Header with Back and Download */}
      <div className="flex items-center justify-between mb-4 lg:mb-8">
        <Button variant="link" size="sm" onClick={handleBack}>
          <div className="flex items-center gap-1 lg:gap-2">
            <ArrowLeft className="w-4 h-4 lg:w-5 lg:h-5" />
            <span className="hidden sm:inline">{t('processDetails.backToProcesses')}</span>
            <span className="sm:hidden">{t('common.back')}</span>
          </div>
        </Button>

        <Button variant="primary" size="sm" onClick={handleDownload}>
          <div className="flex items-center gap-1 lg:gap-2">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">{t('processDetails.download')}</span>
          </div>
        </Button>
      </div>

      {/* Centered Process Number */}
      <div className="text-center mb-4 lg:mb-6">
        <h1 className="text-lg lg:text-xl font-bold text-black break-all">
          {process.processNumber}
        </h1>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={tabs}
        selectedTab={selectedTab}
        onTabChange={(tabId) => setSelectedTab(tabId as TabId)}
      />

      <div className="mt-4 lg:mt-6" />

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
}
