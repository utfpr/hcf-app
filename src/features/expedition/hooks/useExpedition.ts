import { useCallback, useMemo } from 'react'

import { useContainer } from '@/contexts/Container/useContainer'
import { useOffline } from '@/features/offline/OfflineContext'
import { useQuery } from '@/hooks/query/useQuery'
import { temInternet } from '@/libraries/network/conexao'

import { ExpedicaoService } from '../ExpedicaoService'

// Lê do aparelho. Expedição que ainda não foi baixada (ex.: de que o usuário não
// participa) é buscada na API quando há conexão, e fica salva para o offline.
export function useExpedition(expedicaoId: number | undefined) {
  const { httpClient } = useContainer()
  const { store } = useOffline()
  const service = useMemo(() => new ExpedicaoService(httpClient), [httpClient])

  const fetcher = useCallback(async () => {
    const id = expedicaoId as number
    const salva = await store.lerDetalhe(id)
    if (salva || !(await temInternet())) return salva

    const detalhe = await service.buscarPorId(id)
    await store.gravarDetalhe(detalhe)
    return detalhe
  }, [expedicaoId, service, store])

  return useQuery(
    fetcher,
    expedicaoId ? ['expedition', expedicaoId] : null,
  )
}
