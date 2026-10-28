import { SyncService } from './SyncService'

const expedicao = { id: 3, descricao: 'Teste', data_inicio: '2026-10-18', data_fim: '2026-10-31', cidade_id: 1 }
const pagina = <T>(itens: T[]) => ({ itens, total: itens.length, limite: 100, pagina: 1 })

// Responde cada rota que a baixa consulta
function criarHttpClient() {
  return {
    get: jest.fn(async (url: string) => {
      if (url === '/v1/expedicoes') return { data: pagina([expedicao]) }
      if (url === '/v1/expedicoes/3') return { data: { ...expedicao, participantes: [], rotas: [] } }
      if (url === '/v1/expedicoes/3/eventos') return { data: pagina([{ id: 7, expedicao_id: 3 }]) }
      if (url === '/v1/eventos/7/evidencias') return { data: [] }
      if (url === '/v1/lembretes') return { data: pagina([]) }
      throw new Error(`rota inesperada: ${url}`)
    }),
  }
}

function criarStore() {
  const pendencias = { proximo_seq: 1, eventos: [], midias: [], lembretes: [] }
  return {
    usuarioId: 14,
    lerExpedicoes: jest.fn(async () => ({ itens: [], minhas: [], detalhadas: [] })),
    pendencias: jest.fn(async () => pendencias),
    gravarExpedicoes: jest.fn(async () => undefined),
    gravarDetalhe: jest.fn(async () => undefined),
    gravarRegistros: jest.fn(async () => undefined),
    removerExpedicao: jest.fn(async () => undefined),
    gravarLembretes: jest.fn(async () => undefined),
    atualizarMeta: jest.fn(async () => undefined),
    atualizarPendencias: jest.fn(async (alterar: (atual: typeof pendencias) => unknown) => alterar(pendencias)),
    apagarMidia: jest.fn(async () => undefined),
    avisarMudanca: jest.fn(),
  }
}

describe('SyncService.baixar / limparEnviados', () => {
  it('grava tudo em silêncio, para as telas relerem uma vez só no fim', async () => {
    const store = criarStore()
    const sync = new SyncService(criarHttpClient() as any, store as any)

    await sync.baixar()
    await sync.limparEnviados()

    const gravacoes = [
      store.gravarExpedicoes,
      store.gravarDetalhe,
      store.gravarRegistros,
      store.gravarLembretes,
      store.atualizarMeta,
      store.atualizarPendencias,
    ]
    for (const gravacao of gravacoes) {
      expect(gravacao).toHaveBeenCalled()
      for (const args of gravacao.mock.calls as unknown[][]) {
        expect(args[args.length - 1]).toEqual({ silencioso: true })
      }
    }
    // Quem avisa as telas é o OfflineContext, depois das duas etapas
    expect(store.avisarMudanca).not.toHaveBeenCalled()
  })
})
