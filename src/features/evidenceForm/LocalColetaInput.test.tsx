import React, { useState } from 'react'
import { TextInput } from 'react-native'
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

function tocar(renderer: ReactTestRenderer.ReactTestRenderer, testID: string) {
  ReactTestRenderer.act(() => {
    renderer.root.findByProps({ testID }).props.onPress()
  })
}

describe('LocalColetaInput', () => {
  it('aceita texto livre mesmo quando a expedição tem locais cadastrados', () => {
    const { renderer, ficha } = render(LOCAIS)

    ReactTestRenderer.act(() => {
      renderer.root.findByType(TextInput).props.onChangeText('Beira da estrada, km 12')
    })

    expect(ficha().referencia_local).toBe('Beira da estrada, km 12')
  })

  it('escolher um local da expedição preenche o local, a cidade e o estado', () => {
    const { renderer, ficha } = render(LOCAIS)

    tocar(renderer, 'abrir-locais-coleta')
    tocar(renderer, 'local-coleta-9')

    expect(ficha()).toMatchObject({ referencia_local: 'Margem do rio', municipio: 'Peabiru', estado: 'Paraná' })
    expect(renderer.root.findByType(TextInput).props.value).toBe('Margem do rio')
  })

  it('sem locais na expedição fica só o texto livre', () => {
    const { renderer } = render([])

    expect(renderer.root.findAllByProps({ testID: 'abrir-locais-coleta' })).toHaveLength(0)
    expect(renderer.root.findAllByType(TextInput)).toHaveLength(1)
  })
})
