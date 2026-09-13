import AsyncStorage from '@react-native-async-storage/async-storage'

import type { Usuario } from '@/types/usuario'

const TOKEN_KEY = 'hcf-auth-token'
const USER_KEY = 'hcf-auth-user'

export class AsyncStorageSession {
  async load(): Promise<{ token: string | null; user: Usuario | null }> {
    const [token, rawUser] = await Promise.all([
      AsyncStorage.getItem(TOKEN_KEY),
      AsyncStorage.getItem(USER_KEY),
    ])

    if (!rawUser) {
      return { token, user: null }
    }

    try {
      return { token, user: JSON.parse(rawUser) as Usuario }
    } catch {
      return { token, user: null }
    }
  }

  async save(params: { token: string; user: Usuario }): Promise<void> {
    await Promise.all([
      AsyncStorage.setItem(TOKEN_KEY, params.token),
      AsyncStorage.setItem(USER_KEY, JSON.stringify(params.user)),
    ])
  }

  async clear(): Promise<void> {
    await Promise.all([
      AsyncStorage.removeItem(TOKEN_KEY),
      AsyncStorage.removeItem(USER_KEY),
    ])
  }
}
