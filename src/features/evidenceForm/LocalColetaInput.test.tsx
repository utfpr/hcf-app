import React, { useState } from 'react'
import { Text, TextInput, TouchableOpacity } from 'react-native'
import ReactTestRenderer from 'react-test-renderer'

import { EMPTY_FICHA, type FichaValues, type OpcaoLocalColeta } from '@/features/evento/fichaCampos'

import { LocalColetaInput } from './LocalColetaInput'

const LOCAIS: OpcaoLocalColeta[] = [
  { id: 7, descricao: 'Trilha da cachoeira', municipio: 'Campo Mourão', estado: 'Paraná' },
  { id: 9, descricao: 'Margem do rio', municipio: 'Peabiru', estado: 'Paraná' },
]

function render(locais: OpcaoLocalColeta[]) {
  let ficha: FichaValues = EMPTY_FICHA

  function Formulario() {
    const [valor, setValor] = useState<FichaValues>(EMPTY_FICHA)
    ficha = valor
    return <LocalColetaInput ficha={valor} locais={locais} onChange={setValor} />
  }

  let renderer!: ReactTestRenderer.ReactTestRenderer
  ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<Formulario />)
  })
  return { renderer, ficha: () => ficha }
}

function digitar(renderer: ReactTestRenderer.ReactTestRenderer, texto: string) {
  ReactTestRenderer.act(() => {
    renderer.root.findByType(TextInput).props.onChangeText(texto)
  })
}

function textos(renderer: ReactTestRenderer.ReactTestRenderer) {
  return renderer.root.findAllByType(Text).map(node => [node.props.children].flat().join(''))
}

describe('LocalColetaInput', () => {
  it('sugere os locais da expedição enquanto digita e preenche local, cidade e estado ao tocar', () => {
    const { renderer, ficha } = render(LOCAIS)

    digitar(renderer, 'rio')

    expect(textos(renderer)).toContain('Margem do rio')
    expect(textos(renderer)).not.toContain('Trilha da cachoeira')

    ReactTestRenderer.act(() => {
      renderer.root.findAllByType(TouchableOpacity)[0].props.onPress()
    })

    expect(ficha()).toMatchObject({ referencia_local: 'Margem do rio', municipio: 'Peabiru', estado: 'Paraná' })
    expect(textos(renderer)).not.toContain('Peabiru – Paraná')
  })

  it('avisa quando o local não está na expedição, mantendo o texto digitado', () => {
    const { renderer, ficha } = render(LOCAIS)

    digitar(renderer, 'Beira da estrada, km 12')

    expect(textos(renderer)).toContain('Nenhum local da expedição encontrado. O local digitado será salvo assim mesmo.')
    expect(ficha().referencia_local).toBe('Beira da estrada, km 12')
  })

  it('numa expedição sem locais cadastrados avisa e salva o texto digitado', () => {
    const { renderer, ficha } = render([])

    digitar(renderer, 'Trilha nova')

    expect(textos(renderer)).toContain('Esta expedição não tem locais cadastrados. O local digitado será salvo assim mesmo.')
    expect(ficha().referencia_local).toBe('Trilha nova')
  })

  it('ao tocar no campo vazio mostra todos os locais da expedição', () => {
    const { renderer } = render(LOCAIS)

    ReactTestRenderer.act(() => {
      renderer.root.findByType(TextInput).props.onFocus()
    })

    expect(textos(renderer)).toEqual(expect.arrayContaining(['Trilha da cachoeira', 'Margem do rio']))
  })
})
