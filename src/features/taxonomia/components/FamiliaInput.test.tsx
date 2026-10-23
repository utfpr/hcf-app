import React, { useState } from 'react'
import { Text, TextInput, TouchableOpacity } from 'react-native'
import ReactTestRenderer from 'react-test-renderer'
import { SWRConfig } from 'swr'

import { ContainerContext } from '@/contexts/Container/ContainerContext'

import { FamiliaInput } from './FamiliaInput'

const get = jest.fn()

function Formulario() {
  const [familia, setFamilia] = useState('')
  return <FamiliaInput value={familia} onChangeText={setFamilia} />
}

function render() {
  let renderer!: ReactTestRenderer.ReactTestRenderer
  ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(
      // Cache novo por teste, sem deduplicar pedidos
      <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
        <ContainerContext.Provider value={{ httpClient: { get } as any, accessTokenSource: {} as any }}>
          <Formulario />
        </ContainerContext.Provider>
      </SWRConfig>,
    )
  })
  return renderer
}

async function digitar(renderer: ReactTestRenderer.ReactTestRenderer, texto: string) {
  ReactTestRenderer.act(() => {
    renderer.root.findByType(TextInput).props.onChangeText(texto)
  })
  // Passa a espera de digitação e deixa o pedido resolver
  await ReactTestRenderer.act(async () => {
    jest.advanceTimersByTime(300)
  })
  await ReactTestRenderer.act(async () => {})
}

function textos(renderer: ReactTestRenderer.ReactTestRenderer) {
  return renderer.root.findAllByType(Text).map(node => [node.props.children].flat().join(''))
}

describe('FamiliaInput', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    get.mockReset()
  })

  afterEach(() => jest.useRealTimers())

  it('só busca a partir de 2 letras', async () => {
    const renderer = render()

    await digitar(renderer, 'M')

    expect(get).not.toHaveBeenCalled()
    expect(textos(renderer)).toContain('Digite ao menos 2 letras para buscar.')
  })

  it('mostra as famílias da API e preenche o campo ao tocar numa sugestão', async () => {
    get.mockResolvedValue({
      data: {
        metadados: { total: 2, pagina: 1, limite: 10 },
        resultado: [{ id: 1, nome: 'Myrtaceae' }, { id: 2, nome: 'Myristicaceae' }],
      },
    })
    const renderer = render()

    await digitar(renderer, 'myr')

    expect(get).toHaveBeenCalledWith('/familias', { familia: 'myr', limite: 10 })
    expect(textos(renderer)).toEqual(expect.arrayContaining(['Myrtaceae', 'Myristicaceae']))

    ReactTestRenderer.act(() => {
      renderer.root.findAllByType(TouchableOpacity)[0].props.onPress()
    })

    expect(renderer.root.findByType(TextInput).props.value).toBe('Myrtaceae')
    expect(textos(renderer)).not.toContain('Myristicaceae')
  })

  it('avisa quando nada é encontrado, mantendo o texto digitado', async () => {
    get.mockResolvedValue({ data: { metadados: { total: 0, pagina: 1, limite: 10 }, resultado: [] } })
    const renderer = render()

    await digitar(renderer, 'xyz')

    expect(textos(renderer)).toContain('Nenhuma família encontrada. O nome digitado será salvo assim mesmo.')
    expect(renderer.root.findByType(TextInput).props.value).toBe('xyz')
  })
})
