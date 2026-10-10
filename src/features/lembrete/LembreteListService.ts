
import type { HttpClient } from '@/libraries/http/HttpClient'

import type {
  FiltrosLembrete,
  PaginacaoLembretes,
} from './types'

export class LembreteListService {
  constructor(private readonly httpClient: HttpClient) {}

  async listar(
    filtros: FiltrosLembrete = {},
  ): Promise<PaginacaoLembretes> {
    const response =
      await this.httpClient.get<PaginacaoLembretes>(
        '/v2/lembretes',
        filtros,
      )

    return response.data
  }
}
