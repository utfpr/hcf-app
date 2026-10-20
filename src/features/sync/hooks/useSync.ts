import { useCallback } from 'react'

import { useOffline } from '@/features/offline/OfflineContext'

import type { SyncResult } from '../types'

export function formatarUltimaSincronizacao(isoString: string | null | undefined): string {
  if (!isoString) return 'Nunca'

  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return 'Nunca'

  const dateStr = date.toLocaleDateString('pt-BR')
  const timeStr = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  return `${dateStr} às ${timeStr}`
}

/** Botões de sincronizar: envia o que está no aparelho e baixa o que mudou na API */
export function useSync() {
  const { sincronizar, sincronizando, meta, pendentes } = useOffline()

  const syncAll = useCallback(
    (): Promise<SyncResult> => sincronizar(),
    [sincronizar],
  )

  const lastSyncDate = meta?.ultima_sincronizacao ?? null

  return {
    isSyncing: sincronizando,
    lastSyncDate,
    lastSyncFormatted: formatarUltimaSincronizacao(lastSyncDate),
    pendentes,
    syncAll,
  }
}
