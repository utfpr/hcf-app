import { useMemo } from 'react'

import { useContainer } from '@/contexts/Container/useContainer'
import { useQuery } from '@/hooks/query/useQuery'

import { LembreteService } from '../LembreteService'
import type { Lembrete } from '../types'

export function useLembretes() {
  const { httpClient } = useContainer()
  const service = useMemo(() => new LembreteService(httpClient), [httpClient])

  return useQuery(
    () => service.listar(),
    ['lembretes'],
  )
}