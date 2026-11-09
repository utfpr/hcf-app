import { TipoUsuario } from '@/types/usuario'

import { podeRegistrarNaExpedicao } from './permissoes'

const expedicao = { participantes: [{ id: 7, nome: 'Ana' }, { id: 9, nome: 'Bruno' }] }

describe('podeRegistrarNaExpedicao', () => {
  it('permite ao expedicionário participante', () => {
    expect(podeRegistrarNaExpedicao({ id: 7, tipo_usuario_id: TipoUsuario.Expedicionario }, expedicao)).toBe(true)
  })

  it('compara ids que a API manda como string (bigint)', () => {
    const daApi = { participantes: [{ id: '15', nome: 'Exp' }] } as unknown as typeof expedicao
    const usuario = { id: 15, tipo_usuario_id: '4' } as unknown as Parameters<typeof podeRegistrarNaExpedicao>[0]
    expect(podeRegistrarNaExpedicao(usuario, daApi)).toBe(true)
    const usuarioString = { id: '15', tipo_usuario_id: 4 } as unknown as Parameters<typeof podeRegistrarNaExpedicao>[0]
    expect(podeRegistrarNaExpedicao(usuarioString, { participantes: [{ id: 15, nome: 'Exp' }] })).toBe(true)
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
