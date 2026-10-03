import { useCallback, useMemo } from 'react'
import useSWRInfinite from 'swr/infinite'

import { useContainer } from '@/contexts/Container/useContainer'

import { ExpedicaoService } from '../ExpedicaoService'
import type { ExpedicaoListItem, OrdemExpedicao, Paginacao } from '../types'

const LIMITE = 10
const ORDEM: OrdemExpedicao = 'id:desc'

export function useExpeditionsInfinite() {
  const { httpClient } = useContainer()
  const service = useMemo(() => new ExpedicaoService(httpClient), [httpClient])

  const getKey = useCallback(
    (index: number, previous: Paginacao<ExpedicaoListItem> | null) => {
      if (previous && previous.itens.length === 0) return null
      if (previous && previous.pagina * previous.limite >= previous.total) return null
      return ['expeditions-infinite', index + 1, LIMITE, ORDEM] as const
    },
    [],
  )

  const fetcher = useCallback(
    ([, pagina, limite, order]: readonly [string, number, number, OrdemExpedicao]) =>
      service.listar({ pagina, limite, order }),
    [service],
  )

  const { data, error, isLoading, isValidating, size, setSize, mutate } =
    useSWRInfinite<Paginacao<ExpedicaoListItem>, Error>(getKey, fetcher, {
      revalidateFirstPage: false,
    })

  const itens = useMemo(() => data?.flatMap(p => p.itens) ?? [], [data])
  const total = data?.[0]?.total ?? 0
  const loadingMore = size > 0 && !!data && data[size - 1] === undefined
  const ultimaPagina = data?.[data.length - 1]

  const hasMore = ultimaPagina
    ? ultimaPagina.pagina * ultimaPagina.limite < ultimaPagina.total
    : false

      const loadMore = useCallback(() => {
      if (isValidating || !hasMore || loadingMore) return

      setSize(size + 1)
    }, [isValidating, hasMore, loadingMore, setSize, size])

  const refresh = useCallback(() => mutate(), [mutate])

  return { itens, total, error, loading: isLoading, loadingMore, hasMore, loadMore, refresh }
}