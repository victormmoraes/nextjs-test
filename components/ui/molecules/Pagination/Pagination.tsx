'use client';

import { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/atoms/Button';
import type { PaginationProps } from './Pagination.types';

export function Pagination({
  currentPage,
  totalItems,
  itemsPerPage = 10,
  onPageChange,
}: PaginationProps) {
  const t = useTranslations('pagination');

  const totalPages = useMemo(() => Math.ceil(totalItems / itemsPerPage), [totalItems, itemsPerPage]);

  const startItem = useMemo(() => {
    if (totalItems === 0) return 0;
    return (currentPage - 1) * itemsPerPage + 1;
  }, [currentPage, itemsPerPage, totalItems]);

  const endItem = useMemo(() => {
    const end = currentPage * itemsPerPage;
    return end > totalItems ? totalItems : end;
  }, [currentPage, itemsPerPage, totalItems]);

  const visiblePages = useMemo(() => {
    const pages: (number | 'ellipsis')[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push('ellipsis');
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('ellipsis');
      }

      pages.push(totalPages);
    }

    return pages;
  }, [totalPages, currentPage]);

  const previousPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-300 bg-white">
      <div className="text-sm text-secondary">
        {t('showing')} {startItem} {t('to')} {endItem}
      </div>

      <div className="flex items-center gap-2">
        <Button variant="pagination" size="xs" disabled={currentPage === 1} onClick={previousPage}>
          <ChevronLeft size={16} />
        </Button>

        <div className="flex items-center gap-1">
          {visiblePages.map((page, index) =>
            page === 'ellipsis' ? (
              <span key={`ellipsis-${index}`} className="px-3 py-2 text-sm text-secondary">
                ...
              </span>
            ) : (
              <Button
                key={page}
                variant={currentPage === page ? 'primary' : 'pagination'}
                size="xs"
                onClick={() => goToPage(page)}
              >
                {page}
              </Button>
            )
          )}
        </div>

        <Button
          variant="pagination"
          size="xs"
          disabled={currentPage === totalPages}
          onClick={nextPage}
        >
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
}
