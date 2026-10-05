import type { Paginacao } from '@/features/expedition/types'
import type { HttpClient } from '@/libraries/http/HttpClient'

import type {
  CriarEventoPayload,
  CriarEvidenciaPayload,
  Evento,
  Evidencia,
  RegistroExpedicao,
} from './types'

// A tela de detalhes mostra todos os registros de uma vez; acima disso será preciso paginar
const LIMITE_REGISTROS = 100

export interface RegistroSalvo {
  evento: Evento
  evidencias: Evidencia[]
}

export class EventoService {
  constructor(private readonly httpClient: HttpClient) {}

  async criar(expedicaoId: number, payload: CriarEventoPayload): Promise<Evento> {
    const response = await this.httpClient.post<Evento>(
      `/v2/expedicoes/${expedicaoId}/eventos`,
      payload,
    )
    return response.data
  }

  async listar(expedicaoId: number): Promise<Paginacao<Evento>> {
    const response = await this.httpClient.get<Paginacao<Evento>>(
      `/v2/expedicoes/${expedicaoId}/eventos`,
      { limite: LIMITE_REGISTROS },
    )
    return response.data
  }

  async listarEvidencias(eventoId: number): Promise<Evidencia[]> {
    const response = await this.httpClient.get<Evidencia[]>(`/v2/eventos/${eventoId}/evidencias`)
    return response.data
  }

  // Eventos da expedição (mais recentes primeiro) com as evidências de cada um
  async listarRegistros(expedicaoId: number): Promise<RegistroExpedicao[]> {
    const { itens } = await this.listar(expedicaoId)
    return Promise.all(
      itens.map(async evento => ({
        ...evento,
        evidencias: await this.listarEvidencias(evento.id),
      })),
    )
  }

  async excluir(eventoId: number): Promise<void> {
    await this.httpClient.delete<void>(`/v2/eventos/${eventoId}`)
  }

  async enviarEvidencia(eventoId: number, payload: CriarEvidenciaPayload): Promise<Evidencia> {
    const form = new FormData()
    form.append('nome', payload.nome)
    form.append('capturado_em', payload.capturado_em)
    // O arquivo vai por último: o multer da API lê os campos de texto antes do arquivo.
    form.append('arquivo', payload.arquivo as unknown as Blob)

    const response = await this.httpClient.postForm<Evidencia>(
      `/v2/eventos/${eventoId}/evidencias`,
      form,
    )
    return response.data
  }

  // Cria o evento e envia as evidências dele. Se algum envio falhar, o evento
  // é removido (junto com as evidências já enviadas) para que tentar de novo
  // não gere um registro duplicado.
  async registrar(
    expedicaoId: number,
    payload: CriarEventoPayload,
    evidencias: CriarEvidenciaPayload[],
  ): Promise<RegistroSalvo> {
    const evento = await this.criar(expedicaoId, payload)

    try {
      const enviadas: Evidencia[] = []
      for (const evidencia of evidencias) {
        enviadas.push(await this.enviarEvidencia(evento.id, evidencia))
      }
      return { evento, evidencias: enviadas }
    } catch (error) {
      await this.excluir(evento.id).catch(() => {})
      throw error
    }
  }
}
