import { useCallback, useEffect, useState } from 'react'

import { mesclarLembretes } from '@/features/offline/mesclagem'
import { useOffline } from '@/features/offline/OfflineContext'
import { useQuery } from '@/hooks/query/useQuery'

import type { FiltrosLembrete, Lembrete, PaginacaoLembretes } from '../types'

const LIMITE_PADRAO = 20

// Mesmos filtros e ordem da API (/v1/lembretes), aplicados sobre os dados do aparelho
export function filtrarLembretes(lembretes: Lembrete[], filtros: FiltrosLembrete): Lembrete[] {
  const [coluna, direcao] = (filtros.order ?? 'data_coleta:asc').split(':') as ['id' | 'data_coleta', 'asc' | 'desc']
  const sinal = direcao === 'asc' ? 1 : -1

  return lembretes
    .filter(lembrete => !filtros.expedicao_id || lembrete.expedicao_id === filtros.expedicao_id)
    .filter(lembrete => !filtros.data_coleta_de || lembrete.data_coleta >= filtros.data_coleta_de)
    .filter(lembrete => !filtros.data_coleta_ate || lembrete.data_coleta <= filtros.data_coleta_ate)
    .sort((a, b) => {
      const comparacao = coluna === 'id'
        ? a.id - b.id
        : a.data_coleta.localeCompare(b.data_coleta) || a.id - b.id
      return comparacao * sinal
    })
}

function paginar(lembretes: Lembrete[], filtros: FiltrosLembrete, pagina: number): PaginacaoLembretes {
  const filtrados = filtrarLembretes(lembretes, filtros)
  const limite = filtros.limite && filtros.limite > 0 ? filtros.limite : LIMITE_PADRAO
  const inicio = (pagina - 1) * limite
  return {
    itens: filtrados.slice(inicio, inicio + limite),
    total: filtrados.length,
    limite,
    pagina,
  }
}

export function useLembretes(filtros: FiltrosLembrete = {}) {
  const { store } = useOffline()

  const filtersKey = JSON.stringify(filtros)
  const initialPage = filtros.pagina ?? 1

  const [page, setPage] = useState(initialPage)

  useEffect(() => {
    setPage(initialPage)
  }, [filtersKey, initialPage])

  const fetcher = useCallback(async () => {
    const lembretes = mesclarLembretes(await store.lerLembretes(), await store.pendencias())
    return paginar(lembretes, JSON.parse(filtersKey) as FiltrosLembrete, page)
  }, [store, filtersKey, page])

  const query = useQuery(
    fetcher,
    ['lembretes', filtersKey, page],
    { keepPreviousData: true },
  )

  const hasNextPage = Boolean(
    query.data &&
    query.data.pagina * query.data.limite < query.data.total,
  )

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setPage(current => current + 1)
    }
  }, [hasNextPage])

  const previousPage = useCallback(() => {
    setPage(current => Math.max(1, current - 1))
  }, [])

  return {
    ...query,
    page,
    hasNextPage,
    nextPage,
    previousPage,
  }
}
