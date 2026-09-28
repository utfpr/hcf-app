import { getUserFacingHttpError } from '@/libraries/http/httpError'

import { ExpedicaoService } from './ExpedicaoService'

const expedition = {
  id: 4,
  descricao: 'Coleta de campo',
  data_inicio: '2026-09-24',
  data_fim: '2026-09-25',
  cidade_id: 7,
  created_at: '2026-09-01T00:00:00.000Z',
  updated_at: '2026-09-01T00:00:00.000Z',
  created_by: 1,
  updated_by: 1,
}

describe('ExpedicaoService', () => {
  const httpClient = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  }

  const service = new ExpedicaoService(httpClient as any)

  beforeEach(() => jest.clearAllMocks())

  it('lists expeditions with the backend filters and pagination response', async () => {
    const response = { itens: [{ ...expedition, participantes: [], rotas: [] }], total: 1, limite: 20, pagina: 1 }
    httpClient.get.mockResolvedValue({ data: response })

    await expect(service.listar({ cidade_id: 7, pagina: 1, limite: 20 })).resolves.toEqual(response)
    expect(httpClient.get).toHaveBeenCalledWith('/v2/expedicoes', { cidade_id: 7, pagina: 1, limite: 20 })
  })

  it('uses the correct routes for detail and CRUD operations', async () => {
    httpClient.get.mockResolvedValue({ data: expedition })
    httpClient.post.mockResolvedValue({ data: expedition })
    httpClient.put.mockResolvedValue({ data: expedition })
    httpClient.delete.mockResolvedValue({ data: undefined })
    const create = { descricao: null, data_inicio: '2026-09-24', data_fim: '2026-09-25', cidade_id: 7, created_by: 1, participantes: [1], rotas: [3] }
    const update = { descricao: null, data_inicio: '2026-09-24', data_fim: '2026-09-25', cidade_id: 7, updated_by: 1 }

    await service.buscarPorId(4)
    await service.criar(create)
    await service.atualizar(4, update)
    await service.excluir(4)

    expect(httpClient.get).toHaveBeenCalledWith('/v2/expedicoes/4')
    expect(httpClient.post).toHaveBeenCalledWith('/v2/expedicoes', create)
    expect(httpClient.put).toHaveBeenCalledWith('/v2/expedicoes/4', update)
    expect(httpClient.delete).toHaveBeenCalledWith('/v2/expedicoes/4')
  })
})

describe('getUserFacingHttpError', () => {
  it('uses the API message and gives a useful offline message', () => {
    expect(getUserFacingHttpError({ isAxiosError: true, response: { data: { message: 'Expedição não encontrada' } } })).toBe('Expedição não encontrada')
    expect(getUserFacingHttpError({ isAxiosError: true })).toBe('Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.')
  })
})
