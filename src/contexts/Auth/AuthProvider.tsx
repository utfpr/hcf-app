import {
  ReactNode,
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react'

import { useContainer } from '@/contexts/Container/useContainer'
import { AsyncStorageSession } from '@/libraries/session/AsyncStorageSession'
import type { Usuario } from '@/types/usuario'

import { AuthContext } from './AuthContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const { accessTokenSource } = useContainer()
  const session = useRef(new AsyncStorageSession()).current

  const [token, setToken] = useState<string | undefined>()
  const [user, setUser] = useState<Usuario | undefined>()
  const [ready, setReady] = useState(false)

  const loggedIn = Boolean(token) && Boolean(user?.id)

  useEffect(() => {
    let cancelled = false

    session.load().then(({ token: storedToken, user: storedUser }) => {
      if (cancelled) {
        return
      }

      if (storedToken && storedUser) {
        accessTokenSource.setAccessToken(storedToken)
        setToken(storedToken)
        setUser(storedUser)
      }

      setReady(true)
    })

    return () => {
      cancelled = true
    }
  }, [accessTokenSource, session])

  const logIn = useCallback((params: { token: string; user: Usuario }) => {
    accessTokenSource.setAccessToken(params.token)
    setToken(params.token)
    setUser(params.user)
    session.save(params)
  }, [accessTokenSource, session])

  const logOut = useCallback(() => {
    accessTokenSource.setAccessToken(undefined)
    setToken(undefined)
    setUser(undefined)
    session.clear()
  }, [accessTokenSource, session])

  const contextValue = useMemo(() => ({
    token,
    user,
    loggedIn,
    ready,
    logIn,
    logOut,
  }), [token, user, loggedIn, ready, logIn, logOut])

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}
