import { useCallback, useMemo } from 'react'

import { useContainer } from '@/contexts/Container/useContainer'
import { useQuery } from '@/hooks/query/useQuery'

import { ExpedicaoService } from '../ExpedicaoService'

export function useExpedition(expedicaoId: number | undefined) {
  const { httpClient } = useContainer()
  const service = useMemo(() => new ExpedicaoService(httpClient), [httpClient])

  const fetcher = useCallback(
    () => service.buscarPorId(expedicaoId as number),
    [expedicaoId, service],
  )

  return useQuery(
    fetcher,
    expedicaoId ? ['expedition', expedicaoId] : null,
  )
}
