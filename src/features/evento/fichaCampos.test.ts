import type { RotaExpedicao } from '@/features/expedition/types'
import {
  aceitaVariasOpcoes,
  buscarLocaisColeta,
  CAMPOS_IDENTIFICACAO,
  CAMPOS_LOCAL,
  cidadeUnicaDaExpedicao,
  dicaDeEscolha,
  digitarLocal,
  FICHA_FIELDS,
  precisaCidadeEstado,
  SECOES_COLETA,
  EMPTY_FICHA,
  escolherLocalColeta,
  escolherOpcao,
  FICHA_MULTIPLA_ESCOLHA,
  fichaComObservacoesMultiplas,
  FICHA_COLETA_FIELDS,
  fichaColetaParaPayload,
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

  it('escreve as opções como na ficha impressa', () => {
    expect(FICHA_MULTIPLA_ESCOLHA.associacoes).toContain('Micoheterotrófica')
    expect(FICHA_MULTIPLA_ESCOLHA.associacoes).not.toContain('Micoteterotrófica')
    expect(FICHA_MULTIPLA_ESCOLHA.habito).toContain('Cespitosa')
    expect(FICHA_MULTIPLA_ESCOLHA.habito).not.toContain('Cespitosas')
  })

  it('a coleta tem altura e exsudado depois do hábito e as cores das flores antes da observação', () => {
    const campos = FICHA_COLETA_FIELDS.map(([campo]) => campo)

    expect(campos.slice(campos.indexOf('habito'), campos.indexOf('habito') + 3))
      .toEqual(['habito', 'altura', 'exsudado'])
    expect(campos.slice(campos.indexOf('flores_cor_calice'), campos.indexOf('flores_cor_calice') + 3))
      .toEqual(['flores_cor_calice', 'flores_cor_corola', 'flores'])
  })

  it('envia altura, exsudado e as cores das flores na coleta', () => {
    const payload = fichaColetaParaPayload({
      ...EMPTY_FICHA,
      altura: ' 8 m ',
      exsudado: 'Látex branco',
      flores_cor_calice: 'Verde',
      flores_cor_corola: '',
    })

    expect(payload).toMatchObject({
      altura: '8 m',
      exsudado: 'Látex branco',
      flores_cor_calice: 'Verde',
      flores_cor_corola: null,
    })
  })

  it('o lembrete não envia os campos que só a coleta tem', () => {
    const payload = fichaParaPayload({ ...EMPTY_FICHA, altura: '8 m' })

    expect(Object.keys(payload)).not.toEqual(expect.arrayContaining(['altura']))
    expect(payload).not.toHaveProperty('exsudado')
    expect(payload).not.toHaveProperty('flores_cor_calice')
    expect(payload).not.toHaveProperty('flores_cor_corola')
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

  describe('cards da coleta', () => {
    it('ordena os cards como pedido', () => {
      expect(SECOES_COLETA.map(secao => secao.titulo)).toEqual([
        'Hábito', 'Luminosidade', 'Substrato', 'Associações', 'Flores', 'Frutos', 'Folhas', 'Tronco com casca',
      ])
    })

    it('cada campo da coleta aparece uma vez na tela', () => {
      const naTela = [
        ...CAMPOS_IDENTIFICACAO,
        ...CAMPOS_LOCAL,
        ...SECOES_COLETA.flatMap(secao => [...(secao.opcoes ? [secao.opcoes] : []), ...secao.campos]),
      ]
      const esperados = FICHA_COLETA_FIELDS.map(([campo]) => campo).filter(campo => campo !== 'municipio' && campo !== 'estado')

      expect(new Set(naTela).size).toBe(naTela.length)
      expect([...naTela].sort()).toEqual([...esperados].sort())
    })

    it('diz se a escolha é única ou múltipla', () => {
      expect(dicaDeEscolha('habito')).toBe('Uma ou mais')
      expect(dicaDeEscolha('luminosidade')).toBe('Escolha uma')
    })
  })

  it('lembrete segue a ordem da coleta', () => {
    expect(FICHA_FIELDS.map(([campo]) => campo)).toEqual([
      'nome_popular', 'nome_cientifico', 'municipio', 'estado', 'tipo_vegetacao', 'solo', 'relevo',
      'habito', 'luminosidade', 'substrato', 'associacoes', 'flores', 'frutos', 'folhas', 'tronco_com_casca',
    ])
  })

  describe('cidade do local digitado', () => {
    const LOCAIS = [
      { id: 10, descricao: 'Trilha da Cachoeira', municipio: 'Campo Mourão', estado: 'Paraná' },
    ]
    const unica = { municipio: 'Campo Mourão', estado: 'Paraná' }
    const rota = (cidadeId: number, nome: string): RotaExpedicao => ({
      cidade_id: cidadeId, ordem: cidadeId, nome_cidade: nome, estado: 1, estado_nome: 'Paraná', estado_sigla: 'PR', locais_coleta: [],
    })

    it('local da lista não pede cidade', () => {
      expect(precisaCidadeEstado({ ...EMPTY_FICHA, referencia_local: ' trilha da CACHOEIRA ' }, LOCAIS)).toBe(false)
      expect(precisaCidadeEstado({ ...EMPTY_FICHA, referencia_local: 'Beira da estrada' }, LOCAIS)).toBe(true)
      expect(precisaCidadeEstado({ ...EMPTY_FICHA, referencia_local: '  ' }, LOCAIS)).toBe(false)
    })

    it('cidade única da rota', () => {
      expect(cidadeUnicaDaExpedicao([rota(1, 'Campo Mourão')])).toEqual(unica)
      expect(cidadeUnicaDaExpedicao([rota(1, 'Campo Mourão'), rota(1, 'Campo Mourão')])).toEqual(unica)
      expect(cidadeUnicaDaExpedicao([rota(1, 'Campo Mourão'), rota(2, 'Peabiru')])).toBeNull()
      expect(cidadeUnicaDaExpedicao(undefined)).toBeNull()
    })

    it('local digitado pré-preenche a cidade única', () => {
      expect(digitarLocal(EMPTY_FICHA, 'Beira da estrada', LOCAIS, unica))
        .toMatchObject({ referencia_local: 'Beira da estrada', municipio: 'Campo Mourão', estado: 'Paraná' })
      expect(digitarLocal(EMPTY_FICHA, 'Beira da estrada', LOCAIS, null))
        .toMatchObject({ referencia_local: 'Beira da estrada', municipio: '', estado: '' })
    })

    it('local digitado igual a um da lista preenche a cidade dele', () => {
      const locais = [...LOCAIS, { id: 20, descricao: 'Mirante', municipio: 'Peabiru', estado: 'PR' }]

      expect(digitarLocal(EMPTY_FICHA, 'trilha da cachoeira', locais, null))
        .toMatchObject({ referencia_local: 'trilha da cachoeira', municipio: 'Campo Mourão', estado: 'Paraná' })
      // Tinha escolhido outro local antes: a cidade passa a ser a do novo
      const comOutroLocal = { ...EMPTY_FICHA, referencia_local: 'Trilha da Cachoeira', municipio: 'Campo Mourão', estado: 'Paraná' }
      expect(digitarLocal(comOutroLocal, 'Mirante', locais, null))
        .toMatchObject({ referencia_local: 'Mirante', municipio: 'Peabiru', estado: 'PR' })
    })

    it('não sobrescreve cidade já preenchida', () => {
      const ficha = { ...EMPTY_FICHA, municipio: 'Peabiru', estado: 'PR' }

      expect(digitarLocal(ficha, 'Beira da estrada', LOCAIS, unica))
        .toMatchObject({ municipio: 'Peabiru', estado: 'PR' })
    })
  })
})
