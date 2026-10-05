import { useMemo } from 'react'

import { useContainer } from '@/contexts/Container/useContainer'
import { useMutation } from '@/hooks/query/useMutation'

import { EventoService } from '../EventoService'
import type { CriarEvidenciaPayload } from '../types'

export function useAdicionarEvidencias(expedicaoId: number | undefined) {
  const { httpClient } = useContainer()
  const service = useMemo(() => new EventoService(httpClient), [httpClient])

    return useMutation(
    ( eventoId: number,
      evidencias: CriarEvidenciaPayload[],
      onEnviada?: (indice: number) => void,
    ) => service.adicionarEvidencias(eventoId, evidencias, onEnviada),
    expedicaoId ? ['eventos', expedicaoId] : null,
    { revalidate: expedicaoId ? [['eventos', expedicaoId]] : [] },
  )
}