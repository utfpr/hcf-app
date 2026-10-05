import { LembreteService } from './LembreteService'

describe('LembreteService', () => {
  const httpClient = {
    get: jest.fn(),
    post: jest.fn(),
    postForm: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  }

  const service = new LembreteService(httpClient as any)

  beforeEach(() => jest.clearAllMocks())

  it('creates the reminder and returns the saved entity', async () => {
    const payload = {
      data_coleta: '2026-11-20',
      local_coleta: 'Trilha da cachoeira',
      familia: 'Myrtaceae',
      nome_cientifico: 'Eugenia uniflora',
    }
    const lembrete = { id: 1, ...payload }
    httpClient.post.mockResolvedValue({ data: lembrete })

    const result = await service.criar(payload)

    expect(httpClient.post).toHaveBeenCalledWith('/v2/lembretes', payload)
    expect(result).toEqual(lembrete)
  })
})
