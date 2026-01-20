export interface ProcessPresenter {
  id: string;
  processNumber: string;
  lastUpdateDate: string;
  interestedParties: string[];
  classificationName: string;
  generationDate: string;
  protocolNumber?: string;
  protocolType?: string;
  protocolCount?: number;
  processSummary?: boolean;
  pdfUrl?: string;
  isFavorite?: boolean;
}

export interface ProcessSummaryPresenter {
  id: string;
  processId: string;
  summaryData?: FiscalizationBaseSummary | FiscalizationFuelQualitySummary | Record<string, unknown>;
}

export interface FiscalizationBaseSummary {
  type: 'FiscalizationBase';
  resume?: {
    small?: string;
    full?: string;
  };
  emails?: string;
  companies?: string;
  geography?: string;
  related_activities?: string;
  equipments?: string;
}

export interface FiscalizationFuelQualitySummary {
  type: 'FiscalizationFuelQuality';
  summary?: string;
  violation?: string;
  substances?: string;
  expectedRange?: string;
  measuredRange?: string;
  cnpj?: string;
  defensePresented?: string;
  defenseDate?: string;
  companyName?: string;
}

export function isFiscalizationBaseSummary(
  data: unknown
): data is FiscalizationBaseSummary {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return d.type === 'FiscalizationBase' || 'resume' in d;
}

export function isFiscalizationFuelQualitySummary(
  data: unknown
): data is FiscalizationFuelQualitySummary {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return d.type === 'FiscalizationFuelQuality' || ('summary' in d && 'violation' in d);
}

export interface OnGoingListPresenter {
  id: string;
  onGoingDate: string;
  onGoingUnit: string;
  onGoingDescription: string;
}

export interface ProtocolPresenter {
  id: string;
  protocolNumber: string;
  protocolType?: string;
  protocolUnit?: string;
  protocolCreatedAt: string;
  protocolIncludedAt: string;
}
