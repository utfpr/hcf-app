import { FamiliaService } from './FamiliaService'

describe('FamiliaService', () => {
  const httpClient = {
    get: jest.fn(),
  }

  const service = new FamiliaService(httpClient as any)

  beforeEach(() => jest.clearAllMocks())

  it('busca famílias pelo trecho do nome e devolve só a lista', async () => {
    const familias = [{ id: 3, nome: 'Myrtaceae' }]
    httpClient.get.mockResolvedValue({
      data: { metadados: { total: 1, pagina: 1, limite: 10 }, resultado: familias },
    })

    const resultado = await service.buscar('myrt')

    expect(httpClient.get).toHaveBeenCalledWith('/familias', { familia: 'myrt', limite: 10 })
    expect(resultado).toEqual(familias)
  })

  it('repassa o erro da API', async () => {
    httpClient.get.mockRejectedValue(new Error('Network Error'))

    await expect(service.buscar('myrt')).rejects.toThrow('Network Error')
  })
})
