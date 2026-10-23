import React from 'react'
import { Image, Text } from 'react-native'
import ReactTestRenderer from 'react-test-renderer'
import { LembreteCard } from '../src/features/lembrete/components/LembreteCard'
import type { Lembrete } from '../src/features/lembrete/types'

const lembrete: Lembrete = {
  id: 7,
  data_coleta: '2026-11-20',
  local_coleta: 'Trilha da cachoeira',
  descricao: 'Voltar na floração',
  latitude: -19.27,
  longitude: -43.58,
  nome_cientifico: 'Vellozia squamata',
  expedicao_id: 3,
  evidencias: [
    { id: 1, nome: 'foto1.jpg', url: 'file:///tmp/foto1.jpg' },
    { id: 2, nome: 'foto2.jpg', url: 'file:///tmp/foto2.jpg' },
  ],
  created_at: '2026-10-05T00:00:00.000Z',
  updated_at: '2026-10-05T00:00:00.000Z',
  created_by: 1,
  updated_by: 1,
} as Lembrete

function textos(renderer: ReactTestRenderer.ReactTestRenderer): string[] {
  return renderer.root.findAllByType(Text).map(node => [node.props.children].flat().join(''))
}

function render(item: Lembrete) {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined
  ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<LembreteCard lembrete={item} />)
  })
  return renderer!
}

describe('LembreteCard', () => {
  it('mostra data, descrição, local, coordenadas e fotos', () => {
    const renderer = render(lembrete)
    const lista = textos(renderer)

    expect(lista).toContain('Voltar em: 20/11/2026')
    expect(lista).toContain('Voltar na floração')
    expect(lista).toContain('Trilha da cachoeira')
    expect(lista).toContain('-19.27000, -43.58000')
    expect(renderer.root.findAllByType(Image)).toHaveLength(2)
  })

  it('omite descrição, coordenadas e fotos quando o lembrete não tem', () => {
    const renderer = render({
      ...lembrete, descricao: null, latitude: null, longitude: null, evidencias: [],
    })
    const lista = textos(renderer)

    expect(lista).not.toContain('Voltar na floração')
    expect(lista.some(texto => texto.includes('-19.27'))).toBe(false)
    expect(renderer.root.findAllByType(Image)).toHaveLength(0)
  })
})
