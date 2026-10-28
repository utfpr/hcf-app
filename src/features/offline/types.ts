import type { CriarEventoPayload, CriarEvidenciaPayload } from '@/features/evento/types'
import type { ExpedicaoListItem } from '@/features/expedition/types'
import type { CriarLembretePayload } from '@/features/lembrete/types'

// pending: ainda não subiu; error: a API recusou (fica até o usuário resolver);
// sent: já está na API, só espera a próxima baixa trazê-lo no cache
export type StatusPendencia = 'pending' | 'error' | 'sent'

interface PendenciaBase {
  // Também é o client_uuid enviado à API
  local_id: string
  // Número crescente do aparelho; vira o id negativo na tela até ganhar id da API
  seq: number
  status: StatusPendencia
  erro?: string
  criado_em: string
  remote_id?: number
}

export interface EventoPendente extends PendenciaBase {
  expedicao_id: number
  payload: CriarEventoPayload
}

// O alvo pode ainda não existir na API: aí só tem o local_id, e o envio
// espera o pai subir para descobrir o id
export type AlvoMidia =
  | { tipo: 'evento'; expedicao_id: number; evento_id?: number; evento_local_id?: string }
  | { tipo: 'lembrete'; lembrete_id?: number; lembrete_local_id?: string }

export interface MidiaPendente extends PendenciaBase {
  alvo: AlvoMidia
  // arquivo.uri aponta para a cópia na pasta do app (file://)
  payload: CriarEvidenciaPayload
}

export interface LembretePendente extends PendenciaBase {
  payload: CriarLembretePayload
}

export interface Pendencias {
  proximo_seq: number
  eventos: EventoPendente[]
  midias: MidiaPendente[]
  lembretes: LembretePendente[]
}

export interface CacheExpedicoes {
  // Todas as expedições (lista)
  itens: ExpedicaoListItem[]
  // Expedições de que o usuário participa (Home)
  minhas: number[]
  // Expedições com detalhe e registros baixados
  detalhadas: number[]
}

export interface MetaOffline {
  ultima_sincronizacao: string | null
  ultima_baixa: string | null
}
