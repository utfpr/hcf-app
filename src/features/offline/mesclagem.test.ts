import type { RegistroExpedicao } from '@/features/evento/types'

import { proximoNumeroColeta } from './mesclagem'

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
