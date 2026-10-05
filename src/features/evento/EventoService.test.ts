import { EventoService } from './EventoService'

const evento = {
  id: 10,
  expedicao_id: 4,
  tipo: 'COLETA',
  capturado_em: '2026-09-28T12:00:00.000Z',
  latitude: -25.4284,
  longitude: -49.2733,
  altitude: null,
  observacoes: null,
  coleta: null,
  created_at: '2026-09-28T12:00:00.000Z',
  updated_at: '2026-09-28T12:00:00.000Z',
  created_by: null,
  updated_by: null,
}

const payload = {
  tipo: 'COLETA' as const,
  capturado_em: '2026-09-28T12:00:00.000Z',
  latitude: -25.4284,
  longitude: -49.2733,
  observacoes: 'Próximo ao rio',
  coleta: { familia: 'Myrtaceae', nome_cientifico: 'Eugenia uniflora' },
}

const imagem = {
  arquivo: { uri: 'file:///foto.jpg', name: 'foto.jpg', type: 'image/jpeg' },
  nome: 'foto.jpg',
  capturado_em: '2026-09-28T12:01:00.000Z',
}

describe('EventoService', () => {
  const httpClient = {
    get: jest.fn(),
    post: jest.fn(),
    postForm: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  }

  const service = new EventoService(httpClient as any)

  beforeEach(() => jest.clearAllMocks())

  it('creates the event under the expedition and uploads each evidence as multipart', async () => {
    httpClient.post.mockResolvedValue({ data: evento })
    httpClient.postForm.mockResolvedValue({ data: { id: 1, evento_id: 10 } })

    const result = await service.registrar(4, payload, [imagem])

    expect(httpClient.post).toHaveBeenCalledWith('/v2/expedicoes/4/eventos', payload)
    expect(httpClient.postForm).toHaveBeenCalledWith('/v2/eventos/10/evidencias', expect.any(FormData))
    expect(result).toEqual({ evento, evidencias: [{ id: 1, evento_id: 10 }] })
  })

  it('lists the expedition events together with the evidences of each one', async () => {
    const evidencia = { id: 1, evento_id: 10, url: '/uploads/evidencias/foto.jpg' }
    httpClient.get
      .mockResolvedValueOnce({ data: { itens: [evento], total: 1, limite: 100, pagina: 1 } })
      .mockResolvedValueOnce({ data: [evidencia] })

    await expect(service.listarRegistros(4)).resolves.toEqual([{ ...evento, evidencias: [evidencia] }])
    expect(httpClient.get).toHaveBeenCalledWith('/v2/expedicoes/4/eventos', { limite: 100 })
    expect(httpClient.get).toHaveBeenCalledWith('/v2/eventos/10/evidencias')
  })

  it('removes the event when an evidence upload fails, so retrying does not duplicate it', async () => {
    const uploadError = new Error('Tipo de arquivo não suportado')
    httpClient.post.mockResolvedValue({ data: evento })
    httpClient.postForm.mockRejectedValue(uploadError)
    httpClient.delete.mockResolvedValue({ data: undefined })

    await expect(service.registrar(4, payload, [imagem])).rejects.toBe(uploadError)
    expect(httpClient.delete).toHaveBeenCalledWith('/v2/eventos/10')
  })
})
