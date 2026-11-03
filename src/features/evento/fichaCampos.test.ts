import type { RotaExpedicao } from '@/features/expedition/types'
import {
  aceitaVariasOpcoes,
  buscarLocaisColeta,
  EMPTY_FICHA,
  escolherLocalColeta,
  escolherOpcao,
  FICHA_MULTIPLA_ESCOLHA,
  fichaComObservacoesMultiplas,
  fichaParaPayload,
  locaisColetaDaExpedicao,
} from './fichaCampos'

describe('fichaCampos', () => {
  it('mantém o local de coleta como texto livre no payload', () => {
    const ficha = { ...EMPTY_FICHA, referencia_local: 'Trilha da cachoeira' }

    expect(fichaParaPayload(ficha).referencia_local).toBe('Trilha da cachoeira')
  })

  it('envia as opções múltiplas e a anotação complementar em texto', () => {
    const ficha = {
      ...EMPTY_FICHA,
      associacoes: 'Epífita, Parasita',
      folhas: 'Cartáceas',
    }

    expect(fichaComObservacoesMultiplas(ficha, {
      associacoes: 'No tronco vivo',
      folhas: 'Verde-escura',
    })).toMatchObject({
      associacoes: 'Epífita, Parasita, Observações: No tronco vivo',
      folhas: 'Cartáceas, Cor: Verde-escura',
    })
  })

  it('envia uma anotação livre mesmo sem opção selecionada', () => {
    expect(fichaComObservacoesMultiplas(EMPTY_FICHA, {
      associacoes: 'Nova associação observada em campo',
    }).associacoes).toBe('Observações: Nova associação observada em campo')
  })

  it('mantém as opções da ficha de coleta apenas no aplicativo', () => {
    expect(FICHA_MULTIPLA_ESCOLHA.substrato).toContain('Rupícola')
    expect(FICHA_MULTIPLA_ESCOLHA.tronco_com_casca).toContain('Lisa')
    expect(FICHA_MULTIPLA_ESCOLHA.luminosidade).toEqual(['Heliófita', 'Semi-ciófita', 'Ciófita'])
  })

  it('só folhas, frutos e hábito aceitam mais de uma opção', () => {
    const multiplos = (Object.keys(FICHA_MULTIPLA_ESCOLHA) as Array<keyof typeof FICHA_MULTIPLA_ESCOLHA>)
      .filter(aceitaVariasOpcoes)
    expect(multiplos.sort()).toEqual(['folhas', 'frutos', 'habito'])
  })

  it('nos campos de escolha única troca a opção, e desmarca ao tocar de novo', () => {
    expect(escolherOpcao('substrato', 'Rupícola', 'Ripária')).toBe('Ripária')
    expect(escolherOpcao('substrato', 'Ripária', 'Ripária')).toBe('')
    expect(escolherOpcao('folhas', 'Cartáceas', 'Crassas')).toBe('Cartáceas, Crassas')
    expect(escolherOpcao('folhas', 'Cartáceas, Crassas', 'Cartáceas')).toBe('Crassas')
  })

  it('lista os locais de coleta de todas as cidades da rota, na ordem da rota', () => {
    const rotas: RotaExpedicao[] = [
      { cidade_id: 2, ordem: 2, nome_cidade: 'Peabiru', estado: 1, estado_nome: 'Paraná', estado_sigla: 'PR',
        locais_coleta: [{ id: 20, descricao: 'Bosque' }, { id: 21, descricao: '  ' }] },
      { cidade_id: 1, ordem: 1, nome_cidade: 'Campo Mourão', estado: 1, estado_sigla: 'PR',
        locais_coleta: [{ id: 10, descricao: 'Trilha da cachoeira' }, { id: 11, descricao: null }] },
    ]

    expect(locaisColetaDaExpedicao(rotas)).toEqual([
      { id: 10, descricao: 'Trilha da cachoeira', municipio: 'Campo Mourão', estado: 'PR' },
      { id: 20, descricao: 'Bosque', municipio: 'Peabiru', estado: 'Paraná' },
    ])
    expect(locaisColetaDaExpedicao(undefined)).toEqual([])
  })

  it('escolher um local sugerido preenche o local, a cidade e o estado', () => {
    const local = { id: 10, descricao: 'Trilha da cachoeira', municipio: 'Campo Mourão', estado: 'Paraná' }
    const escolhida = escolherLocalColeta({ ...EMPTY_FICHA, referencia_local: 'tri', municipio: 'Outra' }, local)

    expect(escolhida).toMatchObject({ referencia_local: 'Trilha da cachoeira', municipio: 'Campo Mourão', estado: 'Paraná' })
    expect(escolherLocalColeta(escolhida, local)).toEqual(escolhida)
  })

  it('busca os locais da expedição pelo nome ou pela cidade, sem diferenciar maiúsculas e acentos', () => {
    const locais = [
      { id: 10, descricao: 'Trilha da Cachoeira', municipio: 'Campo Mourão', estado: 'Paraná' },
      { id: 20, descricao: 'Bosque', municipio: 'Peabiru', estado: 'Paraná' },
    ]

    expect(buscarLocaisColeta(locais, 'cachoe').map(local => local.id)).toEqual([10])
    expect(buscarLocaisColeta(locais, 'mourao').map(local => local.id)).toEqual([10])
    expect(buscarLocaisColeta(locais, '  BOSQUE ').map(local => local.id)).toEqual([20])
    expect(buscarLocaisColeta(locais, 'Beira da estrada')).toEqual([])
    expect(buscarLocaisColeta(locais, '')).toEqual(locais)
  })
})
