export type ExpeditionStatus = 'Em andamento' | 'Planejada' | 'Finalizada';

export interface Expedition {
  id: string;
  name: string;
  date: string;
  location: string;
  status: ExpeditionStatus;
}