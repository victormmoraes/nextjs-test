'use client';

import { useState, useMemo, useCallback } from 'react';

export interface UsePaginationOptions {
  initialPage?: number;
  itemsPerPage?: number;
}

export interface UsePaginationReturn<T> {
  currentPage: number;
  totalPages: number;
  paginatedData: T[];
  visiblePages: (number | 'ellipsis')[];
  startItem: number;
  endItem: number;
  setCurrentPage: (page: number) => void;
  goToNextPage: () => void;
  goToPrevPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  isFirstPage: boolean;
  isLastPage: boolean;
}

export function usePagination<T>(
  data: T[],
  options: UsePaginationOptions = {}
): UsePaginationReturn<T> {
  const { initialPage = 1, itemsPerPage = 10 } = options;
  const [currentPage, setCurrentPage] = useState(initialPage);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(data.length / itemsPerPage)),
    [data.length, itemsPerPage]
  );

  // Ensure current page is valid when data changes
  const validCurrentPage = useMemo(
    () => Math.min(Math.max(1, currentPage), totalPages),
    [currentPage, totalPages]
  );

  const paginatedData = useMemo(() => {
    const start = (validCurrentPage - 1) * itemsPerPage;
    return data.slice(start, start + itemsPerPage);
  }, [data, validCurrentPage, itemsPerPage]);

  const startItem = useMemo(
    () => (data.length === 0 ? 0 : (validCurrentPage - 1) * itemsPerPage + 1),
    [data.length, validCurrentPage, itemsPerPage]
  );

  const endItem = useMemo(
    () => Math.min(validCurrentPage * itemsPerPage, data.length),
    [validCurrentPage, itemsPerPage, data.length]
  );

  const visiblePages = useMemo(() => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (validCurrentPage <= 3) {
        for (let i = 2; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (validCurrentPage >= totalPages - 2) {
        pages.push('ellipsis');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push('ellipsis');
        for (let i = validCurrentPage - 1; i <= validCurrentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }

    return pages;
  }, [totalPages, validCurrentPage]);

  const goToNextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  const goToPrevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  }, []);

  const goToFirstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const goToLastPage = useCallback(() => {
    setCurrentPage(totalPages);
  }, [totalPages]);

  return {
    currentPage: validCurrentPage,
    totalPages,
    paginatedData,
    visiblePages,
    startItem,
    endItem,
    setCurrentPage,
    goToNextPage,
    goToPrevPage,
    goToFirstPage,
    goToLastPage,
    isFirstPage: validCurrentPage === 1,
    isLastPage: validCurrentPage === totalPages,
  };
}
