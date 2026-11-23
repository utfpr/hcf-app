import React, { useState } from 'react'
import { Text, TextInput, TouchableOpacity } from 'react-native'
import ReactTestRenderer from 'react-test-renderer'

import { type CidadeEstado, EMPTY_FICHA, type FichaValues, type OpcaoLocalColeta } from '@/features/evento/fichaCampos'

import { LocalColetaInput } from './LocalColetaInput'

const LOCAIS: OpcaoLocalColeta[] = [
  { id: 7, descricao: 'Trilha da cachoeira', municipio: 'Campo Mourão', estado: 'Paraná' },
  { id: 9, descricao: 'Margem do rio', municipio: 'Peabiru', estado: 'Paraná' },
]

function render(
  locais: OpcaoLocalColeta[],
  { inicial = EMPTY_FICHA, cidadeUnica = null }: { inicial?: FichaValues; cidadeUnica?: CidadeEstado | null } = {},
) {
  let ficha: FichaValues = inicial

  function Formulario() {
    const [valor, setValor] = useState<FichaValues>(inicial)
    ficha = valor
    return <LocalColetaInput ficha={valor} locais={locais} onChange={setValor} cidadeUnica={cidadeUnica} />
  }

  let renderer!: ReactTestRenderer.ReactTestRenderer
  ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<Formulario />)
  })
  return { renderer, ficha: () => ficha }
}

function digitar(renderer: ReactTestRenderer.ReactTestRenderer, texto: string) {
  ReactTestRenderer.act(() => {
    renderer.root.findAllByType(TextInput)[0].props.onChangeText(texto)
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
      renderer.root.findAllByType(TextInput)[0].props.onFocus()
    })

    expect(textos(renderer)).toEqual(expect.arrayContaining(['Trilha da cachoeira', 'Margem do rio']))
  })

  it('local digitado mostra Município e Estado', () => {
    const { renderer } = render(LOCAIS)

    digitar(renderer, 'Beira da estrada, km 12')

    expect(renderer.root.findAllByType(TextInput)).toHaveLength(3)
    expect(textos(renderer)).toEqual(expect.arrayContaining(['Município', 'Estado']))
  })

  it('local escolhido na lista não mostra Município e Estado', () => {
    const { renderer } = render(LOCAIS)

    digitar(renderer, 'rio')
    ReactTestRenderer.act(() => {
      renderer.root.findAllByType(TouchableOpacity)[0].props.onPress()
    })

    expect(renderer.root.findAllByType(TextInput)).toHaveLength(1)
  })

  it('pré-preenche com a cidade única', () => {
    const { renderer, ficha } = render(LOCAIS, { cidadeUnica: { municipio: 'Campo Mourão', estado: 'Paraná' } })

    digitar(renderer, 'Beira da estrada, km 12')

    expect(ficha()).toMatchObject({ municipio: 'Campo Mourão', estado: 'Paraná' })
  })

  it('rascunho com local da lista abre sem os campos', () => {
    const { renderer } = render(LOCAIS, {
      inicial: { ...EMPTY_FICHA, referencia_local: 'Trilha da cachoeira', municipio: 'Campo Mourão', estado: 'Paraná' },
    })

    expect(renderer.root.findAllByType(TextInput)).toHaveLength(1)
  })

  it('rascunho com local digitado abre com os campos preenchidos', () => {
    const { renderer } = render(LOCAIS, {
      inicial: { ...EMPTY_FICHA, referencia_local: 'Beira da estrada', municipio: 'Peabiru', estado: 'PR' },
    })

    const [, municipio, estado] = renderer.root.findAllByType(TextInput)
    expect(municipio.props.value).toBe('Peabiru')
    expect(estado.props.value).toBe('PR')
  })
})
