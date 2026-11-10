import type { RegistroExpedicao } from '@/features/evento/types'

import { mesclarRegistros, proximoNumeroColeta } from './mesclagem'
import type { Pendencias } from './types'

function registro(tipo: 'COLETA' | 'DIARIO', numero_coleta: string | null): RegistroExpedicao {
  return { tipo, numero_coleta } as RegistroExpedicao
}

describe('proximoNumeroColeta', () => {
  it('começa em 1 numa expedição sem coletas', () => {
    expect(proximoNumeroColeta([])).toBe('1')
  })

  it('segue a partir do maior número de coleta da expedição', () => {
    const registros = [registro('COLETA', '1'), registro('COLETA', '3'), registro('COLETA', '2')]

    expect(proximoNumeroColeta(registros)).toBe('4')
  })

  it('ignora diários e números que não são inteiros', () => {
    const registros = [registro('DIARIO', null), registro('COLETA', '2'), registro('COLETA', '12A'), registro('COLETA', null)]

    expect(proximoNumeroColeta(registros)).toBe('3')
  })
})

describe('mesclarRegistros', () => {
  it('mostra a altura, o exsudado e as cores das flores de uma coleta que ainda está no aparelho', () => {
    const pendencias: Pendencias = {
      proximo_seq: 2,
      eventos: [{
        local_id: 'evt-local',
        seq: 1,
        status: 'pending',
        criado_em: '2026-11-07T12:00:00.000Z',
        expedicao_id: 4,
        payload: {
          tipo: 'COLETA',
          data_captura: '2026-11-07T12:00:00.000Z',
          numero_coleta: '1',
          coleta: { habito: 'Árvore', altura: '8 m', exsudado: 'Látex branco', flores_cor_calice: 'Verde', flores_cor_corola: 'Lilás' },
        },
      }],
      midias: [],
      lembretes: [],
    }

    const [coleta] = mesclarRegistros([], pendencias, 4)

    expect(coleta.coleta).toMatchObject({
      habito: 'Árvore',
      altura: '8 m',
      exsudado: 'Látex branco',
      flores_cor_calice: 'Verde',
      flores_cor_corola: 'Lilás',
      luminosidade: null,
    })
  })
})
