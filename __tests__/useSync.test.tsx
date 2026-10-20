import React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import { useSync } from '../src/features/sync/hooks/useSync'
import { syncService } from '../src/features/sync/SyncService'

function HookTester({
  onHook,
}: {
  onHook: (hook: ReturnType<typeof useSync>) => void
}) {
  const hook = useSync()
  React.useEffect(() => {
    onHook(hook)
  }, [hook, onHook])
  return null
}

describe('useSync hook', () => {
  beforeEach(() => {
    syncService.definirUltimaSincronizacao('')
  })

  it('initializes with default state', () => {
    let hookState: ReturnType<typeof useSync> | undefined

    ReactTestRenderer.act(() => {
      ReactTestRenderer.create(
        <HookTester onHook={hook => { hookState = hook }} />
      )
    })

    expect(hookState).toBeDefined()
    expect(hookState!.isSyncing).toBe(false)
    expect(hookState!.syncError).toBeNull()
    expect(hookState!.syncSuccess).toBe(false)
    expect(hookState!.lastSyncFormatted).toBe('Nunca')
  })

  it('successfully triggers syncAll and updates state', async () => {
    let hookState: ReturnType<typeof useSync> | undefined
    const onRefreshMock = jest.fn().mockResolvedValue(undefined)

    ReactTestRenderer.act(() => {
      ReactTestRenderer.create(
        <HookTester onHook={hook => { hookState = hook }} />
      )
    })

    let result
    await ReactTestRenderer.act(async () => {
      result = await hookState!.syncAll(onRefreshMock)
    })

    expect(result?.success).toBe(true)
    expect(hookState!.isSyncing).toBe(false)
    expect(hookState!.syncSuccess).toBe(true)
    expect(hookState!.syncError).toBeNull()
    expect(hookState!.lastSyncDate).toBeDefined()
    expect(hookState!.lastSyncFormatted).not.toBe('Nunca')
    expect(onRefreshMock).toHaveBeenCalledTimes(1)
  })

  it('handles error in syncAll and sets syncError', async () => {
    let hookState: ReturnType<typeof useSync> | undefined
    const onRefreshMock = jest.fn().mockRejectedValue(new Error('Erro de conexão'))

    ReactTestRenderer.act(() => {
      ReactTestRenderer.create(
        <HookTester onHook={hook => { hookState = hook }} />
      )
    })

    let result
    await ReactTestRenderer.act(async () => {
      result = await hookState!.syncAll(onRefreshMock)
    })

    expect(result?.success).toBe(false)
    expect(hookState!.isSyncing).toBe(false)
    expect(hookState!.syncSuccess).toBe(false)
    expect(hookState!.syncError).toBe('Erro de conexão')
  })
})
