import { createContext } from 'react'

import type { Usuario } from '@/types/usuario'

export interface AuthContextValue {
  token?: string
  user?: Usuario
  loggedIn: boolean
  ready: boolean
  // O servidor recusou o refresh, mas há coisa no aparelho para enviar: o app
  // segue aberto e pede a senha de novo na hora de sincronizar
  sessaoExpirada: boolean
  logIn(params: { token: string; refreshToken?: string; user: Usuario }): void
  /** Encerra a sessão no servidor (se der) e apaga a sessão e os dados do usuário do aparelho */
  logOut(): Promise<void>
  /** Renova a sessão com a senha do mesmo usuário; recusa outro usuário para não misturar dados */
  reautenticar(senha: string): Promise<{ ok: boolean; message?: string }>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
