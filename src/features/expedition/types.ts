export interface ParticipanteExpedicao {
  id: number
  nome: string
}

export interface Expedicao {
  id: number
  descricao: string | null
  data_inicio: string
  data_fim: string
  cidade_id: number
  created_at: string
  updated_at: string
  created_by: number | null
  updated_by: number | null
}

export interface ExpedicaoListItem extends Expedicao {
  participantes: ParticipanteExpedicao[]
  rotas: number[]
}

export interface Paginacao<T> {
  itens: T[]
  total: number
  limite: number
  pagina: number
}

export type OrdemExpedicao =
  | 'id:asc'
  | 'id:desc'
  | 'data_inicio:asc'
  | 'data_inicio:desc'
  | 'data_fim:asc'
  | 'data_fim:desc'

export interface FiltrosExpedicao extends Record<string, string | number | boolean | undefined> {
  cidade_id?: number
  usuario_id?: number
  data_inicio_de?: string
  data_fim_ate?: string
  order?: OrdemExpedicao
  limite?: number
  pagina?: number
}

export interface CriarExpedicaoPayload {
  descricao: string | null
  data_inicio: string
  data_fim: string
  cidade_id: number
  created_by: number | null
  participantes: number[]
  rotas: number[]
}

export interface AtualizarExpedicaoPayload {
  descricao: string | null
  data_inicio: string
  data_fim: string
  cidade_id: number
  updated_by: number
}
