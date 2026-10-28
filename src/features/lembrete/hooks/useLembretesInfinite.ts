import { useCallback, useEffect, useMemo, useState } from 'react'

import { mesclarLembretes } from '@/features/offline/mesclagem'
import { useOffline } from '@/features/offline/OfflineContext'
import { useQuery } from '@/hooks/query/useQuery'

import type { FiltrosLembrete } from '../types'
import { filtrarLembretes } from './useLembretes'

const LIMITE = 10

// Todos os lembretes salvos no aparelho (mais os pendentes de envio). A lista já está
// toda em memória: o "scroll infinito" só vai mostrando de LIMITE em LIMITE,
// como a lista de expedições.
export function useLembretesInfinite(filtros: Omit<FiltrosLembrete, 'limite' | 'pagina'> = {}) {
  const { store, baixar } = useOffline()
  const [visiveis, setVisiveis] = useState(LIMITE)
  const [puxando, setPuxando] = useState(false)
  const filtersKey = JSON.stringify(filtros)

  const fetcher = useCallback(
    async () => mesclarLembretes(await store.lerLembretes(), await store.pendencias()),
    [store],
  )

  // Prefixo 'lembretes': o useCriarLembrete revalida tudo o que começa assim
  const query = useQuery(fetcher, ['lembretes', 'infinite', store.usuarioId])

  const todos = useMemo(
    () => filtrarLembretes(query.data ?? [], JSON.parse(filtersKey) as FiltrosLembrete),
    [query.data, filtersKey],
  )

  // Filtro novo: volta para o começo da lista
  useEffect(() => {
    setVisiveis(LIMITE)
  }, [filtersKey])

  const itens = useMemo(() => todos.slice(0, visiveis), [todos, visiveis])
  const hasMore = visiveis < todos.length

  const loadMore = useCallback(() => {
    if (hasMore) setVisiveis(atual => atual + LIMITE)
  }, [hasMore])

  // Com conexão, traz o que mudou na API (e as telas releem sozinhas no fim da baixa);
  // sem conexão, só relê o aparelho
  const { refresh: reler } = query
  const refresh = useCallback(async () => {
    setPuxando(true)
    try {
      const resultado = await baixar()
      if (!resultado.success) await reler()
      setVisiveis(LIMITE)
    } finally {
      setPuxando(false)
    }
  }, [baixar, reler])

  return {
    itens,
    total: todos.length,
    error: query.error,
    loading: query.loading,
    refreshing: puxando,
    hasMore,
    loadMore,
    refresh,
  }
}
