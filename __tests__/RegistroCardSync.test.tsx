import React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import { RegistroCard } from '../src/features/expeditionDetail/components/RegistroCard'
import { SyncStatusIndicator } from '../src/features/sync/components/SyncStatusIndicator'
import type { RegistroExpedicao } from '../src/features/evento/types'

describe('RegistroCard Sync Status', () => {
  const baseRegistro: RegistroExpedicao = {
    id: 42,
    expedicao_id: 10,
    tipo: 'COLETA',
    data_captura: '2026-10-13T10:00:00.000Z',
    latitude: -24.04,
    longitude: -52.38,
    altitude: 600,
    observacoes: 'Coleta em mata ciliar',
    coleta: {
      familia: 'Myrtaceae',
      nome_cientifico: 'Eugenia uniflora',
      nome_popular: 'Pitanga',
      municipio: 'Campo Mourão',
      estado: 'PR',
      referencia_local: null,
      tipo_vegetacao: null,
      solo: null,
      relevo: null,
      substrato: null,
      tronco_com_casca: null,
      associacoes: null,
      folhas: null,
      habito: null,
      frutos: null,
      flores: null,
      luminosidade: null,
    },
    evidencias: [],
    created_at: '2026-10-13T10:00:00.000Z',
    updated_at: '2026-10-13T10:00:00.000Z',
    created_by: 1,
    updated_by: null,
  }

  const noop = () => {}

  it('renders default sync status indicator as synced on RegistroCard', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <RegistroCard
          registro={baseRegistro}
          onOpenEvidencia={noop}
          onAddEvidencia={noop}
          audioAtivoId={null}
          onActivateAudio={noop}
        />
      )
    })

    const root = renderer!.root
    const indicator = root.findByType(SyncStatusIndicator)
    expect(indicator).toBeDefined()
    expect(indicator.props.status).toBe('synced')
    expect(indicator.props.testID).toBe('registro-sync-42')
  })

  it('renders pending sync status on RegistroCard', () => {
    const registro: RegistroExpedicao = {
      ...baseRegistro,
      syncStatus: 'pending',
    }

    let renderer: ReactTestRenderer.ReactTestRenderer | undefined
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <RegistroCard
          registro={registro}
          onOpenEvidencia={noop}
          onAddEvidencia={noop}
          audioAtivoId={null}
          onActivateAudio={noop}
        />
      )
    })

    const root = renderer!.root
    const indicator = root.findByType(SyncStatusIndicator)
    expect(indicator.props.status).toBe('pending')
  })

  it('renders syncing status on RegistroCard', () => {
    const registro: RegistroExpedicao = {
      ...baseRegistro,
      syncStatus: 'syncing',
    }

    let renderer: ReactTestRenderer.ReactTestRenderer | undefined
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <RegistroCard
          registro={registro}
          onOpenEvidencia={noop}
          onAddEvidencia={noop}
          audioAtivoId={null}
          onActivateAudio={noop}
        />
      )
    })

    const root = renderer!.root
    const indicator = root.findByType(SyncStatusIndicator)
    expect(indicator.props.status).toBe('syncing')
  })

  it('renders error sync status on RegistroCard for DIARIO type', () => {
    const registro: RegistroExpedicao = {
      ...baseRegistro,
      id: 99,
      tipo: 'DIARIO',
      coleta: null,
      syncStatus: 'error',
    }

    let renderer: ReactTestRenderer.ReactTestRenderer | undefined
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <RegistroCard
          registro={registro}
          onOpenEvidencia={noop}
          onAddEvidencia={noop}
          audioAtivoId={null}
          onActivateAudio={noop}
        />
      )
    })

    const root = renderer!.root
    const indicator = root.findByType(SyncStatusIndicator)
    expect(indicator.props.status).toBe('error')
    expect(indicator.props.testID).toBe('registro-sync-99')
  })
})
