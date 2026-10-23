import type { SyncStatus } from '@/features/sync/types';

export type ExpeditionStatus = 'Em andamento' | 'Planejada' | 'Finalizada';

export type { SyncStatus };

export interface Expedition {
  id: string;
  name: string;
  date: string;
  location: string;
  status: ExpeditionStatus;
  syncStatus?: SyncStatus;
}