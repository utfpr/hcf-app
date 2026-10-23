import {
  ReactNode,
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react'

import { useContainer } from '@/contexts/Container/useContainer'
import { useFeedback } from '@/components/feedback/FeedbackContext'
import type { LoginResponse } from '@/features/login/types'
import { contarPendentes, OfflineStore } from '@/features/offline/OfflineStore'
import type { RefreshOutcome } from '@/libraries/http/HttpClient'
import { getHttpStatus, getUserFacingHttpError, isNetworkError } from '@/libraries/http/httpError'
import { AsyncStorageSession } from '@/libraries/session/AsyncStorageSession'
import type { Usuario } from '@/types/usuario'

import { AuthContext } from './AuthContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const { accessTokenSource, httpClient } = useContainer()
  const { toast } = useFeedback()
  const session = useRef(new AsyncStorageSession()).current

  const [token, setToken] = useState<string | undefined>()
  const [user, setUser] = useState<Usuario | undefined>()
  const [ready, setReady] = useState(false)
  const [sessaoExpirada, setSessaoExpirada] = useState(false)
  // Lido pelos handlers do HttpClient, que não re-renderizam
  const refreshToken = useRef<string | undefined>(undefined)
  const userRef = useRef<Usuario | undefined>(undefined)

  const loggedIn = Boolean(token) && Boolean(user?.id)

  // Abre com a sessão salva, sem validar online: o app tem que abrir sem internet
  useEffect(() => {
    let cancelled = false

    session.load().then(({ token: storedToken, refreshToken: storedRefresh, user: storedUser }) => {
      if (cancelled) {
        return
      }

      if (storedToken && storedUser) {
        accessTokenSource.setAccessToken(storedToken)
        refreshToken.current = storedRefresh ?? undefined
        userRef.current = storedUser
        setToken(storedToken)
        setUser(storedUser)
      }

      setReady(true)
    })

    return () => {
      cancelled = true
    }
  }, [accessTokenSource, session])

  const logIn = useCallback((params: { token: string; refreshToken?: string; user: Usuario }) => {
    accessTokenSource.setAccessToken(params.token)
    refreshToken.current = params.refreshToken
    userRef.current = params.user
    setToken(params.token)
    setUser(params.user)
    setSessaoExpirada(false)
    session.save(params)
  }, [accessTokenSource, session])

  const limparSessao = useCallback(async (usuario: Usuario | undefined) => {
    accessTokenSource.setAccessToken(undefined)
    refreshToken.current = undefined
    userRef.current = undefined
    setToken(undefined)
    setUser(undefined)
    setSessaoExpirada(false)
    await session.clear()
    if (usuario) await new OfflineStore(usuario.id).limparTudo().catch(() => undefined)
  }, [accessTokenSource, session])

  const logOut = useCallback(async () => {
    const usuario = userRef.current
    // Melhor esforço: se o servidor não responder, a sessão vence sozinha
    await httpClient.post('/auth/logout', { refresh_token: refreshToken.current }).catch(() => undefined)
    await limparSessao(usuario)
  }, [httpClient, limparSessao])

  const reautenticar = useCallback(async (senha: string) => {
    const atual = userRef.current
    if (!atual) return { ok: false, message: 'Nenhum usuário logado.' }

    try {
      const { data } = await httpClient.post<LoginResponse>('/auth/login', { email: atual.email, senha })
      if (data.user.id !== atual.id) {
        return { ok: false, message: 'Entre com o mesmo usuário que fez os registros deste aparelho.' }
      }
      logIn({ token: data.access_token, refreshToken: data.refresh_token, user: data.user })
      return { ok: true }
    } catch (error) {
      if (getHttpStatus(error) === 401) return { ok: false, message: 'Senha incorreta.' }
      return { ok: false, message: getUserFacingHttpError(error, 'Não foi possível entrar. Tente novamente.') }
    }
  }, [httpClient, logIn])

  // Access token vencido: o HttpClient pede um novo com o refresh token
  useEffect(() => {
    httpClient.setRefreshHandler(async (): Promise<RefreshOutcome> => {
      if (!refreshToken.current) return 'expired'
      try {
        const { data } = await httpClient.post<LoginResponse>('/auth/refresh', { refresh_token: refreshToken.current })
        logIn({ token: data.access_token, refreshToken: data.refresh_token, user: data.user })
        return 'renewed'
      } catch (error) {
        if (isNetworkError(error)) return 'failed'
        return getHttpStatus(error) === 401 ? 'expired' : 'failed'
      }
    })
    return () => httpClient.setRefreshHandler(undefined)
  }, [httpClient, logIn])

  // Sessão vencida de verdade. Com coisa para enviar, NÃO desloga (perderia os
  // dados): segue offline e pede a senha ao sincronizar. Sem pendências, volta ao login.
  useEffect(() => {
    httpClient.setUnauthorizedHandler(() => {
      const usuario = userRef.current
      if (!accessTokenSource.getAccessToken() || !usuario) return

      new OfflineStore(usuario.id).pendencias()
        .then(pendencias => {
          if (contarPendentes(pendencias) > 0) {
            setSessaoExpirada(true)
            return
          }
          limparSessao(usuario)
          toast({ tipo: 'info', titulo: 'Sessão expirada', mensagem: 'Faça login novamente para continuar.' })
        })
        .catch(() => setSessaoExpirada(true))
    })
    return () => httpClient.setUnauthorizedHandler(undefined)
  }, [httpClient, accessTokenSource, limparSessao, toast])

  const contextValue = useMemo(() => ({
    token,
    user,
    loggedIn,
    ready,
    sessaoExpirada,
    logIn,
    logOut,
    reautenticar,
  }), [token, user, loggedIn, ready, sessaoExpirada, logIn, logOut, reautenticar])

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}
