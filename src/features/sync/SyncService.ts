import type { SyncResult } from './types'

export class SyncService {
  private lastSyncDate: string | null = null

  /**
   * Executa a sincronização geral:
   * 1. Envia registros e evidências pendentes locais.
   * 2. Puxa todos os dados atualizados das expedições e eventos do servidor.
   */
  async sincronizarGeral(onRefreshRemote?: () => Promise<unknown>): Promise<SyncResult> {
    try {
      // 1. Envia pendências locais (aqui se integra à fila local quando houver)
      await this.enviarPendenciasLocais()

      // 2. Puxa os dados remotos atualizados da API
      if (onRefreshRemote) {
        await onRefreshRemote()
      }

      const now = new Date().toISOString()
      this.lastSyncDate = now

      return {
        success: true,
        message: 'Sincronização geral concluída com sucesso.',
        syncedAt: now,
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha na sincronização dos dados.'
      return {
        success: false,
        message,
      }
    }
  }

  /**
   * Envio simulado/preparado para itens offline em fila local.
   */
  async enviarPendenciasLocais(): Promise<{ enviados: number }> {
    // Espaço reservado para descarregar a fila de coletas/evidências offline
    return { enviados: 0 }
  }

  obterUltimaSincronizacao(): string | null {
    return this.lastSyncDate
  }

  definirUltimaSincronizacao(isoString: string): void {
    this.lastSyncDate = isoString
  }

  formatarUltimaSincronizacao(isoString: string | null = this.lastSyncDate): string {
    if (!isoString) return 'Nunca'

    const date = new Date(isoString)
    if (isNaN(date.getTime())) return 'Nunca'

    const dateStr = date.toLocaleDateString('pt-BR')
    const timeStr = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    return `${dateStr} às ${timeStr}`
  }
}

export const syncService = new SyncService()
