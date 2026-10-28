import { useOffline } from '@/features/offline/OfflineContext'
import { useMutation } from '@/hooks/query/useMutation'

import type { CriarEvidenciaPayload, RegistroExpedicao } from '../types'

// Salva no aparelho, ligada ao registro: pelo id da API se ele já subiu,
// ou pelo id local se ele também ainda está só no aparelho
export function useAdicionarEvidencias(expedicaoId: number | undefined) {
  const { store } = useOffline()

  return useMutation(
    (registro: RegistroExpedicao, evidencias: CriarEvidenciaPayload[]) =>
      store.adicionarMidias(
        registro.local_id && registro.id < 0
          ? { tipo: 'evento', expedicao_id: registro.expedicao_id, evento_local_id: registro.local_id }
          : { tipo: 'evento', expedicao_id: registro.expedicao_id, evento_id: registro.id },
        evidencias,
      ),
    expedicaoId ? ['eventos', expedicaoId] : null,
  )
}
