import React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import { ExpeditionCard } from '../src/features/home/components/ExpeditionCard'
import { SyncStatusIndicator } from '../src/features/sync/components/SyncStatusIndicator'
import type { Expedition } from '../src/features/home/types'

describe('ExpeditionCard Sync Status', () => {
  const baseExpedition: Expedition = {
    id: 'exp-123',
    name: 'Expedição Mata Atlântica',
    date: '13/10/2026',
    location: 'Guaratuba – PR',
    status: 'Em andamento',
  }

  it('renders expedition with default sync status indicator', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(<ExpeditionCard expedition={baseExpedition} />)
    })

    const root = renderer!.root
    const indicator = root.findByType(SyncStatusIndicator)
    expect(indicator).toBeDefined()
    expect(indicator.props.status).toBe('synced')
    expect(indicator.props.testID).toBe('expedition-sync-exp-123')
  })

  it('renders expedition with pending sync status indicator', () => {
    const expedition: Expedition = {
      ...baseExpedition,
      syncStatus: 'pending',
    }

    let renderer: ReactTestRenderer.ReactTestRenderer | undefined
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(<ExpeditionCard expedition={expedition} />)
    })

    const root = renderer!.root
    const indicator = root.findByType(SyncStatusIndicator)
    expect(indicator.props.status).toBe('pending')
  })

  it('renders expedition with syncing status indicator', () => {
    const expedition: Expedition = {
      ...baseExpedition,
      syncStatus: 'syncing',
    }

    let renderer: ReactTestRenderer.ReactTestRenderer | undefined
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(<ExpeditionCard expedition={expedition} />)
    })

    const root = renderer!.root
    const indicator = root.findByType(SyncStatusIndicator)
    expect(indicator.props.status).toBe('syncing')
  })

  it('renders expedition with error sync status indicator', () => {
    const expedition: Expedition = {
      ...baseExpedition,
      syncStatus: 'error',
    }

    let renderer: ReactTestRenderer.ReactTestRenderer | undefined
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(<ExpeditionCard expedition={expedition} />)
    })

    const root = renderer!.root
    const indicator = root.findByType(SyncStatusIndicator)
    expect(indicator.props.status).toBe('error')
  })
})
