import { TipoUsuario } from '@/types/usuario'

import { podeRegistrarNaExpedicao } from './permissoes'

const expedicao = { participantes: [{ id: 7, nome: 'Ana' }, { id: 9, nome: 'Bruno' }] }

describe('podeRegistrarNaExpedicao', () => {
  it('permite ao expedicionário participante', () => {
    expect(podeRegistrarNaExpedicao({ id: 7, tipo_usuario_id: TipoUsuario.Expedicionario }, expedicao)).toBe(true)
  })

  it('bloqueia o expedicionário que não participa', () => {
    expect(podeRegistrarNaExpedicao({ id: 8, tipo_usuario_id: TipoUsuario.Expedicionario }, expedicao)).toBe(false)
  })

  it('bloqueia o expedicionário numa expedição sem equipe', () => {
    expect(podeRegistrarNaExpedicao({ id: 7, tipo_usuario_id: TipoUsuario.Expedicionario }, { participantes: [] })).toBe(false)
  })

  it.each([TipoUsuario.Curador, TipoUsuario.Operador, TipoUsuario.Identificador])(
    'não muda nada para o tipo %s, mesmo sem participar',
    tipo => {
      expect(podeRegistrarNaExpedicao({ id: 8, tipo_usuario_id: tipo }, expedicao)).toBe(true)
    },
  )

  it('sem usuário carregado, não bloqueia', () => {
    expect(podeRegistrarNaExpedicao(null, expedicao)).toBe(true)
  })
})
