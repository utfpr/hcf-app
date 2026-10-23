import type { Usuario } from '@/types/usuario'

export interface LoginRequest {
  email: string
  senha: string
}

// Espelha POST /auth/login e /auth/refresh do hcf-api (sessões com refresh token)
export interface LoginResponse {
  access_token: string
  refresh_token: string
  token_type: 'Bearer'
  expires_in: number
  user: Usuario
}
