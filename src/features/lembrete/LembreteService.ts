import type { CriarEvidenciaPayload } from '@/features/evento/types'
import type { HttpClient } from '@/libraries/http/HttpClient'

import type { CriarLembretePayload, Lembrete, LembreteEvidencia } from './types'

export interface LembreteSalvo {
  lembrete: Lembrete
  evidencias: LembreteEvidencia[]
}

export class LembreteService {
  constructor(private readonly httpClient: HttpClient) {}

  async criar(payload: CriarLembretePayload): Promise<Lembrete> {
    const response = await this.httpClient.post<Lembrete>('/v2/lembretes', payload)
    return response.data
  }

  async excluir(lembreteId: number): Promise<void> {
    await this.httpClient.delete<void>(`/v2/lembretes/${lembreteId}`)
  }

  async enviarEvidencia(lembreteId: number, payload: CriarEvidenciaPayload): Promise<LembreteEvidencia> {
    const form = new FormData()
    form.append('nome', payload.nome)
    form.append('capturado_em', payload.capturado_em)
    // O arquivo vai por último: o multer da API lê os campos de texto antes do arquivo.
    form.append('arquivo', payload.arquivo as unknown as Blob)

    const response = await this.httpClient.postForm<LembreteEvidencia>(
      `/v2/lembretes/${lembreteId}/evidencias`,
      form,
    )
    return response.data
  }

  // Cria o lembrete e envia a multimídia dele. Se algum envio falhar, o lembrete
  // é removido (junto com as evidências já enviadas) para que tentar de novo
  // não gere um lembrete duplicado.
  async registrar(
    payload: CriarLembretePayload,
    evidencias: CriarEvidenciaPayload[],
  ): Promise<LembreteSalvo> {
    const lembrete = await this.criar(payload)

    try {
      const enviadas: LembreteEvidencia[] = []
      for (const evidencia of evidencias) {
        enviadas.push(await this.enviarEvidencia(lembrete.id, evidencia))
      }
      return { lembrete, evidencias: enviadas }
    } catch (error) {
      await this.excluir(lembrete.id).catch(() => {})
      throw error
    }
  }
}
