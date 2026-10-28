import React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import { SWRConfig } from 'swr'

import type { FiltrosLembrete, Lembrete } from '../types'
import { useLembretesInfinite } from './useLembretesInfinite'

// 25 lembretes, um por dia a partir de 01/11/2026
const mockLembretes: Lembrete[] = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  data_coleta: `2026-11-${String(i + 1).padStart(2, '0')}`,
  local_coleta: `Local ${i + 1}`,
  created_at: '2026-10-01T00:00:00.000Z',
  updated_at: '2026-10-01T00:00:00.000Z',
  created_by: 14,
  updated_by: 14,
} as Lembrete))

const mockStore = {
  usuarioId: 14,
  lerLembretes: jest.fn(async () => mockLembretes),
  pendencias: jest.fn(async () => ({ proximo_seq: 1, eventos: [], midias: [], lembretes: [] })),
}

jest.mock('@/features/offline/OfflineContext', () => ({
  useOffline: () => ({ store: mockStore, baixar: jest.fn(async () => ({ success: true })) }),
}))

type Estado = ReturnType<typeof useLembretesInfinite>

function renderizar(filtros: FiltrosLembrete) {
  const estado: { atual?: Estado } = {}
  function Teste({ f }: { f: FiltrosLembrete }) {
    estado.atual = useLembretesInfinite(f)
    return null
  }
  const arvore = (f: FiltrosLembrete) => (
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
      <Teste f={f} />
    </SWRConfig>
  )

  let renderer!: ReactTestRenderer.ReactTestRenderer
  ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(arvore(filtros))
  })
  return {
    estado,
    trocarFiltros: (novos: FiltrosLembrete) => ReactTestRenderer.act(() => renderer.update(arvore(novos))),
  }
}

async function esperarCarregar() {
  await ReactTestRenderer.act(async () => {})
}

describe('useLembretesInfinite', () => {
  it('mostra de 10 em 10 até acabar', async () => {
    const { estado } = renderizar({ order: 'data_coleta:asc' })
    await esperarCarregar()

    expect(estado.atual!.itens).toHaveLength(10)
    expect(estado.atual!.total).toBe(25)
    expect(estado.atual!.hasMore).toBe(true)

    ReactTestRenderer.act(() => estado.atual!.loadMore())
    expect(estado.atual!.itens).toHaveLength(20)

    ReactTestRenderer.act(() => estado.atual!.loadMore())
    expect(estado.atual!.itens).toHaveLength(25)
    expect(estado.atual!.hasMore).toBe(false)
  })

  it('aplica filtro e ordem, e volta para o começo quando o filtro muda', async () => {
    const { estado, trocarFiltros } = renderizar({ order: 'data_coleta:asc' })
    await esperarCarregar()
    ReactTestRenderer.act(() => estado.atual!.loadMore())
    expect(estado.atual!.itens).toHaveLength(20)

    trocarFiltros({ order: 'data_coleta:desc', data_coleta_ate: '2026-11-12' })

    expect(estado.atual!.total).toBe(12)
    expect(estado.atual!.itens.map(l => l.id)).toEqual([12, 11, 10, 9, 8, 7, 6, 5, 4, 3])
  })
})
