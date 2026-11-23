import React from 'react'
import { Keyboard, Platform, StyleSheet, Text } from 'react-native'
import ReactTestRenderer from 'react-test-renderer'

import type { EvidenciaPendente, MultimidiaState } from '../hooks/useMultimidia'

import { RodapeAcoes } from './RodapeAcoes'

function pendente(n: number): EvidenciaPendente {
  return {
    id: `foto-${n}`,
    tipo: 'imagem',
    detalhe: '1 MB',
    payload: {
      nome: `foto-${n}.jpg`,
      data_captura: '2026-11-16T10:00:00.000Z',
      arquivo: { uri: `file:///foto-${n}.jpg`, name: `foto-${n}.jpg`, type: 'image/jpeg' },
    },
  }
}

function estado(parcial: Partial<MultimidiaState> = {}): MultimidiaState {
  return {
    pendentes: [],
    setPendentes: jest.fn(),
    error: null,
    setError: jest.fn(),
    isRecording: false,
    recordTime: '00:12',
    isCapturing: false,
    playingId: null,
    busy: false,
    abrirCamera: jest.fn(),
    capturarFoto: jest.fn(),
    capturarVideo: jest.fn(),
    upload: jest.fn(),
    alternarGravacao: jest.fn(),
    alternarReproducao: jest.fn(),
    remover: jest.fn(),
    validarDuracaoVideo: jest.fn(),
    rejeitarVideoSemDuracao: jest.fn(),
    ...parcial,
  } as unknown as MultimidiaState
}

const ouvintes: Record<string, (evento?: unknown) => void> = {}
// Desmontar para a animação do aviso de gravação parar e o Jest encerrar
const montados: ReactTestRenderer.ReactTestRenderer[] = []
const plataformaOriginal = Platform.OS

beforeEach(() => {
  jest.spyOn(Keyboard, 'addListener').mockImplementation(((evento: string, ouvinte: (e?: unknown) => void) => {
    ouvintes[evento] = ouvinte
    return { remove: jest.fn() }
  }) as unknown as typeof Keyboard.addListener)
})

afterEach(() => {
  ReactTestRenderer.act(() => montados.splice(0).forEach(renderer => renderer.unmount()))
  jest.restoreAllMocks()
  Platform.OS = plataformaOriginal
})

function render(multimidia: MultimidiaState) {
  let renderer!: ReactTestRenderer.ReactTestRenderer
  ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(
      <RodapeAcoes multimidia={multimidia} saveLabel="Salvar Coleta" salvando={false} saveDisabled={false} onSalvar={jest.fn()} />,
    )
  })
  montados.push(renderer)
  return renderer
}

function textos(renderer: ReactTestRenderer.ReactTestRenderer) {
  return renderer.root.findAllByType(Text).map(node => [node.props.children].flat().join(''))
}

describe('RodapeAcoes', () => {
  it('com anexos, não mostra a faixa da fila nem a lista (ficam no card do formulário)', () => {
    const lista = textos(render(estado({ pendentes: [pendente(1), pendente(2)] })))

    expect(lista.some(texto => texto.includes('na fila'))).toBe(false)
    expect(lista).not.toContain('foto-1.jpg')
    expect(lista).toContain('Salvar Coleta')
  })

  it('enquanto verifica um vídeo, o salvar explica por que está travado', () => {
    const video = { ...pendente(1), tipo: 'video' as const, validandoDuracao: true }
    const lista = textos(render(estado({ pendentes: [video] })))

    expect(lista).toContain('Verificando vídeo...')
    expect(lista).not.toContain('Salvar Coleta')
  })

  it('salvando tem prioridade sobre a verificação de vídeo', () => {
    let renderer!: ReactTestRenderer.ReactTestRenderer
    const video = { ...pendente(1), tipo: 'video' as const, validandoDuracao: true }
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <RodapeAcoes multimidia={estado({ pendentes: [video] })} saveLabel="Salvar Coleta" salvando saveDisabled onSalvar={jest.fn()} />,
      )
    })
    montados.push(renderer)

    expect(textos(renderer)).toContain('Salvando...')
  })

  it('some com o teclado aberto', () => {
    const renderer = render(estado())

    ReactTestRenderer.act(() => ouvintes.keyboardDidShow())

    expect(textos(renderer)).not.toContain('Salvar Coleta')

    ReactTestRenderer.act(() => ouvintes.keyboardDidHide())

    expect(textos(renderer)).toContain('Salvar Coleta')
  })

  it('continua visível com o teclado aberto durante a gravação', () => {
    const renderer = render(estado({ isRecording: true }))

    ReactTestRenderer.act(() => ouvintes.keyboardDidShow())

    expect(textos(renderer)).toContain('Salvar Coleta')
    expect(textos(renderer)).toContain('00:12')
  })

  describe('posição sobre o teclado durante a gravação', () => {
    const margemDoRodape = (renderer: ReactTestRenderer.ReactTestRenderer) =>
      StyleSheet.flatten(renderer.root.findByProps({ testID: 'rodape-acoes' }).props.style).marginBottom

    it('no iOS sobe acima do teclado, que não redimensiona a tela', () => {
      Platform.OS = 'ios'
      const renderer = render(estado({ isRecording: true }))

      ReactTestRenderer.act(() => ouvintes.keyboardDidShow({ endCoordinates: { height: 300 } }))

      expect(margemDoRodape(renderer)).toBe(300)
    })

    it('no Android não desloca: a tela já encolhe com o teclado (adjustResize)', () => {
      Platform.OS = 'android'
      const renderer = render(estado({ isRecording: true }))

      ReactTestRenderer.act(() => ouvintes.keyboardDidShow({ endCoordinates: { height: 300 } }))

      expect(margemDoRodape(renderer) ?? 0).toBe(0)
    })
  })
})
