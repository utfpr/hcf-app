import { useCallback, useMemo } from 'react'

import { useContainer } from '@/contexts/Container/useContainer'
import { useQuery } from '@/hooks/query/useQuery'

import { EventoService } from '../EventoService'

// Usa a mesma chave que o useRegistrarEvento revalida, então a lista
// se atualiza sozinha depois que uma coleta ou diário é salvo.
export function useRegistrosExpedicao(expedicaoId: number | undefined) {
  const { httpClient } = useContainer()
  const service = useMemo(() => new EventoService(httpClient), [httpClient])

  const fetcher = useCallback(
    () => service.listarRegistros(expedicaoId as number),
    [expedicaoId, service],
  )

  return useQuery(fetcher, expedicaoId ? ['eventos', expedicaoId] : null)
}
