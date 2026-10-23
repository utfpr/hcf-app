import { mesclarLembretes } from '@/features/offline/mesclagem'
import type { Pendencias } from '@/features/offline/types'

import type { Lembrete } from '../types'
import { filtrarLembretes } from './useLembretes'

function lembrete(id: number, expedicaoId: number | null, dataColeta = '2026-11-20'): Lembrete {
  return {
    id,
    expedicao_id: expedicaoId,
    data_coleta: dataColeta,
    local_coleta: `Local ${id}`,
    created_at: '2026-10-21T00:00:00.000Z',
    updated_at: '2026-10-21T00:00:00.000Z',
    created_by: 14,
    updated_by: 14,
  } as Lembrete
}

describe('filtrarLembretes por expedição', () => {
  it('mostra só os lembretes da expedição, deixando de fora os sem expedição', () => {
    const lembretes = [lembrete(1, 3), lembrete(2, 4), lembrete(3, null), lembrete(4, 3, '2026-11-01')]

    const daExpedicao3 = filtrarLembretes(lembretes, { expedicao_id: 3 })

    expect(daExpedicao3.map(l => l.id)).toEqual([4, 1])
  })

  it('sem o filtro, continua mostrando todos', () => {
    const lembretes = [lembrete(1, 3), lembrete(2, 4), lembrete(3, null)]

    expect(filtrarLembretes(lembretes, {})).toHaveLength(3)
  })

  it('um lembrete ainda não sincronizado já aparece na expedição de onde foi criado', () => {
    const pendencias: Pendencias = {
      proximo_seq: 2,
      eventos: [],
      midias: [],
      lembretes: [{
        local_id: '0bc61212-364c-4434-996e-a07cd06e35bf',
        seq: 1,
        status: 'pending',
        criado_em: '2026-10-21T10:00:00.000Z',
        payload: { data_coleta: '2026-11-12', local_coleta: 'Fazenda Aguiar', expedicao_id: 4 },
      }],
    }

    const todos = mesclarLembretes([lembrete(1, 3)], pendencias)

    expect(filtrarLembretes(todos, { expedicao_id: 4 }).map(l => l.local_coleta)).toEqual(['Fazenda Aguiar'])
    expect(filtrarLembretes(todos, { expedicao_id: 3 }).map(l => l.id)).toEqual([1])
  })
})
