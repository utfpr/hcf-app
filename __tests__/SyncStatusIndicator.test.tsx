import React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import { SyncStatusIndicator } from '../src/features/sync/components/SyncStatusIndicator'
import type { SyncStatus } from '../src/features/sync/types'

describe('SyncStatusIndicator', () => {
  it('renders default status as synced', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(<SyncStatusIndicator />)
    })

    const root = renderer!.root
    const indicator = root.findByProps({ testID: 'sync-status-indicator' })
    expect(indicator).toBeDefined()
    expect(indicator.props.accessibilityLabel).toBe('Status de sincronização: Sincronizado')
  })

  const statuses: { status: SyncStatus; label: string }[] = [
    { status: 'synced', label: 'Sincronizado' },
    { status: 'pending', label: 'Pendente' },
    { status: 'syncing', label: 'Sincronizando' },
    { status: 'error', label: 'Erro' },
  ]

  statuses.forEach(({ status, label }) => {
    it(`renders correct accessibilityLabel for status "${status}"`, () => {
      let renderer: ReactTestRenderer.ReactTestRenderer | undefined
      ReactTestRenderer.act(() => {
        renderer = ReactTestRenderer.create(<SyncStatusIndicator status={status} />)
      })

      const root = renderer!.root
      const indicator = root.findByProps({ testID: 'sync-status-indicator' })
      expect(indicator.props.accessibilityLabel).toBe(`Status de sincronização: ${label}`)
    })
  })

  it('renders text label when showLabel is true', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <SyncStatusIndicator status="pending" showLabel={true} />
      )
    })

    const root = renderer!.root
    expect(root.findByProps({ children: 'Pendente' })).toBeDefined()
  })

  it('does not render text label when showLabel is false', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <SyncStatusIndicator status="synced" showLabel={false} />
      )
    })

    const root = renderer!.root
    expect(() => root.findByProps({ children: 'Sincronizado' })).toThrow()
  })

  it('supports custom testID', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <SyncStatusIndicator status="error" testID="custom-sync-id" />
      )
    })

    const root = renderer!.root
    expect(root.findByProps({ testID: 'custom-sync-id' })).toBeDefined()
  })
})
