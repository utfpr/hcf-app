import type { HttpClient } from '@/libraries/http/HttpClient'

import type {
  AtualizarExpedicaoPayload,
  CriarExpedicaoPayload,
  Expedicao,
  ExpedicaoListItem,
  FiltrosExpedicao,
  Paginacao,
} from './types'

export class ExpedicaoService {
  constructor(private readonly httpClient: HttpClient) {}

  async listar(filtros: FiltrosExpedicao = {}): Promise<Paginacao<ExpedicaoListItem>> {
    const response = await this.httpClient.get<Paginacao<ExpedicaoListItem>>(
      '/v2/expedicoes',
      filtros,
    )
    return response.data
  }

  async buscarPorId(expedicaoId: number): Promise<Expedicao> {
    const response = await this.httpClient.get<Expedicao>(`/v2/expedicoes/${expedicaoId}`)
    return response.data
  }

  async criar(payload: CriarExpedicaoPayload): Promise<Expedicao> {
    const response = await this.httpClient.post<Expedicao>('/v2/expedicoes', payload)
    return response.data
  }

  async atualizar(expedicaoId: number, payload: AtualizarExpedicaoPayload): Promise<Expedicao> {
    const response = await this.httpClient.put<Expedicao>(
      `/v2/expedicoes/${expedicaoId}`,
      payload,
    )
    return response.data
  }

  async excluir(expedicaoId: number): Promise<void> {
    await this.httpClient.delete<void>(`/v2/expedicoes/${expedicaoId}`)
  }
}
