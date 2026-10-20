import { useCallback, useMemo } from 'react'

import { useContainer } from '@/contexts/Container/useContainer'
import { mesclarRegistros } from '@/features/offline/mesclagem'
import { useOffline } from '@/features/offline/OfflineContext'
import { useQuery } from '@/hooks/query/useQuery'
import { temInternet } from '@/libraries/network/conexao'

import { EventoService } from '../EventoService'

// Registros salvos no aparelho (baixados da API + criados offline). Se a
// expedição nunca foi baixada e há conexão, busca na API e guarda.
export function useRegistrosExpedicao(expedicaoId: number | undefined) {
  const { httpClient } = useContainer()
  const { store } = useOffline()
  const service = useMemo(() => new EventoService(httpClient), [httpClient])

  const fetcher = useCallback(async () => {
    const id = expedicaoId as number
    let cache = await store.lerRegistros(id)
    if (!cache && (await temInternet())) {
      cache = await service.listarRegistros(id)
      await store.gravarRegistros(id, cache)
    }
    return mesclarRegistros(cache ?? [], await store.pendencias(), id)
  }, [expedicaoId, service, store])

  return useQuery(fetcher, expedicaoId ? ['eventos', expedicaoId] : null)
}
