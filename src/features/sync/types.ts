export type SyncStatus = 'synced' | 'pending' | 'syncing' | 'error'

export interface SyncResult {
  success: boolean
  message?: string
  syncedAt?: string
  itemsProcessed?: number
}

export interface SyncState {
  isSyncing: boolean
  lastSyncDate: string | null
  status: SyncStatus
  error: string | null
}
