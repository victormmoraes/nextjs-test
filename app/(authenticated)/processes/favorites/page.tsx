'use client';

import { Card } from '@/components/ui/molecules/Card';
import { TableProcess } from '@/components/ui/organisms/TableProcess';
import { useProcesses } from '@/hooks/useProcesses';

/**
 * Favorites Page
 *
 * Displays favorite processes in a table with:
 * - Favorites-only filter
 * - Sorting and pagination
 */
export default function FavoritesPage() {
  const {
    filteredProcesses,
    loading,
    favoriteProcessIds,
    toggleFavorite,
    loadSummary,
  } = useProcesses({});

  // Filter to show only favorites
  const favoriteProcesses = filteredProcesses.filter((p) =>
    favoriteProcessIds.has(p.id)
  );

  return (
    <div className="p-2 lg:p-6">
      <Card noPadding>
        <TableProcess
          processes={favoriteProcesses}
          loading={loading}
          favoritesOnly
          favoriteProcessIds={favoriteProcessIds}
          onFavoriteToggle={toggleFavorite}
          onLoadSummary={loadSummary}
        />
      </Card>
    </div>
  );
}
