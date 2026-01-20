'use client';

import { useState, useCallback, useEffect } from 'react';
import { authFetch } from '@/contexts/AuthContext';
import type { ProcessWithRelations } from '@/types/process';
import type { ProcessSummary } from '@prisma/client';

export interface UseProcessesOptions {
  startDate?: Date | null;
  endDate?: Date | null;
  search?: string;
  classificationId?: number;
  isFavorite?: boolean;
  page?: number;
  pageSize?: number;
}

export interface UseProcessesResult {
  processes: ProcessWithRelations[];
  filteredProcesses: ProcessWithRelations[];
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
  error: string | null;
  favoriteProcessIds: Set<string>;
  refresh: () => Promise<void>;
  toggleFavorite: (processId: string) => Promise<void>;
  loadSummary: (processId: string) => Promise<ProcessSummary | null>;
}

export function useProcesses(options: UseProcessesOptions = {}): UseProcessesResult {
  const [processes, setProcesses] = useState<ProcessWithRelations[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(options.page || 1);
  const [pageSize] = useState(options.pageSize || 1000);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favoriteProcessIds, setFavoriteProcessIds] = useState<Set<string>>(new Set());

  const fetchProcesses = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set('page', '1');
      params.set('pageSize', pageSize.toString());

      if (options.search) {
        params.set('search', options.search);
      }
      if (options.classificationId) {
        params.set('classificationId', options.classificationId.toString());
      }
      if (options.isFavorite !== undefined) {
        params.set('isFavorite', options.isFavorite.toString());
      }

      const response = await authFetch(`/api/processes?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch processes');
      }

      const data = await response.json();
      const processData = data.data || [];

      setProcesses(processData);
      setTotal(data.pagination?.total || processData.length);
      setPage(data.pagination?.page || 1);

      // Build favorite set
      const favorites = new Set<string>();
      processData.forEach((p: ProcessWithRelations) => {
        if (p.isFavorite) {
          favorites.add(p.id);
        }
      });
      setFavoriteProcessIds(favorites);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [pageSize, options.search, options.classificationId, options.isFavorite]);

  // Filter processes by date range on client side
  const filteredProcesses = processes.filter((process) => {
    const processDate = new Date(process.lastUpdateDate);
    processDate.setHours(0, 0, 0, 0);

    if (options.startDate) {
      const start = new Date(options.startDate);
      start.setHours(0, 0, 0, 0);
      if (processDate < start) return false;
    }

    if (options.endDate) {
      const end = new Date(options.endDate);
      end.setHours(23, 59, 59, 999);
      if (processDate > end) return false;
    }

    return true;
  });

  const toggleFavorite = useCallback(async (processId: string) => {
    try {
      const response = await authFetch(`/api/processes/${processId}/favorite`, {
        method: 'POST',
      });

      if (response.ok) {
        setFavoriteProcessIds((prev) => {
          const next = new Set(prev);
          if (next.has(processId)) {
            next.delete(processId);
          } else {
            next.add(processId);
          }
          return next;
        });

        // Update the process in the list
        setProcesses((prev) =>
          prev.map((p) =>
            p.id === processId ? { ...p, isFavorite: !p.isFavorite } : p
          )
        );
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  }, []);

  const loadSummary = useCallback(async (processId: string): Promise<ProcessSummary | null> => {
    try {
      const response = await authFetch(`/api/processes/${processId}/summary`);

      if (response.ok) {
        const data = await response.json();
        return data.data;
      }
    } catch (err) {
      console.error('Failed to load summary:', err);
    }

    return null;
  }, []);

  useEffect(() => {
    fetchProcesses();
  }, [fetchProcesses]);

  return {
    processes,
    filteredProcesses,
    total,
    page,
    pageSize,
    loading,
    error,
    favoriteProcessIds,
    refresh: fetchProcesses,
    toggleFavorite,
    loadSummary,
  };
}
