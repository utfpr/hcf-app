// Espelha as entidades Evento e Evidencia do hcf-api (/v2/eventos).
// O diário é o evento "genérico"; a coleta é um evento com a ficha de coleta.

export type EventoTipo = 'DIARIO' | 'COLETA'

export interface FichaColeta {
  familia: string | null
  nome_popular: string | null
  nome_cientifico: string | null
  municipio: string | null
  estado: string | null
  referencia_local: string | null
  tipo_vegetacao: string | null
  solo: string | null
  relevo: string | null
  substrato: string | null
  tronco_com_casca: string | null
  associacoes: string | null
  folhas: string | null
  habito: string | null
  frutos: string | null
  flores: string | null
  luminosidade: string | null
}

export interface Evento {
  id: number
  expedicao_id: number
  tipo: EventoTipo
  capturado_em: string
  latitude: number | null
  longitude: number | null
  altitude: number | null
  observacoes: string | null
  coleta: FichaColeta | null
  created_at: string
  updated_at: string
  created_by: number | null
  updated_by: number | null
}

export interface CriarEventoPayload {
  tipo: EventoTipo
  capturado_em: string
  latitude?: number | null
  longitude?: number | null
  altitude?: number | null
  observacoes?: string | null
  // Obrigatória em COLETA e proibida em DIARIO. Campos omitidos viram null na API.
  coleta?: Partial<FichaColeta>
}

export interface Evidencia {
  id: number
  evento_id: number
  nome: string
  arquivo: string
  mime_type: string
  tamanho: number
  capturado_em: string
  created_at: string
  updated_at: string
  created_by: number | null
  updated_by: number | null
  url: string
}

// Arquivo local no formato que o FormData do React Native aceita.
export interface ArquivoLocal {
  uri: string
  name: string
  type: string
}

export interface CriarEvidenciaPayload {
  arquivo: ArquivoLocal
  nome: string
  capturado_em: string
}

// Evento já acompanhado das evidências dele, pronto para exibir na tela
export interface RegistroExpedicao extends Evento {
  evidencias: Evidencia[]
}
