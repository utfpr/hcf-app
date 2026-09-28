import { useMemo } from 'react'

import { useContainer } from '@/contexts/Container/useContainer'
import { useMutation } from '@/hooks/query/useMutation'

import { EventoService } from '../EventoService'
import type { CriarEventoPayload, CriarEvidenciaPayload } from '../types'

export function useRegistrarEvento(expedicaoId: number | undefined) {
  const { httpClient } = useContainer()
  const service = useMemo(() => new EventoService(httpClient), [httpClient])

  return useMutation(
    (payload: CriarEventoPayload, evidencias: CriarEvidenciaPayload[]) =>
      service.registrar(expedicaoId as number, payload, evidencias),
    expedicaoId ? ['eventos', expedicaoId] : null,
    // Atualiza as telas que listarem os eventos da expedição.
    { revalidate: expedicaoId ? [['eventos', expedicaoId]] : [] },
  )
}
