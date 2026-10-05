import { API_BASE_URL } from '@env'

import type { Evidencia } from './types'

// A API serve os arquivos em /uploads na raiz do servidor, fora do prefixo da API (ex.: /api)
const API_ORIGIN = API_BASE_URL.match(/^https?:\/\/[^/]+/)?.[0] ?? ''

export function arquivoUrl(evidencia: Evidencia): string {
  return `${API_ORIGIN}${evidencia.url}`
}

export type TipoEvidencia = 'imagem' | 'audio' | 'video' | 'outro'

export function tipoEvidencia(evidencia: Evidencia): TipoEvidencia {
  if (evidencia.mime_type.startsWith('image/')) return 'imagem'
  if (evidencia.mime_type.startsWith('audio/')) return 'audio'
  if (evidencia.mime_type.startsWith('video/')) return 'video'
  return 'outro'
}
