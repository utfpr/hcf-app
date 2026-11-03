import type { ArquivoLocal, CriarEvidenciaPayload } from './types'

const MIME_ALIAS: Record<string, string> = {
  'image/jpg': 'image/jpeg',
  'image/pjpeg': 'image/jpeg',
  'audio/x-wav': 'audio/wav',
  'audio/x-m4a': 'audio/mp4',
}

const EXTENSAO_MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  mov: 'video/quicktime',
  m4a: 'audio/mp4',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
}

export function mimeDoArquivo(arquivo: ArquivoLocal): string {
  const type = arquivo.type.trim().toLowerCase()
  if (MIME_ALIAS[type]) return MIME_ALIAS[type]
  if (type && type !== 'application/octet-stream') return type

  const match = /\.([a-z0-9]+)$/i.exec(arquivo.name)
  const extensao = match ? match[1].toLowerCase() : ''
  return EXTENSAO_MIME[extensao] ?? type
}

export function montarFormEvidencia(payload: CriarEvidenciaPayload): FormData {
  const form = new FormData()
  form.append('nome', payload.nome)
  form.append('data_captura', payload.data_captura)
  if (payload.client_uuid) form.append('client_uuid', payload.client_uuid)
  form.append('arquivo', {
    uri: payload.arquivo.uri,
    name: payload.arquivo.name,
    type: mimeDoArquivo(payload.arquivo),
  } as unknown as Blob)
  return form
}
