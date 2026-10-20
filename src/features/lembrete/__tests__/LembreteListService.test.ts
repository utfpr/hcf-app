
import type { HttpClient } from '@/libraries/http/HttpClient'
import { LembreteListService } from '../LembreteListService'

describe('LembreteListService', () => {
  it('deve buscar os lembtes com os filtros corretos', async () => {
    const resposta = {
      itens: [],
      total: 0,
      limite: 10,
      pagina: 1,
    }

    const get = jest.fn().mockResolvedValue({
      data: resposta,
    })

    const httpClient = { get } as unknown as HttpClient
    const service = new LembreteListService(httpClient)

    const filtros = {
      limite: 10,
      pagina: 1,
      order: 'data_coleta:asc' as const,
    }

    const resultado = await service.listar(filtros)

    expect(get).toHaveBeenCalledWith(
      '/v2/lembretes',
      filtros,
    )

    expect(resultado).toEqual(resposta)
  })

  it('deve propagar erros da API', async () => {
    const get = jest.fn().mockRejectedValue(
      new Error('API indisponível'),
    )

    const httpClient = { get } as unknown as HttpClient
    const service = new LembreteListService(httpClient)

    await expect(service.listar()).rejects.toThrow(
      'API indisponível',
    )
  })
})
