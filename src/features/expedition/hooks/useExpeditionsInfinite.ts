import { useCallback, useEffect, useMemo, useState } from 'react'

import { getStatus, toApiDate } from '@/features/home/mapExpeditions'
import type { ExpeditionStatus } from '@/features/home/types'
import { statusDaExpedicao } from '@/features/offline/mesclagem'
import { useOffline } from '@/features/offline/OfflineContext'
import type { SyncStatus } from '@/features/sync/types'
import { useQuery } from '@/hooks/query/useQuery'
import { contemTermo } from '@/libraries/text/normalizar'

const LIMITE = 10

export interface FiltroExpedicoes {
  // Trecho do nome ou da cidade
  busca?: string
  status?: ExpeditionStatus | null
}

// Todas as expedições salvas no aparelho, mais recentes primeiro. A lista já está
// toda em memória: o "scroll infinito" só vai mostrando de LIMITE em LIMITE.
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

  const loadMore = useCallback(() => {
    if (hasMore) setVisiveis(atual => atual + LIMITE)
  }, [hasMore])

  const syncStatusDe = useCallback(
    (expedicaoId: number): SyncStatus => (
      query.data ? statusDaExpedicao(query.data.pendencias, expedicaoId) : 'synced'
    ),
    [query.data],
  )

  const { refresh: reler } = query
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
