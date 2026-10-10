
import type { FichaColeta } from '@/features/evento/types'
import type { Paginacao } from '@/features/expedition/types'

export interface Lembrete extends FichaColeta {
  id: number
  data_coleta: string
  local_coleta: string
  created_at: string
  updated_at: string
  created_by: number | null
  updated_by: number | null
}

export type OrdemLembrete =
  | 'id:asc'
  | 'id:desc'
  | 'data_coleta:asc'
  | 'data_coleta:desc'

export interface FiltrosLembrete
  extends Record<string, string | number | undefined> {
  data_coleta_de?: string
  data_coleta_ate?: string
  order?: OrdemLembrete
  limite?: number
  pagina?: number
}

export type PaginacaoLembretes = Paginacao<Lembrete>
