import { useMemo } from 'react'

import { useContainer } from '@/contexts/Container/useContainer'
import type { CriarEvidenciaPayload } from '@/features/evento/types'
import { useMutation } from '@/hooks/query/useMutation'

import { LembreteService } from '../LembreteService'
import type { CriarLembretePayload } from '../types'

export function useCriarLembrete() {
  const { httpClient } = useContainer()
  const service = useMemo(() => new LembreteService(httpClient), [httpClient])

  return useMutation(
    (payload: CriarLembretePayload, evidencias: CriarEvidenciaPayload[]) =>
      service.registrar(payload, evidencias),
    ['lembretes'],
    // Atualiza as telas que listarem os lembretes.
    { revalidate: [['lembretes']] },
  )
}
