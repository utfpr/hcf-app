import { useCallback, useMemo, useState } from 'react'

import { statusDaExpedicao } from '@/features/offline/mesclagem'
import { useOffline } from '@/features/offline/OfflineContext'
import type { SyncStatus } from '@/features/sync/types'
import { useQuery } from '@/hooks/query/useQuery'

const LIMITE = 10

// Todas as expedições salvas no aparelho, mais recentes primeiro. A lista já está
// toda em memória: o "scroll infinito" só vai mostrando de LIMITE em LIMITE.
export function useExpeditionsInfinite() {
  const { store, baixar } = useOffline()
  const [visiveis, setVisiveis] = useState(LIMITE)

  const fetcher = useCallback(async () => {
    const [cache, pendencias] = await Promise.all([store.lerExpedicoes(), store.pendencias()])
    return {
      itens: [...cache.itens].sort((a, b) => b.id - a.id),
      pendencias,
    }
  }, [store])

  const query = useQuery(fetcher, ['expeditions-infinite', store.usuarioId])
  const todas = useMemo(() => query.data?.itens ?? [], [query.data])
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
