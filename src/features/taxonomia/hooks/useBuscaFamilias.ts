import { useCallback, useMemo } from 'react'

import { useContainer } from '@/contexts/Container/useContainer'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useQuery } from '@/hooks/query/useQuery'

import { FamiliaService } from '../FamiliaService'

export const MIN_CARACTERES_BUSCA = 2
const ESPERA_DIGITACAO_MS = 300

/** Famílias cujo nome contém o termo digitado; só busca depois que o usuário para de digitar */
export function useBuscaFamilias(termo: string) {
  const { httpClient } = useContainer()
  const service = useMemo(() => new FamiliaService(httpClient), [httpClient])

  const termoLimpo = termo.trim()
  const busca = useDebouncedValue(termoLimpo, ESPERA_DIGITACAO_MS)
  const ativa = busca.length >= MIN_CARACTERES_BUSCA

  const fetcher = useCallback(() => service.buscar(busca), [service, busca])
  const query = useQuery(fetcher, ativa ? ['familias', busca] : null)

  return {
    ...query,
    ativa,
    // Ainda digitando: o resultado na tela é de um termo anterior
    aguardando: termoLimpo !== busca,
  }
}
