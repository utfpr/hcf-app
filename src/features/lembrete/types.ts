// Espelha a entidade Lembrete do hcf-api (/v2/lembretes): a mesma ficha da
// coleta, mais a data e o local para voltar a coletar numa expedição futura.

import type { FichaColeta } from '@/features/evento/types'

export interface Lembrete extends FichaColeta {
  id: number
  data_coleta: string // YYYY-MM-DD
  local_coleta: string
  created_at: string
  updated_at: string
  created_by: number | null
  updated_by: number | null
}

export interface CriarLembretePayload extends Partial<FichaColeta> {
  data_coleta: string // YYYY-MM-DD
  local_coleta: string
}
