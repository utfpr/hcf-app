import React from 'react'
import { Modal, Platform, Text, TouchableOpacity } from 'react-native'
import ReactTestRenderer from 'react-test-renderer'

import { type FeedbackContextValue, useFeedback } from './FeedbackContext'
import { FeedbackProvider } from './FeedbackProvider'

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 24, bottom: 0, left: 0, right: 0 }),
}))

// No iOS a ação só roda quando o Modal termina de fechar (onDismiss)
function terminarDeFechar(renderer: ReactTestRenderer.ReactTestRenderer) {
  if (Platform.OS === 'ios') ReactTestRenderer.act(() => renderer.root.findByType(Modal).props.onDismiss())
}

function renderizar() {
  const feedback: { atual?: FeedbackContextValue } = {}
  function Captura() {
    feedback.atual = useFeedback()
    return null
  }
  let renderer!: ReactTestRenderer.ReactTestRenderer
  ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<FeedbackProvider><Captura /></FeedbackProvider>)
  })
  const textos = () => renderer.root.findAllByType(Text).map(node => [node.props.children].flat().join(''))
  return { feedback: feedback.atual!, renderer, textos }
}

describe('FeedbackProvider', () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => jest.useRealTimers())

  it('mostra o toast e o esconde sozinho depois do tempo', () => {
    const { feedback, textos } = renderizar()

    ReactTestRenderer.act(() => {
      feedback.toast({ tipo: 'sucesso', titulo: 'Coleta salva', mensagem: 'Salvo no aparelho.' })
    })
    expect(textos()).toEqual(expect.arrayContaining(['Coleta salva', 'Salvo no aparelho.']))

    ReactTestRenderer.act(() => {
      jest.advanceTimersByTime(3500 + 500)
    })
    expect(textos()).not.toContain('Coleta salva')
  })

  it('um toast novo substitui o anterior', () => {
    const { feedback, textos } = renderizar()

    ReactTestRenderer.act(() => {
      feedback.toast({ titulo: 'Primeiro' })
      feedback.toast({ tipo: 'erro', titulo: 'Segundo' })
    })

    expect(textos()).toContain('Segundo')
    expect(textos()).not.toContain('Primeiro')
  })

  it('o diálogo chama a ação escolhida e fecha', () => {
    const { feedback, renderer, textos } = renderizar()
    const sair = jest.fn()

    ReactTestRenderer.act(() => {
      feedback.dialogo({
        titulo: 'Sair do app',
        acoes: [{ texto: 'Sair', estilo: 'destrutivo', aoPressionar: sair }, { texto: 'Cancelar', estilo: 'cancelar' }],
      })
    })
    expect(renderer.root.findByType(Modal).props.visible).toBe(true)

    const botaoSair = renderer.root.findAllByType(TouchableOpacity)
      .find(botao => botao.findAllByType(Text).some(texto => texto.props.children === 'Sair'))!
    ReactTestRenderer.act(() => botaoSair.props.onPress())
    terminarDeFechar(renderer)

    expect(sair).toHaveBeenCalledTimes(1)
    expect(renderer.root.findByType(Modal).props.visible).toBe(false)
    expect(textos()).not.toContain('Sair do app')
  })

  it('o voltar do Android vale como Cancelar, e não fecha um diálogo sem essa opção', () => {
    const { feedback, renderer } = renderizar()
    const cancelar = jest.fn()

    ReactTestRenderer.act(() => {
      feedback.dialogo({ titulo: 'Com cancelar', acoes: [{ texto: 'Cancelar', estilo: 'cancelar', aoPressionar: cancelar }] })
    })
    ReactTestRenderer.act(() => renderer.root.findByType(Modal).props.onRequestClose())
    terminarDeFechar(renderer)
    expect(cancelar).toHaveBeenCalledTimes(1)
    expect(renderer.root.findByType(Modal).props.visible).toBe(false)

    ReactTestRenderer.act(() => {
      feedback.dialogo({ titulo: 'Sem cancelar', acoes: [{ texto: 'OK' }] })
    })
    ReactTestRenderer.act(() => renderer.root.findByType(Modal).props.onRequestClose())
    expect(renderer.root.findByType(Modal).props.visible).toBe(true)
  })
})
