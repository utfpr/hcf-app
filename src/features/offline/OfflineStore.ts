import { copyFile, exists, mkdir, unlink } from '@dr.pogodin/react-native-fs'

import type {
  ArquivoLocal,
  CriarEventoPayload,
  CriarEvidenciaPayload,
  RegistroExpedicao,
} from '@/features/evento/types'
import type { ExpedicaoDetalhe } from '@/features/expedition/types'
import type { CriarLembretePayload, Lembrete } from '@/features/lembrete/types'
import { JsonFileStore } from '@/libraries/storage/JsonFileStore'
import { uuid } from '@/libraries/storage/uuid'

import type {
  AlvoMidia,
  CacheExpedicoes,
  EventoPendente,
  LembretePendente,
  MetaOffline,
  MidiaPendente,
  Pendencias,
} from './types'

const PENDENCIAS = 'pendencias.json'
const EXPEDICOES = 'cache/expedicoes.json'
const LEMBRETES = 'cache/lembretes.json'
const META = 'meta.json'

const PENDENCIAS_VAZIAS: Pendencias = { proximo_seq: 1, eventos: [], midias: [], lembretes: [] }
const EXPEDICOES_VAZIAS: CacheExpedicoes = { itens: [], minhas: [], detalhadas: [] }
const META_VAZIA: MetaOffline = { ultima_sincronizacao: null, ultima_baixa: null }

const detalheArquivo = (expedicaoId: number) => `cache/expedicao-${expedicaoId}.json`
const registrosArquivo = (expedicaoId: number) => `cache/registros-${expedicaoId}.json`

function semEsquema(uri: string): string {
  return uri.replace(/^file:\/\//, '')
}

function extensao(arquivo: ArquivoLocal): string {
  const match = /\.[a-z0-9]+$/i.exec(arquivo.name)
  return match ? match[0].toLowerCase() : ''
}

export function contarPendentes(pendencias: Pendencias): number {
  return [...pendencias.eventos, ...pendencias.midias, ...pendencias.lembretes]
    .filter(item => item.status !== 'sent')
    .length
}

/**
 * Tudo o que o app guarda do usuário: o que ele criou e ainda não subiu
 * (pendências) e o que veio da API (cache). Uma pasta por usuário, apagada no logout.
 */
export class OfflineStore {
  private readonly arquivos: JsonFileStore

  constructor(readonly usuarioId: number) {
    this.arquivos = new JsonFileStore(`usuarios/${usuarioId}`)
  }

  aoMudar(ouvinte: () => void): () => void {
    return this.arquivos.aoMudar(ouvinte)
  }

  // ---------- Pendências ----------

  pendencias(): Promise<Pendencias> {
    return this.arquivos.ler(PENDENCIAS, PENDENCIAS_VAZIAS)
  }

  atualizarPendencias(alterar: (atual: Pendencias) => Pendencias): Promise<Pendencias> {
    return this.arquivos.atualizar(PENDENCIAS, PENDENCIAS_VAZIAS, alterar)
  }

  async adicionarEvento(
    expedicaoId: number,
    payload: CriarEventoPayload,
    midias: CriarEvidenciaPayload[],
  ): Promise<EventoPendente> {
    const copias = await this.guardarMidias(midias)
    const localId = uuid()
    let evento!: EventoPendente

    await this.atualizarPendencias(atual => {
      let seq = atual.proximo_seq
      evento = {
        local_id: localId,
        seq: seq++,
        status: 'pending',
        criado_em: new Date().toISOString(),
        expedicao_id: expedicaoId,
        payload,
      }
      const novasMidias = copias.map(copia => this.novaMidia(
        { tipo: 'evento', expedicao_id: expedicaoId, evento_local_id: localId },
        copia,
        seq++,
      ))
      return {
        ...atual,
        proximo_seq: seq,
        eventos: [...atual.eventos, evento],
        midias: [...atual.midias, ...novasMidias],
      }
    })

    return evento
  }

  async adicionarMidias(alvo: AlvoMidia, midias: CriarEvidenciaPayload[]): Promise<void> {
    const copias = await this.guardarMidias(midias)

    await this.atualizarPendencias(atual => {
      let seq = atual.proximo_seq
      const novasMidias = copias.map(copia => this.novaMidia(alvo, copia, seq++))
      return { ...atual, proximo_seq: seq, midias: [...atual.midias, ...novasMidias] }
    })
  }

  async adicionarLembrete(payload: CriarLembretePayload, midias: CriarEvidenciaPayload[]): Promise<LembretePendente> {
    const copias = await this.guardarMidias(midias)
    const localId = uuid()
    let lembrete!: LembretePendente

    await this.atualizarPendencias(atual => {
      let seq = atual.proximo_seq
      lembrete = {
        local_id: localId,
        seq: seq++,
        status: 'pending',
        criado_em: new Date().toISOString(),
        payload,
      }
      const novasMidias = copias.map(copia => this.novaMidia(
        { tipo: 'lembrete', lembrete_local_id: localId },
        copia,
        seq++,
      ))
      return {
        ...atual,
        proximo_seq: seq,
        lembretes: [...atual.lembretes, lembrete],
        midias: [...atual.midias, ...novasMidias],
      }
    })

    return lembrete
  }

  private novaMidia(alvo: AlvoMidia, payload: CriarEvidenciaPayload, seq: number): MidiaPendente {
    return {
      local_id: uuid(),
      seq,
      status: 'pending',
      criado_em: new Date().toISOString(),
      alvo,
      payload,
    }
  }

  // ---------- Mídia ----------

  /**
   * Copia cada arquivo para a pasta do app: a câmera, o gravador e o seletor
   * entregam arquivos temporários, que o sistema pode apagar antes da sincronização.
   */
  private async guardarMidias(midias: CriarEvidenciaPayload[]): Promise<CriarEvidenciaPayload[]> {
    const pasta = `${this.arquivos.diretorio}/midia`
    await mkdir(pasta)

    const copias: CriarEvidenciaPayload[] = []
    for (const midia of midias) {
      const destino = `${pasta}/${uuid()}${extensao(midia.arquivo)}`
      await copyFile(semEsquema(midia.arquivo.uri), destino)
      copias.push({ ...midia, arquivo: { ...midia.arquivo, uri: `file://${destino}` } })
    }
    return copias
  }

  async midiaExiste(arquivo: ArquivoLocal): Promise<boolean> {
    return exists(semEsquema(arquivo.uri))
  }

  async apagarMidia(arquivo: ArquivoLocal): Promise<void> {
    const caminho = semEsquema(arquivo.uri)
    if (await exists(caminho)) await unlink(caminho)
  }

  // ---------- Cache da API ----------

  lerExpedicoes(): Promise<CacheExpedicoes> {
    return this.arquivos.ler(EXPEDICOES, EXPEDICOES_VAZIAS)
  }

  gravarExpedicoes(cache: CacheExpedicoes): Promise<void> {
    return this.arquivos.gravar(EXPEDICOES, cache)
  }

  lerDetalhe(expedicaoId: number): Promise<ExpedicaoDetalhe | null> {
    return this.arquivos.ler<ExpedicaoDetalhe | null>(detalheArquivo(expedicaoId), null)
  }

  gravarDetalhe(detalhe: ExpedicaoDetalhe): Promise<void> {
    return this.arquivos.gravar(detalheArquivo(detalhe.id), detalhe)
  }

  lerRegistros(expedicaoId: number): Promise<RegistroExpedicao[] | null> {
    return this.arquivos.ler<RegistroExpedicao[] | null>(registrosArquivo(expedicaoId), null)
  }

  gravarRegistros(expedicaoId: number, registros: RegistroExpedicao[]): Promise<void> {
    return this.arquivos.gravar(registrosArquivo(expedicaoId), registros)
  }

  async removerExpedicao(expedicaoId: number): Promise<void> {
    await this.arquivos.remover(detalheArquivo(expedicaoId))
    await this.arquivos.remover(registrosArquivo(expedicaoId))
  }

  lerLembretes(): Promise<Lembrete[]> {
    return this.arquivos.ler<Lembrete[]>(LEMBRETES, [])
  }

  gravarLembretes(lembretes: Lembrete[]): Promise<void> {
    return this.arquivos.gravar(LEMBRETES, lembretes)
  }

  lerMeta(): Promise<MetaOffline> {
    return this.arquivos.ler(META, META_VAZIA)
  }

  async atualizarMeta(parcial: Partial<MetaOffline>): Promise<void> {
    await this.arquivos.atualizar(META, META_VAZIA, atual => ({ ...atual, ...parcial }))
  }

  /** Logout: apaga pendências, cache e mídia do usuário */
  limparTudo(): Promise<void> {
    return this.arquivos.removerTudo()
  }
}
