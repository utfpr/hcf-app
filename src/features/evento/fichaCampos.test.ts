import {
  EMPTY_FICHA,
  FICHA_MULTIPLA_ESCOLHA,
  fichaComObservacoesMultiplas,
  fichaParaPayload,
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
})
