export interface Expedition {
  id: string;
  name: string;
  date: string;
  location: string;
  status: 'Em andamento' | 'Planejada' | 'Finalizada';
}