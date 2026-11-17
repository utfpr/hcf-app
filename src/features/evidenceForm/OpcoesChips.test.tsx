import React, { useState } from 'react'
import { StyleSheet, Text, TouchableOpacity } from 'react-native'
import ReactTestRenderer from 'react-test-renderer'

import type { CampoMultiplaEscolha } from '@/features/evento/fichaCampos'

import { OpcoesChips } from './OpcoesChips'

// Contraste WCAG entre duas cores #RRGGBB
function contraste(a: string, b: string): number {
  const luminancia = (hex: string) => {
    const [r, g, bl] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
      .map(c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl
  }
  const [claro, escuro] = [luminancia(a), luminancia(b)].sort((x, y) => y - x)
  return (claro + 0.05) / (escuro + 0.05)
}

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

  it('o nome da opção não selecionada se destaca do chip', () => {
    const { chip } = render('substrato')

    const botao = chip('Ripária')
    const fundo = StyleSheet.flatten(botao.props.style).backgroundColor as string
    const texto = StyleSheet.flatten(botao.findByType(Text).props.style).color as string
    expect(contraste(fundo, texto)).toBeGreaterThanOrEqual(4.5)
  })

  it('o chip selecionado tem fundo diferente do não selecionado', () => {
    const { tocar, chip } = render('substrato')
    tocar('Rupícola')

    const fundo = (rotulo: string) => StyleSheet.flatten(chip(rotulo).props.style).backgroundColor
    expect(fundo('Rupícola')).not.toBe(fundo('Ripária'))
  })
})
