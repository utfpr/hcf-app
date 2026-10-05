import type { ExpedicaoListItem } from '@/features/expedition/types';

import { Expedition, ExpeditionStatus } from './types';

export interface HomeExpeditions {
  active: Expedition[];
  history: Expedition[];
}

/** Data local no formato da API (YYYY-MM-DD), sem passar por UTC */
export function toApiDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** 2026-09-20 -> 20/09/2026 (a API devolve só a data, então não convertemos para Date) */
function formatDate(apiDate: string): string {
  const [year, month, day] = apiDate.slice(0, 10).split('-');
  return `${day}/${month}/${year}`;
}

// Datas em YYYY-MM-DD podem ser comparadas como texto
function getStatus(item: ExpedicaoListItem, today: string): ExpeditionStatus {
  if (item.data_fim < today) {
    return 'Finalizada';
  }
  if (item.data_inicio > today) {
    return 'Planejada';
  }
  return 'Em andamento';
}

function formatLocation(item: ExpedicaoListItem): string {
  if (item.cidade_nome && item.estado_sigla) {
    return `${item.cidade_nome} – ${item.estado_sigla}`;
  }
  return item.cidade_nome ?? 'Local não informado';
}

function toExpedition(item: ExpedicaoListItem, today: string): Expedition {
  return {
    id: String(item.id),
    name: item.descricao?.trim() || `Expedição #${item.id}`,
    date: formatDate(item.data_inicio),
    location: formatLocation(item),
    status: getStatus(item, today),
  };
}

/**
 * Ativas: ainda não terminaram (em andamento e planejadas), da mais antiga para a mais nova.
 * Histórico: já terminaram, da que terminou mais recentemente para a mais antiga.
 */
export function splitExpeditions(items: ExpedicaoListItem[], today: string): HomeExpeditions {
  const active = items
    .filter(item => item.data_fim >= today)
    .sort((a, b) => a.data_inicio.localeCompare(b.data_inicio));

  const history = items
    .filter(item => item.data_fim < today)
    .sort((a, b) => b.data_fim.localeCompare(a.data_fim));

  return {
    active: active.map(item => toExpedition(item, today)),
    history: history.map(item => toExpedition(item, today)),
  };
}
