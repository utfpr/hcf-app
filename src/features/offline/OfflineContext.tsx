import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { AppState } from 'react-native'
import { mutate } from 'swr'

import { useFeedback } from '@/components/feedback/FeedbackContext'
import { useAuth } from '@/contexts/Auth/useAuth'
import { useContainer } from '@/contexts/Container/useContainer'
import { EnvioInterrompidoError, type ProgressoEnvio, SyncService } from '@/features/sync/SyncService'
import type { SyncResult } from '@/features/sync/types'
import { taxonomiaStore } from '@/features/taxonomia/TaxonomiaStore'
import { getUserFacingHttpError } from '@/libraries/http/httpError'
import { estaNoWifi, temInternet } from '@/libraries/network/conexao'

import { contarPendentes, OfflineStore } from './OfflineStore'
import { ReautenticarModal } from './ReautenticarModal'
import type { MetaOffline, Pendencias } from './types'

export interface OfflineContextValue {
  store: OfflineStore
  pendencias: Pendencias | null
  // Itens que ainda não subiram (pendentes + com erro); bloqueia o logout
  pendentes: number
  meta: MetaOffline | null
  sincronizando: boolean
  // Durante o envio: quantos itens já foram de quantos (null fora da sincronização)
  progresso: ProgressoEnvio | null
  baixando: boolean
  /**
   * App → API e depois API → app. Só no Wi-Fi. Com `semBaixar`, só envia
   * (botão "Enviar tudo para a API").
   */
  sincronizar(filtro?: FiltroSincronizacao): Promise<SyncResult>
  /**
   * Só API → app (expedições do web, registros, lembretes; com `taxonomia`, também
   * as famílias). Qualquer conexão. Não envia nada.
   */
  baixar(opcoes?: { taxonomia?: boolean }): Promise<SyncResult>
}

export interface FiltroSincronizacao {
  // Só o que é dessa expedição
  expedicaoId?: number
  // Só envia; não baixa nada da API
  semBaixar?: boolean
}

const OfflineContext = createContext<OfflineContextValue | undefined>(undefined)

// Abrir/voltar ao app várias vezes seguidas não baixa tudo de novo a cada vez
const INTERVALO_BAIXA_AUTOMATICA_MS = 5 * 60 * 1000

// As telas leem os dados locais pelas queries do SWR: qualquer gravação local
// revalida todas, e cada tela relê o JSON
function revalidarTelas() {
  mutate(() => true, undefined, { revalidate: true })
}

export function OfflineProvider({ children }: { children: ReactNode }) {
  const { httpClient } = useContainer()
  const { user, sessaoExpirada } = useAuth()
  const { toast } = useFeedback()
  const usuarioId = user?.id as number

  const store = useMemo(() => new OfflineStore(usuarioId), [usuarioId])
  const sync = useMemo(() => new SyncService(httpClient, store), [httpClient, store])

  const [pendencias, setPendencias] = useState<Pendencias | null>(null)
  const [meta, setMeta] = useState<MetaOffline | null>(null)
  const [sincronizando, setSincronizando] = useState(false)
  const [progresso, setProgresso] = useState<ProgressoEnvio | null>(null)
  const [baixando, setBaixando] = useState(false)
  // Evita duas sincronizações ao mesmo tempo (botão da Home + tela de Sync)
  const ocupado = useRef(false)
  // Sessão vencida no meio: guarda o que o usuário pediu para retomar depois da senha
  const [pedindoSenha, setPedindoSenha] = useState(false)
  const [retomar, setRetomar] = useState(false)
  const filtroPendente = useRef<FiltroSincronizacao>({})

  useEffect(() => {
    let ativo = true
    const recarregar = () => {
      Promise.all([store.pendencias(), store.lerMeta()]).then(([novasPendencias, novaMeta]) => {
        if (!ativo) return
        setPendencias(novasPendencias)
        setMeta(novaMeta)
      })
      revalidarTelas()
    }
    recarregar()
    const cancelar = store.aoMudar(recarregar)
    return () => {
      ativo = false
      cancelar()
    }
  }, [store])

  // Falha na taxonomia não derruba o resto: ela é só apoio para o autocompletar
  const importarTaxonomia = useCallback(
    () => taxonomiaStore.importar(httpClient).then(() => undefined, () => undefined),
    [httpClient],
  )

  // A baixa grava vários arquivos em silêncio: as telas releem uma vez só, no fim
  // (também se falhar no meio, para mostrar o que chegou a ser gravado)
  const baixarCache = useCallback(async () => {
    try {
      await sync.baixar()
      await sync.limparEnviados()
    } finally {
      store.avisarMudanca()
    }
  }, [sync, store])

  const baixar = useCallback(async (opcoes: { taxonomia?: boolean } = {}): Promise<SyncResult> => {
    if (ocupado.current) return { success: false, message: 'Já existe uma sincronização em andamento.' }
    if (!(await temInternet())) {
      return { success: false, message: 'Sem conexão: mostrando os dados salvos no aparelho.' }
    }

    ocupado.current = true
    setBaixando(true)
    try {
      await baixarCache()
      if (opcoes.taxonomia) await importarTaxonomia()
      return { success: true, syncedAt: new Date().toISOString() }
    } catch (error) {
      return { success: false, message: getUserFacingHttpError(error, 'Não foi possível atualizar os dados.') }
    } finally {
      ocupado.current = false
      setBaixando(false)
    }
  }, [baixarCache, importarTaxonomia])

  const sincronizar = useCallback(async (filtro: FiltroSincronizacao = {}): Promise<SyncResult> => {
    if (ocupado.current) return { success: false, message: 'Já existe uma sincronização em andamento.' }
    if (!(await estaNoWifi())) {
      return { success: false, message: 'Conecte-se a uma rede Wi-Fi para sincronizar.' }
    }
    if (sessaoExpirada) {
      filtroPendente.current = filtro
      setPedindoSenha(true)
      return { success: false, message: 'Sua sessão expirou. Digite sua senha para continuar a sincronização.' }
    }

    ocupado.current = true
    setSincronizando(true)
    try {
      const envio = await sync.enviar({ expedicaoId: filtro.expedicaoId }, setProgresso)
      // Sem baixar, o que subiu fica marcado como enviado (✓) até a próxima baixa
      if (!filtro.semBaixar) {
        await baixarCache()
        // "Sincronizar tudo": manda tudo e puxa tudo, inclusive a taxonomia
        if (filtro.expedicaoId === undefined) await importarTaxonomia()
      }

      const agora = new Date().toISOString()
      await store.atualizarMeta({ ultima_sincronizacao: agora })

      if (envio.erros > 0) {
        return {
          success: false,
          itemsProcessed: envio.enviados,
          message: `${envio.erros} item(ns) não foram aceitos pela API. Veja os erros na tela de Sincronização.`,
        }
      }
      return { success: true, syncedAt: agora, itemsProcessed: envio.enviados }
    } catch (error) {
      if (error instanceof EnvioInterrompidoError) {
        if (error.sessaoExpirada) {
          filtroPendente.current = filtro
          setPedindoSenha(true)
        }
        return { success: false, message: error.message }
      }
      return { success: false, message: getUserFacingHttpError(error, 'Falha na sincronização dos dados.') }
    } finally {
      ocupado.current = false
      setSincronizando(false)
      setProgresso(null)
    }
  }, [store, sync, sessaoExpirada, importarTaxonomia, baixarCache])

  // Senha aceita: quando a sessão nova chegar, retoma a sincronização interrompida
  useEffect(() => {
    if (!retomar || sessaoExpirada) return
    setRetomar(false)
    sincronizar(filtroPendente.current).then(resultado => {
      toast(resultado.success
        ? { tipo: 'sucesso', titulo: 'Sincronização concluída', mensagem: 'Todos os dados foram sincronizados com sucesso.' }
        : { tipo: 'erro', titulo: 'Sincronização', mensagem: resultado.message ?? 'Não foi possível sincronizar.' })
    })
  }, [retomar, sessaoExpirada, sincronizar, toast])

  // Ao abrir o app (e ao voltar para ele) no Wi-Fi: puxa sozinho tudo da API
  // (expedições do web, registros, lembretes e taxonomia). Não envia nada: subir o
  // que está no aparelho continua sendo só no "Sincronizar".
  const ultimaBaixaAutomatica = useRef(0)
  useEffect(() => {
    const tentar = async () => {
      if (Date.now() - ultimaBaixaAutomatica.current < INTERVALO_BAIXA_AUTOMATICA_MS) return

      if (await estaNoWifi()) {
        ultimaBaixaAutomatica.current = Date.now()
        await baixar({ taxonomia: true })
        return
      }

      // Sem Wi-Fi, mas com internet: na primeira vez do usuário no aparelho, traz o
      // mínimo para não começar vazio
      const [atual, familias] = await Promise.all([store.lerMeta(), taxonomiaStore.lerFamilias()])
      if (!atual.ultima_baixa) await baixar({ taxonomia: !familias.atualizado_em })
    }

    tentar()
    const subscription = AppState.addEventListener('change', estado => {
      if (estado === 'active') tentar()
    })
    return () => subscription.remove()
  }, [store, baixar])

  const value = useMemo<OfflineContextValue>(() => ({
    store,
    pendencias,
    pendentes: pendencias ? contarPendentes(pendencias) : 0,
    meta,
    sincronizando,
    progresso,
    baixando,
    sincronizar,
    baixar,
  }), [store, pendencias, meta, sincronizando, progresso, baixando, sincronizar, baixar])

  return (
    <OfflineContext.Provider value={value}>
      {children}
      <ReautenticarModal
        visible={pedindoSenha}
        onSucesso={() => {
          setPedindoSenha(false)
          setRetomar(true)
        }}
        onCancelar={() => setPedindoSenha(false)}
      />
    </OfflineContext.Provider>
  )
}

/** Para componentes que também aparecem fora da área logada (ou em testes) */
export function useOfflineOpcional(): OfflineContextValue | undefined {
  return useContext(OfflineContext)
}

export function useOffline(): OfflineContextValue {
  const context = useContext(OfflineContext)
  if (!context) throw new Error('useOffline precisa estar dentro de <OfflineProvider>')
  return context
}
