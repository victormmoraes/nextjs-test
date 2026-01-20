export type PeriodType = 'today' | 'yesterday' | 'last7days' | 'custom';

export interface FilterState {
  startDate: Date | null;
  endDate: Date | null;
  periodType: PeriodType;
  isManualEdit: boolean;
}

export interface SavedFilters {
  startDate: string | null;
  endDate: string | null;
  periodType: PeriodType;
  isManualEdit: boolean;
}
