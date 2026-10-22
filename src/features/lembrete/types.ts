// Espelha a entidade Lembrete do hcf-api (/v1/lembretes): a mesma ficha da
// coleta, mais a data e o local para voltar a coletar numa expedição futura.

import type { FichaColeta } from '@/features/evento/types'
import type { Paginacao } from '@/features/expedition/types'

export interface Lembrete extends FichaColeta {
  id: number
  data_coleta: string // YYYY-MM-DD
  local_coleta: string
  descricao?: string | null
  latitude?: number | null
  longitude?: number | null
  // Expedição de onde o lembrete foi criado; null quando não veio de uma
  expedicao_id?: number | null
  // Fotos; a listagem da API já devolve junto de cada lembrete. As ainda não
  // enviadas aparecem com a uri do arquivo no aparelho
  evidencias?: FotoLembrete[]
  created_at: string
  updated_at: string
  created_by: number | null
  updated_by: number | null
  client_uuid?: string | null
  syncStatus?: import('@/features/sync/types').SyncStatus
}

export type FotoLembrete = Pick<LembreteEvidencia, 'id' | 'nome' | 'url'>

// Foto do lembrete (/v1/lembretes/:id/evidencias); só aceita imagem.
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
  descricao?: string | null
  latitude?: number | null
  longitude?: number | null
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
