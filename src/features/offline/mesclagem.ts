import type { Evidencia, FichaColeta, RegistroExpedicao } from '@/features/evento/types'
import type { Lembrete } from '@/features/lembrete/types'
import type { SyncStatus } from '@/features/sync/types'

import type {
  EventoPendente,
  LembretePendente,
  MidiaPendente,
  Pendencias,
  StatusPendencia,
} from './types'

const CAMPOS_FICHA: Array<keyof FichaColeta> = [
  'familia', 'nome_popular', 'nome_cientifico', 'municipio', 'estado', 'referencia_local',
  'tipo_vegetacao', 'solo', 'relevo', 'substrato', 'tronco_com_casca', 'associacoes',
  'folhas', 'habito', 'frutos', 'flores', 'luminosidade',
]

const PESO: Record<SyncStatus, number> = { synced: 0, syncing: 1, pending: 2, error: 3 }

export function syncStatusDe(status: StatusPendencia): SyncStatus {
  if (status === 'sent') return 'synced'
  return status
}

/** O pior status vence: erro > pendente > sincronizado */
export function piorStatus(statuses: SyncStatus[]): SyncStatus {
  return statuses.reduce<SyncStatus>((pior, atual) => (PESO[atual] > PESO[pior] ? atual : pior), 'synced')
}

function fichaCompleta(parcial: Partial<FichaColeta> | undefined): FichaColeta | null {
  if (!parcial) return null
  return Object.fromEntries(CAMPOS_FICHA.map(campo => [campo, parcial[campo] ?? null])) as unknown as FichaColeta
}

function midiaParaEvidencia(midia: MidiaPendente, eventoId: number): Evidencia {
  return {
    id: -midia.seq,
    evento_id: eventoId,
    nome: midia.payload.nome,
    arquivo: midia.payload.arquivo.name,
    mime_type: midia.payload.arquivo.type,
    tamanho: 0,
    data_captura: midia.payload.data_captura,
    created_at: midia.criado_em,
    updated_at: midia.criado_em,
    created_by: null,
    updated_by: null,
    client_uuid: midia.local_id,
    url: midia.payload.arquivo.uri,
    syncStatus: syncStatusDe(midia.status),
  }
}

function midiasDoEvento(pendencias: Pendencias, evento: { id?: number; local_id?: string }): MidiaPendente[] {
  return pendencias.midias.filter(midia => midia.alvo.tipo === 'evento' && (
    (evento.id !== undefined && midia.alvo.evento_id === evento.id)
    || (evento.local_id !== undefined && midia.alvo.evento_local_id === evento.local_id)
  ))
}

function eventoParaRegistro(evento: EventoPendente, midias: MidiaPendente[]): RegistroExpedicao {
  const id = evento.remote_id ?? -evento.seq
  const evidencias = midias.map(midia => midiaParaEvidencia(midia, id))
  return {
    id,
    expedicao_id: evento.expedicao_id,
    tipo: evento.payload.tipo,
    data_captura: evento.payload.data_captura,
    latitude: evento.payload.latitude ?? null,
    longitude: evento.payload.longitude ?? null,
    altitude: evento.payload.altitude ?? null,
    observacoes: evento.payload.observacoes ?? null,
    coleta: evento.payload.tipo === 'COLETA' ? fichaCompleta(evento.payload.coleta) : null,
    numero_coleta: evento.payload.numero_coleta ?? null,
    created_at: evento.criado_em,
    updated_at: evento.criado_em,
    created_by: null,
    updated_by: null,
    client_uuid: evento.local_id,
    local_id: evento.local_id,
    syncStatus: piorStatus([syncStatusDe(evento.status), ...evidencias.map(e => e.syncStatus ?? 'synced')]),
    evidencias,
  }
}

/**
 * Registros da expedição para a tela: o que veio da API mais o que ainda está
 * no aparelho. O que já subiu e já voltou na baixa (mesmo client_uuid) aparece uma vez só.
 */
export function mesclarRegistros(
  cache: RegistroExpedicao[],
  pendencias: Pendencias,
  expedicaoId: number,
): RegistroExpedicao[] {
  const uuidsNoCache = new Set<string>()
  cache.forEach(registro => {
    if (registro.client_uuid) uuidsNoCache.add(registro.client_uuid)
    registro.evidencias.forEach(evidencia => {
      if (evidencia.client_uuid) uuidsNoCache.add(evidencia.client_uuid)
    })
  })

  const remotos = cache.map(registro => {
    const midias = midiasDoEvento(pendencias, { id: registro.id })
      .filter(midia => !uuidsNoCache.has(midia.local_id))
    if (midias.length === 0) return { ...registro, syncStatus: 'synced' as const }

    const novas = midias.map(midia => midiaParaEvidencia(midia, registro.id))
    return {
      ...registro,
      evidencias: [...registro.evidencias, ...novas],
      syncStatus: piorStatus(novas.map(e => e.syncStatus ?? 'synced')),
    }
  })

  const locais = pendencias.eventos
    .filter(evento => evento.expedicao_id === expedicaoId && !uuidsNoCache.has(evento.local_id))
    .map(evento => eventoParaRegistro(
      evento,
      midiasDoEvento(pendencias, { id: evento.remote_id, local_id: evento.local_id })
        .filter(midia => !uuidsNoCache.has(midia.local_id)),
    ))

  return juntarPorNumero([...locais, ...remotos])
    .sort((a, b) => b.data_captura.localeCompare(a.data_captura))
}

export function numeroDaColeta(registro: Pick<RegistroExpedicao, 'tipo' | 'numero_coleta'>): string | null {
  if (registro.tipo !== 'COLETA') return null
  return registro.numero_coleta?.trim() || null
}

/**
 * Coletas com o mesmo número são a mesma coleta física (registrada por várias
 * pessoas): viram um card só, como a API faz ao sincronizar. A base é a que já
 * está na API (se houver); as evidências de todas ficam juntas, em ordem de captura.
 */
function juntarPorNumero(registros: RegistroExpedicao[]): RegistroExpedicao[] {
  const grupos = new Map<string, RegistroExpedicao[]>()
  const avulsos: RegistroExpedicao[] = []

  registros.forEach(registro => {
    const numero = numeroDaColeta(registro)
    if (!numero) {
      avulsos.push(registro)
      return
    }
    grupos.set(numero, [...(grupos.get(numero) ?? []), registro])
  })

  const juntados = [...grupos.values()].map(grupo => {
    if (grupo.length === 1) return grupo[0]

    const base = grupo.find(registro => registro.id > 0) ?? grupo[0]
    const evidencias = grupo
      .flatMap(registro => registro.evidencias)
      .sort((a, b) => a.data_captura.localeCompare(b.data_captura))
    const dataCaptura = grupo
      .map(registro => registro.data_captura)
      .reduce((menor, atual) => (atual < menor ? atual : menor))

    return {
      ...base,
      data_captura: dataCaptura,
      evidencias,
      syncStatus: piorStatus(grupo.map(registro => registro.syncStatus ?? 'synced')),
    }
  })

  return [...avulsos, ...juntados]
}

/** Já existe coleta com esse número na expedição (na API ou só no aparelho)? */
export function existeColetaComNumero(registros: RegistroExpedicao[], numero: string): boolean {
  const procurado = numero.trim()
  return procurado !== '' && registros.some(registro => numeroDaColeta(registro) === procurado)
}

/** Status do card da expedição: só conta o que ainda não subiu */
export function statusDaExpedicao(pendencias: Pendencias, expedicaoId: number): SyncStatus {
  const eventos = pendencias.eventos.filter(evento => evento.expedicao_id === expedicaoId)
  const midias = pendencias.midias.filter(midia => midia.alvo.tipo === 'evento' && midia.alvo.expedicao_id === expedicaoId)
  return piorStatus([...eventos, ...midias].map(item => syncStatusDe(item.status)))
}

function lembretePendenteParaLembrete(lembrete: LembretePendente, midias: MidiaPendente[]): Lembrete {
  const ficha = fichaCompleta(lembrete.payload) as FichaColeta
  return {
    ...ficha,
    id: lembrete.remote_id ?? -lembrete.seq,
    data_coleta: lembrete.payload.data_coleta,
    local_coleta: lembrete.payload.local_coleta,
    expedicao_id: lembrete.payload.expedicao_id ?? null,
    created_at: lembrete.criado_em,
    updated_at: lembrete.criado_em,
    created_by: null,
    updated_by: null,
    client_uuid: lembrete.local_id,
    syncStatus: piorStatus([syncStatusDe(lembrete.status), ...midias.map(midia => syncStatusDe(midia.status))]),
  }
}

/** Lembretes da API mais os que ainda estão no aparelho */
export function mesclarLembretes(cache: Lembrete[], pendencias: Pendencias): Lembrete[] {
  const uuidsNoCache = new Set(cache.map(lembrete => lembrete.client_uuid).filter(Boolean))

  const midiasDe = (lembrete: { id?: number; local_id?: string }) => pendencias.midias.filter(midia => (
    midia.alvo.tipo === 'lembrete' && (
      (lembrete.id !== undefined && midia.alvo.lembrete_id === lembrete.id)
      || (lembrete.local_id !== undefined && midia.alvo.lembrete_local_id === lembrete.local_id)
    )
  ))

  const remotos = cache.map(lembrete => ({
    ...lembrete,
    syncStatus: piorStatus(midiasDe({ id: lembrete.id }).map(midia => syncStatusDe(midia.status))),
  }))

  const locais = pendencias.lembretes
    .filter(lembrete => !uuidsNoCache.has(lembrete.local_id))
    .map(lembrete => lembretePendenteParaLembrete(
      lembrete,
      midiasDe({ id: lembrete.remote_id, local_id: lembrete.local_id }),
    ))

  return [...locais, ...remotos]
}
