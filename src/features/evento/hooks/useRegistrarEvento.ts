import { useOffline } from '@/features/offline/OfflineContext'
import { useMutation } from '@/hooks/query/useMutation'

import type { CriarEventoPayload, CriarEvidenciaPayload } from '../types'

// Salva no aparelho; a coleta/diário só sobe para a API no "Sincronizar"
export function useRegistrarEvento(expedicaoId: number | undefined) {
  const { store } = useOffline()

  return useMutation(
    (payload: CriarEventoPayload, evidencias: CriarEvidenciaPayload[]) =>
      store.adicionarEvento(expedicaoId as number, payload, evidencias),
    expedicaoId ? ['eventos', expedicaoId] : null,
  )
}
