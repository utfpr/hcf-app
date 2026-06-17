export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  usuario: Usuario;
}

export enum TipoUsuario {
  Curador = 1,
  Operador = 2,
  Identificador = 3,
}

export interface Usuario {
  id: number;
  email: string;
  nome: string;
  tipo_usuario_id: TipoUsuario;
  telefone?: string;
}
