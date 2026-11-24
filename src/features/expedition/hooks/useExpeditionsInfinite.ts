import { useCallback, useEffect, useMemo, useState } from 'react'

import { getStatus, toApiDate } from '@/features/home/mapExpeditions'
import type { ExpeditionStatus } from '@/features/home/types'
import { statusDaExpedicao } from '@/features/offline/mesclagem'
import { useOffline } from '@/features/offline/OfflineContext'
import type { SyncStatus } from '@/features/sync/types'
import { useQuery } from '@/hooks/query/useQuery'
import { contemTermo } from '@/libraries/text/normalizar'

/** Quantidade de expedições exibidas a cada "página" do scroll infinito */
const LIMITE = 10

/** Filtros aplicados na lista de expedições */
export interface FiltroExpedicoes {
  // Trecho do nome ou da cidade
  busca?: string
  status?: ExpeditionStatus | null
}

/**
 * Lista de expedições com busca, filtro por status e scroll infinito.
 *
 * Lê todas as expedições salvas no aparelho (armazenamento offline), mais
 * recentes primeiro. A lista já está toda em memória: o "scroll infinito" só
 * vai mostrando de LIMITE em LIMITE.
 *
 * @param filtro busca (trecho do nome ou da cidade) e status desejado
 * @returns itens visíveis, total filtrado, estados de loading/erro e as funções
 *          loadMore (mostra mais), refresh (baixa do servidor e relê) e
 *          syncStatusDe (situação de sincronização de uma expedição)
 */
export function useExpeditionsInfinite(filtro: FiltroExpedicoes = {}) {
  const { store, baixar } = useOffline()
  const [visiveis, setVisiveis] = useState(LIMITE)
  const { busca = '', status = null } = filtro

  const fetcher = useCallback(async () => {
    const [cache, pendencias] = await Promise.all([store.lerExpedicoes(), store.pendencias()])
    return {
      itens: [...cache.itens].sort((a, b) => b.id - a.id),
      pendencias,
    }
  }, [store])

  const query = useQuery(fetcher, ['expeditions-infinite', store.usuarioId])

  const today = toApiDate(new Date())
  const todas = useMemo(() => (query.data?.itens ?? []).filter(item => {
    if (status && getStatus(item, today) !== status) return false
    if (busca.trim() && !contemTermo(item.descricao, busca) && !contemTermo(item.cidade_nome, busca)) return false
    return true
  }), [query.data, status, busca, today])

  // Filtro novo: volta para o começo da lista
  useEffect(() => {
    setVisiveis(LIMITE)
  }, [busca, status])

  const itens = useMemo(() => todas.slice(0, visiveis), [todas, visiveis])
  const hasMore = visiveis < todas.length

  /** Mostra mais LIMITE itens, se ainda houver itens escondidos */
  const loadMore = useCallback(() => {
    if (hasMore) setVisiveis(atual => atual + LIMITE)
  }, [hasMore])

  /** Diz se a expedição tem alterações locais ainda não enviadas ao servidor */
  const syncStatusDe = useCallback(
    (expedicaoId: number): SyncStatus => (
      query.data ? statusDaExpedicao(query.data.pendencias, expedicaoId) : 'synced'
    ),
    [query.data],
  )

  const { refresh: reler } = query
  /** Baixa os dados mais recentes do servidor, volta ao início da lista e relê o cache */
  const refresh = useCallback(async () => {
    await baixar()
    setVisiveis(LIMITE)
    return reler()
  }, [baixar, reler])

  return {
    itens,
    total: todas.length,
    error: query.error,
    loading: query.loading,
    loadingMore: false,
    hasMore,
    loadMore,
    refresh,
    syncStatusDe,
  }
}
