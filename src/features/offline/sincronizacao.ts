import type { ProgressoEnvio, ResultadoEnvio, SyncService } from '@/features/sync/SyncService'

import type { OfflineStore } from './OfflineStore'

export interface FiltroSincronizacao {
  // Só o que é dessa expedição
  expedicaoId?: number
  // Só envia; não baixa nada da API
  semBaixar?: boolean
}

export interface DependenciasSincronizacao {
  sync: Pick<SyncService, 'enviar' | 'baixar' | 'limparEnviados'>
  store: Pick<OfflineStore, 'atualizarMeta' | 'avisarMudanca'>
  importarTaxonomia: () => Promise<void>
}

/**
 * Envia o que está no aparelho e baixa o que mudou na API. Tudo é gravado em
 * silêncio e as telas releem uma vez só, no fim (também se falhar no meio, para
 * mostrar o que chegou a subir). Avisar a cada gravação fazia a tela de detalhes
 * piscar: cada item enviado disparava duas releituras de todas as queries.
 */
export async function executarSincronizacao(
  { sync, store, importarTaxonomia }: DependenciasSincronizacao,
  filtro: FiltroSincronizacao,
  onProgresso: (progresso: ProgressoEnvio | null) => void,
): Promise<{ envio: ResultadoEnvio; agora: string }> {
  try {
    const envio = await sync.enviar({ expedicaoId: filtro.expedicaoId }, onProgresso)
    // Sem baixar, o que subiu fica marcado como enviado (✓) até a próxima baixa
    if (!filtro.semBaixar) {
      await sync.baixar()
      await sync.limparEnviados()
      // "Sincronizar tudo": manda tudo e puxa tudo, inclusive a taxonomia
      if (filtro.expedicaoId === undefined) await importarTaxonomia()
    }

    const agora = new Date().toISOString()
    await store.atualizarMeta({ ultima_sincronizacao: agora }, { silencioso: true })
    return { envio, agora }
  } finally {
    onProgresso(null)
    store.avisarMudanca()
  }
}
