import { TipoUsuario, type Usuario } from '@/types/usuario'

import type { ParticipanteExpedicao } from './types'

export const AVISO_SOMENTE_PARTICIPANTES = 'Somente participantes podem registrar eventos'

/**
 * Expedicionário só registra (coleta, diário, lembrete, evidência) nas expedições
 * de que participa; a API recusa o resto com 403. Os demais perfis não mudam.
 */
export function podeRegistrarNaExpedicao(
  user: Pick<Usuario, 'id' | 'tipo_usuario_id'> | null | undefined,
  expedicao: { participantes: ParticipanteExpedicao[] },
): boolean {
  // A API manda ids bigint como string ("15"); compara sempre como número.
  if (!user || Number(user.tipo_usuario_id) !== TipoUsuario.Expedicionario) return true
  const usuarioId = Number(user.id)
  return expedicao.participantes.some(participante => Number(participante.id) === usuarioId)
}
