import React from 'react'
import { Text } from 'react-native'
import ReactTestRenderer from 'react-test-renderer'

import type { EvidenciaPendente, MultimidiaState } from '../hooks/useMultimidia'

import { ListaAnexos } from './Multimidia'

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

function estado(pendentes: EvidenciaPendente[]): MultimidiaState {
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
  it('mostra tipo, duração e o selo de fila', () => {
    const lista = textos([pendente({ tipo: 'audio', detalhe: '00:42' })])

    expect(lista).toContain('Áudio · 00:42')
    expect(lista).toContain('Na fila · enviado ao sincronizar')
  })

  it('vídeo em verificação não mostra selo', () => {
    const lista = textos([pendente({ tipo: 'video', detalhe: '3 MB', validandoDuracao: true })])

    expect(lista).toContain('Verificando duração do vídeo...')
    expect(lista).not.toContain('Na fila · enviado ao sincronizar')
  })
})
