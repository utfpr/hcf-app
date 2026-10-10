
import { useCallback, useEffect, useMemo, useState } from 'react'

import { useContainer } from '@/contexts/Container/useContainer'
import { useQuery } from '@/hooks/query/useQuery'

import { LembreteListService } from '../LembreteListService'
import type { FiltrosLembrete } from '../types'

export function useLembretes(filtros: FiltrosLembrete = {}) {
  const { httpClient } = useContainer()

  const service = useMemo(
    () => new LembreteListService(httpClient),
    [httpClient],
  )

  const filtersKey = JSON.stringify(filtros)
  const initialPage = filtros.pagina ?? 1

  const [page, setPage] = useState(initialPage)

  useEffect(() => {
    setPage(initialPage)
  }, [filtersKey, initialPage])

  const requestFilters = useMemo(
    () => ({
      ...JSON.parse(filtersKey) as FiltrosLembrete,
      pagina: page,
    }),
    [filtersKey, page],
  )

  const fetcher = useCallback(
    () => service.listar(requestFilters),
    [service, requestFilters],
  )

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
