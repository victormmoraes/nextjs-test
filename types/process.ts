import type { Prisma } from "@prisma/client";

// Process with relations as returned by the API
export type ProcessWithRelations = Prisma.ProcessGetPayload<{
  include: {
    classification: true;
    tenant: { select: { id: true; name: true } };
    summary: { select: { id: true } };
    protocols: {
      select: { protocolNumber: true; protocolType: true };
    };
    _count: { select: { protocols: true } };
  };
}>;

// Process with full details (for detail pages)
export type ProcessWithFullDetails = Prisma.ProcessGetPayload<{
  include: {
    classification: true;
    tenant: { select: { id: true; name: true } };
    summary: true;
    onGoingList: true;
    protocols: true;
  };
}>;

// Summary data types for process summaries
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

export type SummaryData = FiscalizationBaseSummary | FiscalizationFuelQualitySummary | Record<string, unknown>;

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
