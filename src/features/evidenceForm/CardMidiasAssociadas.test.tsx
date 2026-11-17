import React from 'react'
import { Text } from 'react-native'
import ReactTestRenderer from 'react-test-renderer'

import type { EvidenciaPendente, MultimidiaState } from '@/features/evento/hooks/useMultimidia'

import { CardMidiasAssociadas } from './CardMidiasAssociadas'

function foto(n: number): EvidenciaPendente {
  return {
    id: `foto-${n}`,
    tipo: 'imagem',
    detalhe: '1 MB',
    payload: {
      nome: `foto-${n}.jpg`,
      data_captura: '2026-11-17T10:00:00.000Z',
      arquivo: { uri: `file:///foto-${n}.jpg`, name: `foto-${n}.jpg`, type: 'image/jpeg' },
    },
  }
}

function estado(pendentes: EvidenciaPendente[]): MultimidiaState {
  return {
    pendentes,
    isRecording: false,
    playingId: null,
    alternarReproducao: jest.fn(),
    remover: jest.fn(),
  } as unknown as MultimidiaState
}

function render(pendentes: EvidenciaPendente[], apenasFotos = false) {
  let renderer!: ReactTestRenderer.ReactTestRenderer
  ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<CardMidiasAssociadas multimidia={estado(pendentes)} apenasFotos={apenasFotos} />)
  })
  return renderer
}

const textos = (renderer: ReactTestRenderer.ReactTestRenderer) =>
  renderer.root.findAllByType(Text).map(node => [node.props.children].flat().join(''))

describe('CardMidiasAssociadas', () => {
  it('sem mídia, não aparece', () => {
    expect(render([]).toJSON()).toBeNull()
  })

  it('mostra a quantidade no título e lista as mídias', () => {
    const lista = textos(render([foto(1), foto(2)]))

    expect(lista).toContain('Mídias associadas (2)')
    expect(lista).toContain('foto-1.jpg')
    expect(lista).toContain('foto-2.jpg')
  })

  it('no lembrete (só fotos) o título diz "Fotos associadas"', () => {
    expect(textos(render([foto(1)], true))).toContain('Fotos associadas (1)')
  })
})
