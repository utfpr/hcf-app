import type { HttpClient } from '@/libraries/http/HttpClient'

import type { Familia, ListagemFamilias } from './types'

// Sugestões enquanto o usuário digita: poucas bastam, a busca vai afunilando
export const LIMITE_SUGESTOES = 10

// Importação completa para o aparelho: páginas grandes, poucas requisições
const LIMITE_IMPORTACAO = 500

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

  /** Todas as famílias, página a página, para guardar no aparelho e buscar offline */
  async baixarTodas(): Promise<Familia[]> {
    const familias: Familia[] = []
    for (let pagina = 1; ; pagina++) {
      const response = await this.httpClient.get<ListagemFamilias>('/familias', {
        pagina,
        limite: LIMITE_IMPORTACAO,
      })
      const { metadados, resultado } = response.data
      familias.push(...resultado)
      if (resultado.length === 0 || metadados.pagina * metadados.limite >= metadados.total) break
    }
    return familias
  }
}
