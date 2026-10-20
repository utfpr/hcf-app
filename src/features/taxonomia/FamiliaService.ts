import type { HttpClient } from '@/libraries/http/HttpClient'

import type { Familia, ListagemFamilias } from './types'

// Sugestões enquanto o usuário digita: poucas bastam, a busca vai afunilando
const LIMITE_SUGESTOES = 10

export class FamiliaService {
  constructor(private readonly httpClient: HttpClient) {}

  // A API filtra por trecho do nome, sem diferenciar maiúsculas (ILIKE '%nome%'),
  // e ordena por nome
  async buscar(nome: string, limite = LIMITE_SUGESTOES): Promise<Familia[]> {
    const response = await this.httpClient.get<ListagemFamilias>('/familias', {
      familia: nome,
      limite,
    })
    return response.data.resultado
  }
}
