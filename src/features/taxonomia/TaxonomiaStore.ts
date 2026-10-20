import type { HttpClient } from '@/libraries/http/HttpClient'
import { JsonFileStore } from '@/libraries/storage/JsonFileStore'

import { FamiliaService } from './FamiliaService'
import type { Familia } from './types'

export interface CacheFamilias {
  itens: Familia[]
  atualizado_em: string | null
}

const FAMILIAS = 'taxonomia/familias.json'
const VAZIO: CacheFamilias = { itens: [], atualizado_em: null }

// Taxonomia é a mesma para todos os usuários: fica fora da pasta do usuário e
// não é apagada no logout
const arquivos = new JsonFileStore('global')

export const taxonomiaStore = {
  lerFamilias(): Promise<CacheFamilias> {
    return arquivos.ler(FAMILIAS, VAZIO)
  },

  aoMudar(ouvinte: () => void): () => void {
    return arquivos.aoMudar(ouvinte)
  },

  /** Baixa todas as famílias da API (API → app) e substitui as do aparelho */
  async importar(httpClient: HttpClient): Promise<CacheFamilias> {
    const itens = await new FamiliaService(httpClient).baixarTodas()
    const cache = { itens, atualizado_em: new Date().toISOString() }
    await arquivos.gravar(FAMILIAS, cache)
    return cache
  },
}

function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

/** Mesmo critério da API (trecho do nome, sem diferenciar maiúsculas), e também ignora acentos */
export function buscarFamilias(familias: Familia[], termo: string, limite: number): Familia[] {
  const busca = normalizar(termo.trim())
  return familias
    .filter(familia => normalizar(familia.nome).includes(busca))
    .sort((a, b) => {
      // Quem começa com o termo vem primeiro
      const inicioA = normalizar(a.nome).startsWith(busca) ? 0 : 1
      const inicioB = normalizar(b.nome).startsWith(busca) ? 0 : 1
      return inicioA - inicioB || a.nome.localeCompare(b.nome)
    })
    .slice(0, limite)
}
