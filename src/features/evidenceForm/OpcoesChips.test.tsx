import React, { useState } from 'react'
import { Text, TouchableOpacity } from 'react-native'
import ReactTestRenderer from 'react-test-renderer'

import type { CampoMultiplaEscolha } from '@/features/evento/fichaCampos'

import { OpcoesChips } from './OpcoesChips'

function render(campo: CampoMultiplaEscolha) {
  let valor = ''
  function Teste() {
    const [atual, setAtual] = useState('')
    valor = atual
    return <OpcoesChips campo={campo} valor={atual} onChange={setAtual} />
  }
  let renderer!: ReactTestRenderer.ReactTestRenderer
  ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<Teste />)
  })

  const chip = (rotulo: string) => renderer.root.findAllByType(TouchableOpacity)
    .find(botao => botao.findAllByType(Text).some(texto => texto.props.children === rotulo))!
  const tocar = (rotulo: string) => ReactTestRenderer.act(() => chip(rotulo).props.onPress())

  return { valor: () => valor, tocar, chip }
}

describe('OpcoesChips', () => {
  it('escolha única troca e desmarca', () => {
    const { valor, tocar } = render('luminosidade')

    tocar('Heliófita')
    expect(valor()).toBe('Heliófita')
    tocar('Ciófita')
    expect(valor()).toBe('Ciófita')
    tocar('Ciófita')
    expect(valor()).toBe('')
  })

  it('múltipla acumula', () => {
    const { valor, tocar } = render('habito')

    tocar('Árvore')
    tocar('Liana')

    expect(valor()).toBe('Árvore, Liana')
  })

  it('marca a opção selecionada', () => {
    const { tocar, chip } = render('substrato')

    tocar('Rupícola')

    expect(chip('Rupícola').props.accessibilityState).toMatchObject({ selected: true })
    expect(chip('Ripária').props.accessibilityState).toMatchObject({ selected: false })
  })
})
