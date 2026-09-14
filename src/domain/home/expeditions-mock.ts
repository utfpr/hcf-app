import { Expedition } from './types';

export const MOCK_ACTIVE_EXPEDITIONS: Expedition[] = [
  {
    id: 'a-1',
    name: 'Serra da Canastra',
    date: '15/02/2026',
    location: 'MG – Brasil',
    status: 'Em andamento',
  },
  {
    id: 'a-2',
    name: 'Pantanal Norte',
    date: '03/01/2026',
    location: 'MT – Brasil',
    status: 'Em andamento',
  },
  {
    id: 'a-3',
    name: 'Chapada Diamantina',
    date: '20/12/2025',
    location: 'BA – Brasil',
    status: 'Planejada',
  },
  {
    id: 'a-4',
    name: 'Ilha do Cardoso',
    date: '10/11/2025',
    location: 'SP – Brasil',
    status: 'Em andamento',
  },
];

export const MOCK_HISTORY_EXPEDITIONS: Expedition[] = [
    {
        id: 'h-1',
        name: 'Serra do Cipó',
        date: '14/08/2025',
        location: 'MG - Brasil',
        status: 'Finalizada',
    },
    {
        id: 'h-2',
        name: 'Monte Roraima',
        date: '02/06/2025',
        location: 'RR - Brasil',
        status: 'Finalizada',
    },
    {
        id: 'h-3',
        name: 'Parque Nacional do Iguaçu',
        date: '19/04/2025',
        location: 'PR - Brasil',
        status: 'Finalizada',
    },
];