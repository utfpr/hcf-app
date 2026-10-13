import { useCallback, useState } from 'react'
import { syncService } from '../SyncService'
import type { SyncResult } from '../types'

export function useSync() {
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncDate, setLastSyncDate] = useState<string | null>(() => syncService.obterUltimaSincronizacao())
  const [syncError, setSyncError] = useState<string | null>(null)
  const [syncSuccess, setSyncSuccess] = useState(false)

  const syncAll = useCallback(async (onRefreshRemote?: () => Promise<unknown>): Promise<SyncResult> => {
    setIsSyncing(true)
    setSyncError(null)
    setSyncSuccess(false)

    try {
      const result = await syncService.sincronizarGeral(onRefreshRemote)

      if (result.success) {
        setLastSyncDate(result.syncedAt ?? new Date().toISOString())
        setSyncSuccess(true)
      } else {
        setSyncError(result.message ?? 'Erro ao sincronizar dados.')
      }

      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha na sincronização dos dados.'
      setSyncError(message)
      return { success: false, message }
    } finally {
      setIsSyncing(false)
    }
  }, [])

  const lastSyncFormatted = syncService.formatarUltimaSincronizacao(lastSyncDate)

  return {
    isSyncing,
    lastSyncDate,
    lastSyncFormatted,
    syncError,
    syncSuccess,
    syncAll,
  }
}
