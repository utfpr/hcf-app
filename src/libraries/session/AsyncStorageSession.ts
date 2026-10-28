import AsyncStorage from '@react-native-async-storage/async-storage'

import type { Usuario } from '@/types/usuario'

const TOKEN_KEY = 'hcf-auth-token'
const REFRESH_TOKEN_KEY = 'hcf-auth-refresh-token'
const USER_KEY = 'hcf-auth-user'

export interface SessaoSalva {
  token: string
  // Ausente nas sessões do login antigo (/login)
  refreshToken?: string
  user: Usuario
}

export class AsyncStorageSession {
  async load(): Promise<{ token: string | null; refreshToken: string | null; user: Usuario | null }> {
    const [token, refreshToken, rawUser] = await Promise.all([
      AsyncStorage.getItem(TOKEN_KEY),
      AsyncStorage.getItem(REFRESH_TOKEN_KEY),
      AsyncStorage.getItem(USER_KEY),
    ])

    if (!rawUser) {
      return { token, refreshToken, user: null }
    }

    try {
      return { token, refreshToken, user: JSON.parse(rawUser) as Usuario }
    } catch {
      return { token, refreshToken, user: null }
    }
  }

  async save(params: SessaoSalva): Promise<void> {
    await Promise.all([
      AsyncStorage.setItem(TOKEN_KEY, params.token),
      params.refreshToken
        ? AsyncStorage.setItem(REFRESH_TOKEN_KEY, params.refreshToken)
        : AsyncStorage.removeItem(REFRESH_TOKEN_KEY),
      AsyncStorage.setItem(USER_KEY, JSON.stringify(params.user)),
    ])
  }

  async clear(): Promise<void> {
    await Promise.all([
      AsyncStorage.removeItem(TOKEN_KEY),
      AsyncStorage.removeItem(REFRESH_TOKEN_KEY),
      AsyncStorage.removeItem(USER_KEY),
    ])
  }
}
