import { EnvioInterrompidoError } from '@/features/sync/SyncService'

import { executarSincronizacao } from './sincronizacao'

function criarDeps(opcoes: { enviar?: () => Promise<{ enviados: number; erros: number }> } = {}) {
  return {
    sync: {
      enviar: jest.fn(opcoes.enviar ?? (async () => ({ enviados: 5, erros: 0 }))),
      baixar: jest.fn(async () => undefined),
      limparEnviados: jest.fn(async () => undefined),
    },
    store: {
      atualizarMeta: jest.fn(async () => undefined),
      avisarMudanca: jest.fn(),
    },
    importarTaxonomia: jest.fn(async () => undefined),
  }
}

describe('executarSincronizacao', () => {
  it('avisa as telas uma única vez ao fim', async () => {
    const deps = criarDeps()

    const { envio } = await executarSincronizacao(deps, { expedicaoId: 4 }, jest.fn())

    expect(envio).toEqual({ enviados: 5, erros: 0 })
    expect(deps.sync.baixar).toHaveBeenCalledTimes(1)
    expect(deps.sync.limparEnviados).toHaveBeenCalledTimes(1)
    expect(deps.store.avisarMudanca).toHaveBeenCalledTimes(1)
    expect(deps.store.atualizarMeta).toHaveBeenCalledWith(
      { ultima_sincronizacao: expect.any(String) },
      { silencioso: true },
    )
  })

  it('avisa uma vez mesmo quando o envio falha no meio', async () => {
    const deps = criarDeps({
      enviar: async () => { throw new EnvioInterrompidoError('A conexão caiu durante a sincronização.') },
    })
    const onProgresso = jest.fn()

    await expect(executarSincronizacao(deps, { expedicaoId: 4 }, onProgresso)).rejects.toBeInstanceOf(EnvioInterrompidoError)

    expect(deps.store.avisarMudanca).toHaveBeenCalledTimes(1)
    expect(onProgresso).toHaveBeenLastCalledWith(null)
  })

  it('com semBaixar não baixa e avisa uma vez', async () => {
    const deps = criarDeps()

    await executarSincronizacao(deps, { semBaixar: true }, jest.fn())

    expect(deps.sync.baixar).not.toHaveBeenCalled()
    expect(deps.store.avisarMudanca).toHaveBeenCalledTimes(1)
  })

  it('importa a taxonomia só no envio geral', async () => {
    const geral = criarDeps()
    await executarSincronizacao(geral, {}, jest.fn())
    expect(geral.importarTaxonomia).toHaveBeenCalledTimes(1)

    const daExpedicao = criarDeps()
    await executarSincronizacao(daExpedicao, { expedicaoId: 4 }, jest.fn())
    expect(daExpedicao.importarTaxonomia).not.toHaveBeenCalled()
  })
})
