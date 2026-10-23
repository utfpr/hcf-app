import { useCallback, useEffect } from 'react'

import { useContainer } from '@/contexts/Container/useContainer'
import type { SyncResult } from '@/features/sync/types'
import { useQuery } from '@/hooks/query/useQuery'
import { getUserFacingHttpError } from '@/libraries/http/httpError'
import { temInternet } from '@/libraries/network/conexao'

import { taxonomiaStore } from '../TaxonomiaStore'

function formatarData(iso: string | null): string | null {
  if (!iso) return null
  const data = new Date(iso)
  return Number.isNaN(data.getTime()) ? null : data.toLocaleDateString('pt-BR')
}

/** Dados taxonômicos guardados no aparelho e o botão "Importar" (API → app, não bloqueia logout) */
export function useTaxonomia() {
  const { httpClient } = useContainer()
  const query = useQuery(() => taxonomiaStore.lerFamilias(), ['taxonomia'])
  const { refresh } = query

  useEffect(() => taxonomiaStore.aoMudar(() => { refresh() }), [refresh])

  const importar = useCallback(async (): Promise<SyncResult> => {
    if (!(await temInternet())) {
      return { success: false, message: 'Sem conexão: conecte-se para importar os dados taxonômicos.' }
    }
    try {
      const cache = await taxonomiaStore.importar(httpClient)
      return { success: true, syncedAt: cache.atualizado_em ?? undefined, itemsProcessed: cache.itens.length }
    } catch (error) {
      return { success: false, message: getUserFacingHttpError(error, 'Não foi possível importar os dados taxonômicos.') }
    }
  }, [httpClient])

  return {
    total: query.data?.itens.length ?? 0,
    atualizadoEm: formatarData(query.data?.atualizado_em ?? null),
    importar,
  }
}
