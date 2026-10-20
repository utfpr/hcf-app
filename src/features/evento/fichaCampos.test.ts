import type { RotaExpedicao } from '@/features/expedition/types'

import { municipioEEstadoDoLocal } from './fichaCampos'

const rotas: RotaExpedicao[] = [
  {
    cidade_id: 4104303,
    ordem: 0,
    nome_cidade: 'Campo Mourão',
    estado: '41',
    estado_nome: 'Paraná',
    estado_sigla: 'PR',
    locais_coleta: [{ id: 5, descricao: 'rio do Campo' }, { id: 6, descricao: 'Usina Mourão' }],
  },
  {
    cidade_id: 4118808,
    ordem: 1,
    nome_cidade: 'Peabiru',
    estado: '41',
    estado_nome: 'Paraná',
    estado_sigla: 'PR',
    locais_coleta: [{ id: 213, descricao: 'Chácara Santa Maria' }],
  },
]

describe('municipioEEstadoDoLocal', () => {
  it('usa a cidade e o estado da rota em que o local está', () => {
    expect(municipioEEstadoDoLocal(rotas, 6)).toEqual({ municipio: 'Campo Mourão', estado: 'Paraná' })
    expect(municipioEEstadoDoLocal(rotas, 213)).toEqual({ municipio: 'Peabiru', estado: 'Paraná' })
  })

  it('preenche só o município quando o detalhe salvo no aparelho não tem o nome do estado', () => {
    const antigas = rotas.map(({ estado_nome: _nome, estado_sigla: _sigla, ...rota }) => rota)

    expect(municipioEEstadoDoLocal(antigas, 213)).toEqual({ municipio: 'Peabiru' })
  })

  it('não muda nada para um local que não está nas rotas', () => {
    expect(municipioEEstadoDoLocal(rotas, 999)).toBeNull()
  })
})
