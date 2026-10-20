import type { CriarEvidenciaPayload } from '@/features/evento/types'
import { useOffline } from '@/features/offline/OfflineContext'
import { useMutation } from '@/hooks/query/useMutation'

import type { CriarLembretePayload } from '../types'

// Salva no aparelho; o lembrete e a mídia só sobem no "Sincronizar"
export function useCriarLembrete() {
  const { store } = useOffline()

  return useMutation(
    (payload: CriarLembretePayload, evidencias: CriarEvidenciaPayload[]) =>
      store.adicionarLembrete(payload, evidencias),
    ['lembretes'],
  )
}
