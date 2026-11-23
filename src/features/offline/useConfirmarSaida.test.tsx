import React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import { usePreventRemove } from '@react-navigation/native'

import { type DialogoInput, FeedbackContext } from '@/components/feedback/FeedbackContext'

import { mensagemSaida, useConfirmarSaida } from './useConfirmarSaida'

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  usePreventRemove: jest.fn(),
  useNavigation: () => mockNavegacao,
}))

const mockNavegacao = { dispatch: jest.fn() }
const navegacao = mockNavegacao
const preventRemove = usePreventRemove as jest.Mock

function montar(opcoes: { pendente: boolean; anexos: number }) {
  const dialogo = jest.fn()
  const ref: { sair?: (acao: () => void) => void } = {}
  function Teste(props: { pendente: boolean; anexos: number }) {
    ref.sair = useConfirmarSaida(props).sair
    return null
  }
  let renderer!: ReactTestRenderer.ReactTestRenderer
  ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(
      <FeedbackContext.Provider value={{ toast: jest.fn(), dialogo }}>
        <Teste {...opcoes} />
      </FeedbackContext.Provider>,
    )
  })
  // Simula o usuário voltando (botão, gesto ou voltar do Android)
  const voltar = () => {
    const [, aoVoltar] = preventRemove.mock.calls.at(-1)
    ReactTestRenderer.act(() => aoVoltar({ data: { action: { type: 'GO_BACK' } } }))
    return dialogo.mock.calls.at(-1)?.[0] as DialogoInput
  }
  return { renderer, dialogo, voltar, sair: (acao: () => void) => ref.sair?.(acao) }
}

beforeEach(() => jest.clearAllMocks())

describe('mensagemSaida', () => {
  it('avisa que os anexos ficam guardados mas só entram na fila ao salvar', () => {
    expect(mensagemSaida(2)).toBe(
      'Os 2 anexos e o que você preencheu ficam guardados neste aparelho como rascunho. '
      + 'Eles só entram na fila de envio depois de salvar.',
    )
    expect(mensagemSaida(1)).toBe(
      'O anexo e o que você preencheu ficam guardados neste aparelho como rascunho. '
      + 'Eles só entram na fila de envio depois de salvar.',
    )
    expect(mensagemSaida(0)).toBe(
      'O que você preencheu fica guardado neste aparelho como rascunho e volta quando você abrir o formulário de novo.',
    )
  })
})

describe('useConfirmarSaida', () => {
  it('formulário vazio sai sem perguntar', () => {
    montar({ pendente: false, anexos: 0 })

    expect(preventRemove.mock.calls.at(-1)[0]).toBe(false)
  })

  it('com algo preenchido pergunta antes de sair', () => {
    const { voltar } = montar({ pendente: true, anexos: 2 })

    expect(preventRemove.mock.calls.at(-1)[0]).toBe(true)
    const dialogo = voltar()
    expect(dialogo.titulo).toBe('Sair sem salvar?')
    expect(dialogo.mensagem).toBe(mensagemSaida(2))
    expect(dialogo.acoes.map(acao => acao.texto)).toEqual(['Sair', 'Continuar editando'])
  })

  it('"Sair" completa a volta que foi interrompida', () => {
    const { voltar } = montar({ pendente: true, anexos: 1 })

    voltar().acoes.find(acao => acao.texto === 'Sair')?.aoPressionar?.()

    expect(navegacao.dispatch).toHaveBeenCalledWith({ type: 'GO_BACK' })
  })

  it('"Continuar editando" fica no formulário', () => {
    const { voltar } = montar({ pendente: true, anexos: 1 })

    const continuar = voltar().acoes.find(acao => acao.texto === 'Continuar editando')
    continuar?.aoPressionar?.()

    expect(continuar?.estilo).toBe('cancelar')
    expect(navegacao.dispatch).not.toHaveBeenCalled()
  })

  it('depois de salvar, sai sem perguntar', () => {
    const { sair } = montar({ pendente: true, anexos: 1 })
    const acao = jest.fn()

    ReactTestRenderer.act(() => sair(acao))

    expect(preventRemove.mock.calls.at(-1)[0]).toBe(false)
    expect(acao).toHaveBeenCalledTimes(1)
  })
})
