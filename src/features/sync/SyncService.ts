import { EventoService } from '@/features/evento/EventoService'
import { ExpedicaoService } from '@/features/expedition/ExpedicaoService'
import type { ExpedicaoListItem, Paginacao } from '@/features/expedition/types'
import { LembreteListService } from '@/features/lembrete/LembreteListService'
import { LembreteService } from '@/features/lembrete/LembreteService'
import type { OfflineStore } from '@/features/offline/OfflineStore'
import type { Pendencias, StatusPendencia } from '@/features/offline/types'
import type { HttpClient } from '@/libraries/http/HttpClient'
import { getHttpStatus, getUserFacingHttpError, isNetworkError } from '@/libraries/http/httpError'

// Página grande: a baixa percorre tudo de uma vez
const LIMITE_PAGINA = 100
const SILENCIOSO = { silencioso: true }

export interface ResultadoEnvio {
  enviados: number
  erros: number
}

export interface ProgressoEnvio {
  feitos: number
  total: number
}

/** Caiu a conexão ou a sessão venceu no meio: o que faltou continua pendente */
export class EnvioInterrompidoError extends Error {
  constructor(message: string, readonly sessaoExpirada = false) {
    super(message)
    this.name = 'EnvioInterrompidoError'
  }
}

type Lista = 'eventos' | 'midias' | 'lembretes'

interface Parcial {
  status: StatusPendencia
  erro?: string
  remote_id?: number
}

async function todasPaginas<T>(buscar: (pagina: number) => Promise<Paginacao<T>>): Promise<T[]> {
  const itens: T[] = []
  for (let pagina = 1; ; pagina++) {
    const resultado = await buscar(pagina)
    itens.push(...resultado.itens)
    if (resultado.itens.length === 0 || resultado.pagina * resultado.limite >= resultado.total) break
  }
  return itens
}

/**
 * Sincronização do aparelho com a API.
 * - enviar(): sobe o que foi criado offline, sempre com client_uuid (reenviar não duplica).
 * - baixar(): traz expedições (criadas no web), registros e lembretes para o cache.
 * - limparEnviados(): depois de uma baixa, descarta as pendências que já estão no cache.
 */
export class SyncService {
  private readonly eventos: EventoService

  private readonly expedicoes: ExpedicaoService

  private readonly lembretes: LembreteService

  private readonly listaLembretes: LembreteListService

  constructor(httpClient: HttpClient, private readonly store: OfflineStore) {
    this.eventos = new EventoService(httpClient)
    this.expedicoes = new ExpedicaoService(httpClient)
    this.lembretes = new LembreteService(httpClient)
    this.listaLembretes = new LembreteListService(httpClient)
  }

  // ---------- App → API ----------

  async enviar(
    filtro: { expedicaoId?: number } = {},
    onProgresso?: (progresso: ProgressoEnvio) => void,
  ): Promise<ResultadoEnvio> {
    const resultado: ResultadoEnvio = { enviados: 0, erros: 0 }
    const daExpedicao = (expedicaoId: number) => filtro.expedicaoId === undefined || filtro.expedicaoId === expedicaoId
    let pendencias = await this.store.pendencias()

    // Mídia de lembrete herda a expedição do lembrete a que pertence
    const lembreteDaExpedicao = (lembrete: Pendencias['lembretes'][number]) => (
      filtro.expedicaoId === undefined || lembrete.payload.expedicao_id === filtro.expedicaoId
    )
    const midiaElegivel = (midia: Pendencias['midias'][number]) => {
      if (midia.status === 'sent') return false
      if (midia.alvo.tipo === 'evento') return daExpedicao(midia.alvo.expedicao_id)
      const { lembrete_id: lembreteId, lembrete_local_id: lembreteLocalId } = midia.alvo
      const pai = pendencias.lembretes.find(lembrete => (
        (lembreteLocalId !== undefined && lembrete.local_id === lembreteLocalId)
        || (lembreteId !== undefined && lembrete.remote_id === lembreteId)
      ))
      // Sem o lembrete pendente (já enviado antes): só no envio geral
      return pai ? lembreteDaExpedicao(pai) : filtro.expedicaoId === undefined
    }

    // Total contado no início, para a tela mostrar "Enviando 3 de 12…"
    const total = pendencias.eventos.filter(evento => evento.status !== 'sent' && daExpedicao(evento.expedicao_id)).length
      + pendencias.lembretes.filter(lembrete => lembrete.status !== 'sent' && lembreteDaExpedicao(lembrete)).length
      + pendencias.midias.filter(midiaElegivel).length
    let feitos = 0
    const avancar = () => onProgresso?.({ feitos: ++feitos, total })
    onProgresso?.({ feitos, total })

    // 1. Eventos: os filhos (mídia) precisam do id que a API devolve
    for (const evento of pendencias.eventos) {
      if (evento.status === 'sent' || !daExpedicao(evento.expedicao_id)) continue
      await this.tentar(resultado, 'eventos', evento.local_id, async () => {
        const criado = await this.eventos.criar(evento.expedicao_id, { ...evento.payload, client_uuid: evento.local_id })
        await this.ligarFilhos('evento', evento.local_id, criado.id)
        return criado.id
      })
      avancar()
    }

    // 2. Lembretes: no envio de uma expedição, só os criados nela
    pendencias = await this.store.pendencias()
    for (const lembrete of pendencias.lembretes) {
      if (lembrete.status === 'sent' || !lembreteDaExpedicao(lembrete)) continue
      await this.tentar(resultado, 'lembretes', lembrete.local_id, async () => {
        const criado = await this.lembretes.criar({ ...lembrete.payload, client_uuid: lembrete.local_id })
        await this.ligarFilhos('lembrete', lembrete.local_id, criado.id)
        return criado.id
      })
      avancar()
    }

    // 3. Mídia: só sobe quando o pai já tem id na API; senão espera a próxima vez
    pendencias = await this.store.pendencias()
    for (const midia of pendencias.midias) {
      if (!midiaElegivel(midia)) continue

      const alvoId = midia.alvo.tipo === 'evento' ? midia.alvo.evento_id : midia.alvo.lembrete_id
      if (!alvoId) {
        avancar()
        continue
      }

      await this.tentar(resultado, 'midias', midia.local_id, async () => {
        if (!(await this.store.midiaExiste(midia.payload.arquivo))) {
          throw new Error('Arquivo não encontrado no aparelho.')
        }
        const payload = { ...midia.payload, client_uuid: midia.local_id }
        const enviada = midia.alvo.tipo === 'evento'
          ? await this.eventos.enviarEvidencia(alvoId, payload)
          : await this.lembretes.enviarEvidencia(alvoId, payload)
        return enviada.id
      })
      avancar()
    }

    return resultado
  }

  /**
   * Erro de rede ou sessão vencida interrompem tudo (o item fica pendente);
   * recusa da API marca só aquele item como erro e o envio segue.
   */
  private async tentar(
    resultado: ResultadoEnvio,
    lista: Lista,
    localId: string,
    enviar: () => Promise<number>,
  ): Promise<void> {
    try {
      const remoteId = await enviar()
      await this.marcar(lista, localId, { status: 'sent', remote_id: remoteId, erro: undefined })
      resultado.enviados += 1
    } catch (error) {
      if (isNetworkError(error)) {
        throw new EnvioInterrompidoError('A conexão caiu durante a sincronização. O que faltou continua salvo no aparelho.')
      }
      if (getHttpStatus(error) === 401) {
        throw new EnvioInterrompidoError('Sua sessão expirou. Entre novamente para terminar a sincronização.', true)
      }
      const mensagem = error instanceof Error && !getHttpStatus(error)
        ? error.message
        : getUserFacingHttpError(error, 'A API recusou este item.')
      await this.marcar(lista, localId, { status: 'error', erro: mensagem })
      resultado.erros += 1
    }
  }

  private async marcar(lista: Lista, localId: string, parcial: Parcial): Promise<void> {
    await this.store.atualizarPendencias(atual => ({
      ...atual,
      [lista]: (atual[lista] as Array<{ local_id: string }>).map(item => (
        item.local_id === localId ? { ...item, ...parcial } : item
      )),
    }) as Pendencias)
  }

  /** O pai ganhou id na API: a mídia dele passa a apontar para esse id */
  private async ligarFilhos(tipo: 'evento' | 'lembrete', localId: string, remoteId: number): Promise<void> {
    await this.store.atualizarPendencias(atual => ({
      ...atual,
      midias: atual.midias.map(midia => {
        if (tipo === 'evento' && midia.alvo.tipo === 'evento' && midia.alvo.evento_local_id === localId) {
          return { ...midia, alvo: { ...midia.alvo, evento_id: remoteId } }
        }
        if (tipo === 'lembrete' && midia.alvo.tipo === 'lembrete' && midia.alvo.lembrete_local_id === localId) {
          return { ...midia, alvo: { ...midia.alvo, lembrete_id: remoteId } }
        }
        return midia
      }),
    }))
  }

  // ---------- API → App ----------

  // baixar() e limparEnviados() gravam vários arquivos em silêncio; quem chama
  // avisa as telas uma vez no fim (store.avisarMudanca()), senão cada gravação
  // faria a Home reler e re-renderizar no meio da baixa

  async baixar(): Promise<void> {
    const usuarioId = this.store.usuarioId
    const itens = await todasPaginas(pagina => this.expedicoes.listar({ pagina, limite: LIMITE_PAGINA, order: 'id:desc' }))
    const minhas = (await todasPaginas(pagina => this.expedicoes.listar({
      pagina,
      limite: LIMITE_PAGINA,
      usuario_id: usuarioId,
    }))).map(item => item.id)

    const anterior = await this.store.lerExpedicoes()
    const pendencias = await this.store.pendencias()
    const comPendencia = new Set<number>([
      ...pendencias.eventos.map(evento => evento.expedicao_id),
      ...pendencias.midias.flatMap(midia => (midia.alvo.tipo === 'evento' ? [midia.alvo.expedicao_id] : [])),
    ])
    const existentes = new Set(itens.map(item => item.id))

    // Apagada no web mas com coisa do aparelho: continua visível, e o envio vai mostrar o erro
    const orfas: ExpedicaoListItem[] = anterior.itens.filter(item => !existentes.has(item.id) && comPendencia.has(item.id))

    const detalhadas: number[] = []
    for (const id of new Set([...minhas, ...comPendencia, ...anterior.detalhadas])) {
      if (!existentes.has(id)) {
        if (comPendencia.has(id)) detalhadas.push(id)
        else await this.store.removerExpedicao(id, SILENCIOSO)
        continue
      }
      const detalhe = await this.expedicoes.buscarPorId(id)
      const registros = await this.eventos.listarRegistros(id)
      await this.store.gravarDetalhe(detalhe, SILENCIOSO)
      await this.store.gravarRegistros(id, registros, SILENCIOSO)
      detalhadas.push(id)
    }

    await this.store.gravarExpedicoes({ itens: [...itens, ...orfas], minhas, detalhadas }, SILENCIOSO)

    const lembretes = await todasPaginas(pagina => this.listaLembretes.listar({ pagina, limite: LIMITE_PAGINA }))
    await this.store.gravarLembretes(lembretes, SILENCIOSO)

    await this.store.atualizarMeta({ ultima_baixa: new Date().toISOString() }, SILENCIOSO)
  }

  /** Só depois de uma baixa bem-sucedida: o que foi enviado já está no cache */
  async limparEnviados(): Promise<void> {
    const pendencias = await this.store.pendencias()
    const enviadas = pendencias.midias.filter(midia => midia.status === 'sent')

    await this.store.atualizarPendencias(atual => ({
      ...atual,
      eventos: atual.eventos.filter(evento => evento.status !== 'sent'),
      midias: atual.midias.filter(midia => midia.status !== 'sent'),
      lembretes: atual.lembretes.filter(lembrete => lembrete.status !== 'sent'),
    }), SILENCIOSO)

    await Promise.all(enviadas.map(midia => this.store.apagarMidia(midia.payload.arquivo).catch(() => undefined)))
  }
}
