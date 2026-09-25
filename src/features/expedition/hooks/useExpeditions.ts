import { useCallback, useEffect, useMemo, useState } from 'react'

import { useContainer } from '@/contexts/Container/useContainer'
import { useQuery } from '@/hooks/query/useQuery'

import { ExpedicaoService } from '../ExpedicaoService'
import type { FiltrosExpedicao } from '../types'

function serializeFilters(filters: FiltrosExpedicao): string {
  const { pagina: _pagina, ...filtersWithoutPage } = filters
  return JSON.stringify(filtersWithoutPage)
}

export function useExpeditions(filters: FiltrosExpedicao = {}) {
  const { httpClient } = useContainer()
  const service = useMemo(() => new ExpedicaoService(httpClient), [httpClient])
  const filtersKey = serializeFilters(filters)
  const initialPage = filters.pagina ?? 1
  const [page, setPage] = useState(initialPage)

  useEffect(() => {
    setPage(initialPage)
  }, [filtersKey, initialPage])

  const requestFilters = useMemo(
    () => ({ ...filters, pagina: page }),
    [filters, page],
  )

  const fetcher = useCallback(
    () => service.listar(requestFilters),
    [requestFilters, service],
  )

  const query = useQuery(fetcher, ['expeditions', filtersKey, page], {
    keepPreviousData: true,
  })

  const hasNextPage = Boolean(
    query.data && query.data.pagina * query.data.limite < query.data.total,
  )

  const nextPage = useCallback(() => {
    if (hasNextPage) setPage(currentPage => currentPage + 1)
  }, [hasNextPage])

  const previousPage = useCallback(() => {
    setPage(currentPage => Math.max(1, currentPage - 1))
  }, [])

  return {
    ...query,
    page,
    hasNextPage,
    nextPage,
    previousPage,
  }
}
