import React from 'react'
import { Text, TouchableOpacity } from 'react-native'
import ReactTestRenderer from 'react-test-renderer'

import type { EvidenciaPendente, MultimidiaState } from '../hooks/useMultimidia'

import { BotoesMidia, ListaAnexos } from './Multimidia'

function pendente(parcial: Partial<EvidenciaPendente> & Pick<EvidenciaPendente, 'tipo' | 'detalhe'>): EvidenciaPendente {
  return {
    id: `${parcial.tipo}-1`,
    payload: {
      nome: `${parcial.tipo}.mp4`,
      data_captura: '2026-11-16T10:00:00.000Z',
      arquivo: { uri: 'file:///arquivo', name: 'arquivo', type: 'audio/mp4' },
    },
    ...parcial,
  }
}

function estado(pendentes: EvidenciaPendente[], parcial: Partial<MultimidiaState> = {}): MultimidiaState {
  return {
    pendentes,
    setPendentes: jest.fn(),
    error: null,
    setError: jest.fn(),
    isRecording: false,
    recordTime: '00:00',
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

function textos(pendentes: EvidenciaPendente[]) {
  let renderer!: ReactTestRenderer.ReactTestRenderer
  ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<ListaAnexos state={estado(pendentes)} />)
  })
  return renderer.root.findAllByType(Text).map(node => [node.props.children].flat().join(''))
}

describe('ListaAnexos', () => {
  it('mostra tipo e duração, sem o selo de fila (tudo ali está na fila)', () => {
    const lista = textos([pendente({ tipo: 'audio', detalhe: '00:42' })])

    expect(lista).toContain('Áudio · 00:42')
    expect(lista.some(texto => texto.includes('Na fila'))).toBe(false)
  })

  it('vídeo em verificação avisa no lugar da duração', () => {
    const lista = textos([pendente({ tipo: 'video', detalhe: '3 MB', validandoDuracao: true })])

    expect(lista).toContain('Verificando duração do vídeo...')
    expect(lista).not.toContain('Vídeo · 3 MB')
  })
})

describe('BotoesMidia: gravação de áudio', () => {
  // Desmontar para a animação do aviso de gravação parar e o Jest encerrar
  const montados: ReactTestRenderer.ReactTestRenderer[] = []
  afterEach(() => {
    ReactTestRenderer.act(() => montados.splice(0).forEach(renderer => renderer.unmount()))
  })

  function render(parcial: Partial<MultimidiaState>, props: { apenasFotos?: boolean } = {}) {
    let renderer!: ReactTestRenderer.ReactTestRenderer
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(<BotoesMidia state={estado([], parcial)} {...props} />)
    })
    montados.push(renderer)
    return renderer
  }

  const textosDe = (renderer: ReactTestRenderer.ReactTestRenderer) =>
    renderer.root.findAllByType(Text).map(node => [node.props.children].flat().join(''))

  it('parado, não mostra o aviso', () => {
    const lista = textosDe(render({ isRecording: false }))

    expect(lista).not.toContain('Gravando áudio...')
    expect(lista).toContain('Áudio')
  })

  it('gravando, mostra o aviso com o tempo uma vez só', () => {
    const lista = textosDe(render({ isRecording: true, recordTime: '00:42' }))

    expect(lista).toContain('Gravando áudio...')
    expect(lista.filter(texto => texto.includes('00:42'))).toHaveLength(1)
  })

  it('"Parar" do aviso encerra a gravação', () => {
    const alternarGravacao = jest.fn()
    const renderer = render({ isRecording: true, alternarGravacao })
    const parar = renderer.root.findAllByType(TouchableOpacity)
      .find(botao => botao.props.accessibilityLabel === 'Parar gravação de áudio')

    ReactTestRenderer.act(() => parar!.props.onPress())

    expect(alternarGravacao).toHaveBeenCalledTimes(1)
  })

  it('só fotos (lembrete) não mostra o aviso', () => {
    const lista = textosDe(render({ isRecording: true }, { apenasFotos: true }))

    expect(lista).not.toContain('Gravando áudio...')
  })
})
