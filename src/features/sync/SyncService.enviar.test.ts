import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'

import type { Pendencias } from '@/features/offline/types'

import { SyncService } from './SyncService'

function erroHttp(status: number, message: string) {
  const config = { headers: {} } as InternalAxiosRequestConfig
  const response = { status, data: { error: { code: status, message } }, config, headers: {}, statusText: '' } as AxiosResponse
  return new AxiosError('Request failed', AxiosError.ERR_BAD_REQUEST, config, null, response)
}

const evento = (localId: string, expedicaoId: number, seq: number) => ({
  local_id: localId,
  seq,
  status: 'pending' as const,
  criado_em: '2026-11-09T10:00:00.000Z',
  expedicao_id: expedicaoId,
  payload: { tipo: 'DIARIO' as const, data_captura: '2026-11-09T10:00:00.000Z' },
})

function criarStore(inicial: Pendencias) {
  let pendencias = inicial
  return {
    usuarioId: 14,
    get atual() { return pendencias },
    pendencias: jest.fn(async () => pendencias),
    atualizarPendencias: jest.fn(async (alterar: (atual: Pendencias) => Pendencias) => {
      pendencias = alterar(pendencias)
    }),
    midiaExiste: jest.fn(async () => true),
  }
}

describe('SyncService.enviar', () => {
  it('marca como erro o item recusado com 403 e segue com o resto', async () => {
    const store = criarStore({
      proximo_seq: 4,
      eventos: [evento('fora', 3, 1), evento('dentro', 5, 2)],
      midias: [],
      lembretes: [{
        local_id: 'lembrete',
        seq: 3,
        status: 'pending',
        criado_em: '2026-11-09T10:00:00.000Z',
        payload: { data_coleta: '2026-11-09', local_coleta: 'Trilha' },
      }],
    })
    const httpClient = {
      post: jest.fn(async (url: string) => {
        if (url === '/v1/expedicoes/3/eventos') throw erroHttp(403, 'Você não participa desta expedição')
        if (url === '/v1/expedicoes/5/eventos') return { data: { id: 70 } }
        if (url === '/v1/lembretes') return { data: { id: 80 } }
        throw new Error(`rota inesperada: ${url}`)
      }),
    }
    const sync = new SyncService(httpClient as any, store as any)

    const resultado = await sync.enviar()

    expect(resultado).toEqual({ enviados: 2, erros: 1 })
    expect(store.atual.eventos).toEqual([
      expect.objectContaining({ local_id: 'fora', status: 'error', erro: 'Você não participa desta expedição' }),
      expect.objectContaining({ local_id: 'dentro', status: 'sent', remote_id: 70 }),
    ])
    expect(store.atual.lembretes).toEqual([
      expect.objectContaining({ local_id: 'lembrete', status: 'sent', remote_id: 80 }),
    ])
  })
})
