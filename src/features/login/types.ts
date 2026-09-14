import type { Usuario } from '@/types/usuario'

export interface LoginRequest {
  email: string
  senha: string
}

export interface LoginResponse {
  token: string
  usuario: Usuario
}
