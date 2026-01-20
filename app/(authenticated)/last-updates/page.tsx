'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Card } from '@/components/ui/molecules/Card';
import { InputSelect } from '@/components/ui/atoms/InputSelect';
import { InputCalendar } from '@/components/ui/molecules/InputCalendar';
import { TableProcess } from '@/components/ui/organisms/TableProcess';
import { useProcesses } from '@/hooks/useProcesses';
import type { PeriodType, SavedFilters } from '@/types/filters';

const FILTERS_STORAGE_KEY = 'lastUpdates_filters';

// Mock last update date - will come from API in the future
const LAST_UPDATE_DATE = new Date('2025-01-20T17:29:00');

/**
 * Last Updates Page
 *
 * Displays processes filtered by date range with:
 * - Period quick filters (today, yesterday, last 7 days)
 * - Custom date range selection
 * - Process table with sorting and favorites
 * - Filter persistence in localStorage
 */
export default function LastUpdatesPage() {
  const t = useTranslations();
  const locale = useLocale();

  // Filter state
  const [periodType, setPeriodType] = useState<PeriodType>('custom');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isManualEdit, setIsManualEdit] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Fetch processes
  const {
    filteredProcesses,
    loading,
    favoriteProcessIds,
    toggleFavorite,
    loadSummary,
  } = useProcesses({
    startDate,
    endDate,
  });

  // Format last update date based on locale
  const formattedLastUpdateDate = useMemo(() => {
    const date = LAST_UPDATE_DATE;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    if (locale === 'en') {
      return `${month}/${day}/${year} ${hours}:${minutes}`;
    }
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }, [locale]);

  // Period options
  const periodOptions = useMemo(
    () => [
      { value: 'today', label: t('filters.periodOptions.today') },
      { value: 'yesterday', label: t('filters.periodOptions.yesterday') },
      { value: 'last7days', label: t('filters.periodOptions.last7days') },
    ],
    [t]
  );

  // Custom display value for period select when in manual mode
  const customPeriodLabel = useMemo(() => {
    if (isManualEdit && periodType === 'custom') {
      return t('filters.periodOptions.custom');
    }
    return undefined;
  }, [isManualEdit, periodType, t]);

  // Save filters to localStorage
  const saveFilters = useCallback(() => {
    if (typeof window === 'undefined') return;

    const filters: SavedFilters = {
      startDate: startDate?.toISOString() || null,
      endDate: endDate?.toISOString() || null,
      periodType,
      isManualEdit,
    };

    localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filters));
  }, [startDate, endDate, periodType, isManualEdit]);

  // Load filters from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const saved = localStorage.getItem(FILTERS_STORAGE_KEY);
    if (saved) {
      try {
        const filters: SavedFilters = JSON.parse(saved);
        if (filters.startDate) setStartDate(new Date(filters.startDate));
        if (filters.endDate) setEndDate(new Date(filters.endDate));
        setPeriodType(filters.periodType || 'custom');
        setIsManualEdit(filters.isManualEdit ?? true);
      } catch {
        // Invalid saved filters, use defaults
        initializeDefaultDates();
      }
    } else {
      // No saved filters, use defaults
      initializeDefaultDates();
    }
    setIsInitialized(true);
  }, []);

  // Initialize default dates (last 7 days)
  const initializeDefaultDates = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const last7Days = new Date(today);
    last7Days.setDate(today.getDate() - 7);

    setStartDate(last7Days);
    setEndDate(new Date(today));
    setPeriodType('last7days');
    setIsManualEdit(false);
  };

  // Save filters when they change (after initialization)
  useEffect(() => {
    if (isInitialized) {
      saveFilters();
    }
  }, [isInitialized, saveFilters]);

  // Handle period type change
  const handlePeriodTypeChange = useCallback((value: string) => {
    const type = value as PeriodType;
    setPeriodType(type);

    if (type !== 'custom') {
      setIsManualEdit(false);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (type) {
      case 'last7days': {
        const last7Days = new Date(today);
        last7Days.setDate(today.getDate() - 7);
        setStartDate(last7Days);
        setEndDate(new Date(today));
        break;
      }
      case 'today': {
        setStartDate(new Date(today));
        setEndDate(new Date(today));
        break;
      }
      case 'yesterday': {
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        setStartDate(yesterday);
        setEndDate(yesterday);
        break;
      }
    }
  }, []);

  // Handle manual date change
  const handleStartDateChange = useCallback((date: Date | null) => {
    setStartDate(date);

    // Clear end date if start date is after it
    setEndDate((prevEndDate) => {
      if (date && prevEndDate) {
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(prevEndDate);
        end.setHours(0, 0, 0, 0);

        if (start > end) {
          return null;
        }
      }
      return prevEndDate;
    });

    setIsManualEdit(true);
    setPeriodType('custom');
  }, []);

  const handleEndDateChange = useCallback((date: Date | null) => {
    setEndDate(date);
    setIsManualEdit(true);
    setPeriodType('custom');
  }, []);

  return (
    <div className="p-2 lg:p-6 bg-white min-h-screen">
      {/* Filters */}
      <div className="mb-4 lg:mb-6">
        {/* Desktop: Horizontal layout */}
        <div className="hidden lg:flex lg:justify-between lg:items-end gap-4">
          {/* Last Update Info */}
          <div className="flex items-end pb-2">
            <p className="text-xs text-gray-500">
              {t('lastUpdates.lastUpdateLabel')}{' '}
              <span className="font-medium text-gray-600">{formattedLastUpdateDate}</span>
            </p>
          </div>

          {/* Filters inline */}
          <div className="flex gap-4 items-end">
            <div className="w-52">
              <InputSelect
                label={t('filters.period')}
                placeholder={t('filters.period')}
                value={periodType}
                onChange={handlePeriodTypeChange}
                options={periodOptions}
                customDisplayValue={customPeriodLabel}
              />
            </div>

            <div className="w-44">
              <InputCalendar
                label={t('filters.startDate')}
                placeholder={t('filters.startDatePlaceholder')}
                value={startDate}
                onChange={handleStartDateChange}
              />
            </div>

            <div className="w-44">
              <InputCalendar
                label={t('filters.endDate')}
                placeholder={t('filters.endDatePlaceholder')}
                value={endDate}
                minDate={startDate}
                onChange={handleEndDateChange}
                align="right"
              />
            </div>
          </div>
        </div>

        {/* Mobile: Card with stacked filters */}
        <div className="lg:hidden bg-white rounded-lg border border-gray-200 p-4">
          {/* Period (full width) */}
          <div className="mb-3">
            <InputSelect
              label={t('filters.period')}
              placeholder={t('filters.period')}
              value={periodType}
              onChange={handlePeriodTypeChange}
              options={periodOptions}
              customDisplayValue={customPeriodLabel}
            />
          </div>

          {/* Dates side by side */}
          <div className="grid grid-cols-2 gap-3">
            <InputCalendar
              label={t('filters.startDate')}
              placeholder="DD/MM/YYYY"
              value={startDate}
              onChange={handleStartDateChange}
            />

            <InputCalendar
              label={t('filters.endDate')}
              placeholder="DD/MM/YYYY"
              value={endDate}
              minDate={startDate}
              onChange={handleEndDateChange}
              align="right"
            />
          </div>

          {/* Last Update Info */}
          <div className="mt-3 pt-3 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500">
              {t('lastUpdates.lastUpdateLabel')}{' '}
              <span className="font-medium text-gray-700">{formattedLastUpdateDate}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Process Table */}
      <Card noPadding>
        <TableProcess
          processes={filteredProcesses}
          loading={loading}
          favoriteProcessIds={favoriteProcessIds}
          onFavoriteToggle={toggleFavorite}
          onLoadSummary={loadSummary}
        />
      </Card>
    </div>
  );
}
