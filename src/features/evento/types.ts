// Espelha as entidades Evento e Evidencia do hcf-api (/v1/eventos).
// O diário é o evento "genérico"; a coleta é um evento com a ficha de coleta.

import type { SyncStatus } from '@/features/sync/types'

export type { SyncStatus }
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
  data_captura: string
  latitude: number | null
  longitude: number | null
  altitude: number | null
  observacoes: string | null
  coleta: FichaColeta | null
  created_at: string
  updated_at: string
  created_by: number | null
  updated_by: number | null
  // Mesma coleta física registrada por várias pessoas: a API junta tudo num evento só
  numero_coleta?: string | null
  // Chave de idempotência gerada no app; null no que foi criado pelo web
  client_uuid?: string | null
  syncStatus?: import('@/features/sync/types').SyncStatus
  // Só nos registros que ainda estão no aparelho (id negativo, sem id da API)
  local_id?: string
}

export interface CriarEventoPayload {
  tipo: EventoTipo
  data_captura: string
  latitude?: number | null
  longitude?: number | null
  altitude?: number | null
  observacoes?: string | null
  // Obrigatória em COLETA e proibida em DIARIO. Campos omitidos viram null na API.
  coleta?: Partial<FichaColeta>
  // Só em COLETA. Mesmo número na mesma expedição = mesma coleta (a API junta)
  numero_coleta?: string | null
  client_uuid?: string
}

export interface Evidencia {
  id: number
  evento_id: number
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
  // Na API, caminho relativo (/uploads/...); no aparelho, file://
  url: string
  syncStatus?: import('@/features/sync/types').SyncStatus
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
  data_captura: string
  client_uuid?: string
}

// Evento já acompanhado das evidências dele, pronto para exibir na tela
export interface RegistroExpedicao extends Evento {
  evidencias: Evidencia[]
}
