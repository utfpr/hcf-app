import type { Pendencias } from '@/features/offline/types'

import { SyncService } from './SyncService'

const arquivo = { uri: 'file:///foto.jpg', name: 'foto.jpg', type: 'image/jpeg' }
const payloadEvento = { tipo: 'COLETA' as const, data_captura: '2026-11-03T12:00:00.000Z' }
const payloadMidia = { arquivo, nome: 'foto.jpg', data_captura: '2026-11-03T12:00:00.000Z' }

function pendenciasComColeta(parcial: Partial<Pendencias> = {}): Pendencias {
  return {
    proximo_seq: 3,
    eventos: [{
      local_id: 'evt-local',
      seq: 1,
      status: 'pending',
      criado_em: '2026-11-03T12:00:00.000Z',
      expedicao_id: 4,
      payload: payloadEvento,
    }],
    midias: [{
      local_id: 'mid-local',
      seq: 2,
      status: 'pending',
      criado_em: '2026-11-03T12:00:00.000Z',
      alvo: { tipo: 'evento', expedicao_id: 4, evento_local_id: 'evt-local' },
      payload: payloadMidia,
    }],
    lembretes: [],
    ...parcial,
  }
}

function criarStore(inicial: Pendencias) {
  let atual = structuredClone(inicial)
  return {
    usuarioId: 14,
    pendencias: jest.fn(async () => structuredClone(atual)),
    atualizarPendencias: jest.fn(async (alterar: (value: Pendencias) => Pendencias) => {
      atual = alterar(atual)
      return atual
    }),
    midiaExiste: jest.fn(async () => true),
    apagarMidia: jest.fn(async () => undefined),
    snapshot: () => atual,
  }
}

function criarHttpClient() {
  return {
    get: jest.fn(),
    post: jest.fn(async (url: string) => {
      if (url === '/v1/expedicoes/4/eventos') {
        return { data: { id: 10, expedicao_id: 4, ...payloadEvento } }
      }
      throw new Error(`POST inesperado: ${url}`)
    }),
    postForm: jest.fn(async () => ({ data: { id: 99, evento_id: 10 } })),
    put: jest.fn(),
    delete: jest.fn(),
  }
}

describe('SyncService.enviar', () => {
  it('sobe o evento e depois a mídia com o id que a API devolveu', async () => {
    const store = criarStore(pendenciasComColeta())
    const httpClient = criarHttpClient()
    const sync = new SyncService(httpClient as any, store as any)

    const resultado = await sync.enviar()

    expect(httpClient.post).toHaveBeenCalledWith(
      '/v1/expedicoes/4/eventos',
      expect.objectContaining({ client_uuid: 'evt-local' }),
    )
    expect(httpClient.postForm).toHaveBeenCalledWith(
      '/v1/eventos/10/evidencias',
      expect.any(FormData),
    )
    expect(resultado).toEqual({ enviados: 2, erros: 0 })
    expect(store.snapshot().midias[0].alvo).toEqual(expect.objectContaining({ evento_id: 10 }))
  })

  it('liga de novo a mídia se o evento já subiu e o arquivo ficou sem evento_id', async () => {
    const store = criarStore(pendenciasComColeta({
      eventos: [{
        local_id: 'evt-local',
        seq: 1,
        status: 'sent',
        remote_id: 10,
        criado_em: '2026-11-03T12:00:00.000Z',
        expedicao_id: 4,
        payload: payloadEvento,
      }],
    }))
    const httpClient = criarHttpClient()
    const sync = new SyncService(httpClient as any, store as any)

    const resultado = await sync.enviar()

    expect(httpClient.post).not.toHaveBeenCalled()
    expect(httpClient.postForm).toHaveBeenCalledWith(
      '/v1/eventos/10/evidencias',
      expect.any(FormData),
    )
    expect(resultado).toEqual({ enviados: 1, erros: 0 })
  })

  it('não marca a mídia como enviada quando o pai ainda não tem id na API', async () => {
    const store = criarStore(pendenciasComColeta({ eventos: [] }))
    const httpClient = criarHttpClient()
    const sync = new SyncService(httpClient as any, store as any)

    const resultado = await sync.enviar()

    expect(httpClient.postForm).not.toHaveBeenCalled()
    expect(resultado).toEqual({ enviados: 0, erros: 0 })
    expect(store.snapshot().midias[0].status).toBe('pending')
  })
})

describe('SyncService.limparEnviados', () => {
  it('mantém o evento sent enquanto a mídia dele ainda não subiu', async () => {
    const store = criarStore(pendenciasComColeta({
      eventos: [{
        local_id: 'evt-local',
        seq: 1,
        status: 'sent',
        remote_id: 10,
        criado_em: '2026-11-03T12:00:00.000Z',
        expedicao_id: 4,
        payload: payloadEvento,
      }],
    }))
    const sync = new SyncService(criarHttpClient() as any, store as any)

    await sync.limparEnviados()

    expect(store.snapshot().eventos).toHaveLength(1)
    expect(store.snapshot().midias).toHaveLength(1)
  })
})
