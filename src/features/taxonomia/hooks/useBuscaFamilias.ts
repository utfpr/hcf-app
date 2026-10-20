import { useCallback, useMemo } from 'react'

import { useContainer } from '@/contexts/Container/useContainer'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useQuery } from '@/hooks/query/useQuery'
import { temInternet } from '@/libraries/network/conexao'

import { FamiliaService, LIMITE_SUGESTOES } from '../FamiliaService'
import { buscarFamilias, taxonomiaStore } from '../TaxonomiaStore'

export const MIN_CARACTERES_BUSCA = 2
const ESPERA_DIGITACAO_MS = 300

/**
 * Famílias cujo nome contém o termo digitado; só busca depois que o usuário para de digitar.
 * Busca nas famílias importadas para o aparelho; se ainda não foram importadas, cai para a API.
 */
export function useBuscaFamilias(termo: string) {
  const { httpClient } = useContainer()
  const service = useMemo(() => new FamiliaService(httpClient), [httpClient])

  const termoLimpo = termo.trim()
  const busca = useDebouncedValue(termoLimpo, ESPERA_DIGITACAO_MS)
  const ativa = busca.length >= MIN_CARACTERES_BUSCA

  const fetcher = useCallback(async () => {
    const { itens } = await taxonomiaStore.lerFamilias()
    if (itens.length > 0) return buscarFamilias(itens, busca, LIMITE_SUGESTOES)
    if (await temInternet()) return service.buscar(busca)
    return []
  }, [service, busca])

  const query = useQuery(fetcher, ativa ? ['familias', busca] : null)

  return {
    ...query,
    ativa,
    // Ainda digitando: o resultado na tela é de um termo anterior
    aguardando: termoLimpo !== busca,
  }
}
