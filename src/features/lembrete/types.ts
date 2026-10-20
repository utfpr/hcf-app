// Espelha a entidade Lembrete do hcf-api (/v1/lembretes): a mesma ficha da
// coleta, mais a data e o local para voltar a coletar numa expedição futura.

import type { FichaColeta } from '@/features/evento/types'
import type { Paginacao } from '@/features/expedition/types'

export interface Lembrete extends FichaColeta {
  id: number
  data_coleta: string // YYYY-MM-DD
  local_coleta: string
  // Expedição de onde o lembrete foi criado; null quando não veio de uma
  expedicao_id?: number | null
  created_at: string
  updated_at: string
  created_by: number | null
  updated_by: number | null
  client_uuid?: string | null
  syncStatus?: import('@/features/sync/types').SyncStatus
}

// Multimídia do lembrete (/v1/lembretes/:id/evidencias); mesmo formato da evidência do evento.
export interface LembreteEvidencia {
  id: number
  lembrete_id: number
  nome: string
  arquivo: string
  mime_type: string
  tamanho: number
  data_captura: string
  created_at: string
  updated_at: string
  created_by: number | null
  updated_by: number | null
  client_uuid?: string | null
  url: string
}

export interface CriarLembretePayload extends Partial<FichaColeta> {
  data_coleta: string // YYYY-MM-DD
  local_coleta: string
  expedicao_id?: number
  client_uuid?: string
}

export type OrdemLembrete =
  | 'id:asc'
  | 'id:desc'
  | 'data_coleta:asc'
  | 'data_coleta:desc'

export interface FiltrosLembrete
  extends Record<string, string | number | undefined> {
  expedicao_id?: number
  data_coleta_de?: string
  data_coleta_ate?: string
  order?: OrdemLembrete
  limite?: number
  pagina?: number
}

export type PaginacaoLembretes = Paginacao<Lembrete>
