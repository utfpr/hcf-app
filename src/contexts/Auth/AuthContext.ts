import { createContext } from 'react'

import type { Usuario } from '@/types/usuario'

export interface AuthContextValue {
  token?: string
  user?: Usuario
  loggedIn: boolean
  ready: boolean
  logIn(params: { token: string; user: Usuario }): void
  logOut(): void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
