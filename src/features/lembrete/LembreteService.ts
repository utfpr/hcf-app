import type { HttpClient } from '@/libraries/http/HttpClient'

import type { CriarLembretePayload, Lembrete } from './types'

export class LembreteService {
  constructor(private readonly httpClient: HttpClient) {}

  async criar(payload: CriarLembretePayload): Promise<Lembrete> {
    const response = await this.httpClient.post<Lembrete>('/v2/lembretes', payload)
    return response.data
  }

  async listar(): Promise<Lembrete[]> {
    const response = await this.httpClient.get<any>('/v2/lembretes')
    const data = response.data

    if (Array.isArray(data)) {
      return data
    }

    return data?.itens ?? data?.items ?? data?.dados ?? data?.lembretes ?? []
  }
}
