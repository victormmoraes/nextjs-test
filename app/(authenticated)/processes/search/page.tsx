"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { Card } from "@/components/ui/molecules/Card";
import { Input } from "@/components/ui/atoms/Input";
import { InputCalendar } from "@/components/ui/molecules/InputCalendar";
import { TableSearch } from "@/components/ui/organisms/TableSearch";
import { useProcesses } from "@/hooks/useProcesses";

/**
 * Search Processes Page
 *
 * Allows users to search processes by:
 * - Text search (process number, classification, interested parties)
 * - Date range filters
 *
 * Search state is persisted in URL query params for shareability.
 */
export default function SearchProcessesPage() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize state from URL params
  const [searchTerm, setSearchTerm] = useState(
    () => searchParams.get("q") || "",
  );
  const [startDate, setStartDate] = useState<Date | null>(() => {
    const start = searchParams.get("start");
    return start ? new Date(start) : null;
  });
  const [endDate, setEndDate] = useState<Date | null>(() => {
    const end = searchParams.get("end");
    return end ? new Date(end) : null;
  });
  const [totalCount, setTotalCount] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  // Fetch all processes (filtering happens in TableSearch)
  const { filteredProcesses, loading } = useProcesses({
    startDate,
    endDate,
  });

  // Check if any filters are applied
  const hasFilters = useMemo(() => {
    return (
      (searchTerm && searchTerm.trim().length > 0) ||
      startDate !== null ||
      endDate !== null
    );
  }, [searchTerm, startDate, endDate]);

  // Update URL query params when search state changes
  const updateQueryParams = useCallback(
    (term: string, start: Date | null, end: Date | null) => {
      const params = new URLSearchParams();

      if (term?.trim()) {
        params.set("q", term.trim());
      }
      if (start) {
        params.set("start", start.toISOString().split("T")[0]);
      }
      if (end) {
        params.set("end", end.toISOString().split("T")[0]);
      }

      const queryString = params.toString();
      const newUrl = queryString ? `?${queryString}` : window.location.pathname;

      router.replace(newUrl, { scroll: false });
    },
    [router],
  );

  // Sync URL params after initialization
  useEffect(() => {
    if (isInitialized) {
      updateQueryParams(searchTerm, startDate, endDate);
    }
  }, [isInitialized, searchTerm, startDate, endDate, updateQueryParams]);

  // Mark as initialized after first render
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // Handle search term change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handle search icon click (for keyboard accessibility)
  const handleSearchClick = () => {
    // Search is reactive, but this provides feedback for the click
  };

  // Handle start date change
  const handleStartDateChange = (date: Date | null) => {
    setStartDate(date);

    // Clear end date if start date is after it
    if (date && endDate) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(0, 0, 0, 0);

      if (start > end) {
        setEndDate(null);
      }
    }
  };

  // Handle end date change
  const handleEndDateChange = (date: Date | null) => {
    setEndDate(date);
  };

  // Handle total count change from TableSearch
  const handleTotalCountChange = useCallback((count: number) => {
    setTotalCount(count);
  }, []);

  return (
    <div className="p-2 lg:p-4">
      {/* Search Card */}
      <Card>
        {/* Title */}
        <h2 className="text-base lg:text-lg font-semibold text-gray-900 mb-4 pb-4 border-b border-gray-200">
          {t("search.title")}
        </h2>

        {/* Desktop: Horizontal layout */}
        <div className="hidden lg:flex lg:items-end gap-4 justify-center">
          {/* Search Input */}
          <div className="flex-1 max-w-md">
            <Input
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder={t("search.placeholder")}
              suffixIcon={Search}
              suffixIconClickable
              onSuffixIconClick={handleSearchClick}
            />
          </div>

          {/* Start Date */}
          <div className="w-40">
            <InputCalendar
              label={t("search.startDate")}
              placeholder="DD/MM/YYYY"
              value={startDate}
              onChange={handleStartDateChange}
            />
          </div>

          {/* End Date */}
          <div className="w-40">
            <InputCalendar
              label={t("search.endDate")}
              placeholder="DD/MM/YYYY"
              value={endDate}
              minDate={startDate}
              onChange={handleEndDateChange}
              align="right"
            />
          </div>
        </div>

        {/* Mobile: Stacked layout */}
        <div className="lg:hidden space-y-3">
          {/* Search Input (full width) */}
          <div className="w-full">
            <Input
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder={t("search.placeholder")}
              suffixIcon={Search}
              suffixIconClickable
              onSuffixIconClick={handleSearchClick}
            />
          </div>

          {/* Dates side by side */}
          <div className="grid grid-cols-2 gap-3">
            <InputCalendar
              label={t("search.startDate")}
              placeholder="DD/MM/YY"
              value={startDate}
              onChange={handleStartDateChange}
            />

            <InputCalendar
              label={t("search.endDate")}
              placeholder="DD/MM/YY"
              value={endDate}
              minDate={startDate}
              onChange={handleEndDateChange}
              align="right"
            />
          </div>
        </div>
      </Card>

      {/* Results Card */}
      {hasFilters && (
        <div className="mt-4 lg:mt-6">
          <Card noPadding>
            {/* Title with count */}
            <div className="px-4 lg:px-8 py-4 lg:py-6 border-b border-gray-200">
              <h2 className="text-base lg:text-lg font-semibold text-gray-900">
                {t("search.results")}
                {totalCount > 0 && ` (${totalCount})`}
              </h2>
            </div>

            {/* Table */}
            <TableSearch
              searchTerm={searchTerm}
              startDate={startDate}
              endDate={endDate}
              processes={filteredProcesses}
              loading={loading}
              onTotalCountChange={handleTotalCountChange}
            />
          </Card>
        </div>
      )}
    </div>
  );
}
