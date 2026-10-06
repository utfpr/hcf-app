import { useEffect, useRef, useState } from 'react'
import { Alert, PermissionsAndroid, Platform, type Permission } from 'react-native'
import { launchCamera } from 'react-native-image-picker'
import { pick, types } from '@react-native-documents/picker'
import AudioRecorderPlayer from 'react-native-audio-recorder-player'

import type { CriarEvidenciaPayload } from '../types'

const audioRecorderPlayer = new AudioRecorderPlayer()

export type TipoPendente = 'imagem' | 'audio' | 'video' | 'outro'

// Evidência escolhida/capturada no aparelho que ainda não foi enviada para a API
export interface EvidenciaPendente {
  id: string
  tipo: TipoPendente
  payload: CriarEvidenciaPayload
  // Tamanho do arquivo ou duração do áudio, exibido abaixo do nome
  detalhe: string
}

function tipoPorMime(mime: string): TipoPendente {
  if (mime.startsWith('image/')) return 'imagem'
  if (mime.startsWith('audio/')) return 'audio'
  if (mime.startsWith('video/')) return 'video'
  return 'outro'
}

function formatFileSize(size?: number | null) {
  if (!size) return 'Tamanho não disponível'
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(0)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

async function requestPermissions(permissions: Permission[]) {
  if (Platform.OS !== 'android') return true
  try {
    const grants = await PermissionsAndroid.requestMultiple(permissions)
    return permissions.every(p => grants[p] === PermissionsAndroid.RESULTS.GRANTED)
  } catch {
    return false
  }
}

// Estado e ações da seção "Multimídia": tirar foto, gravar vídeo/áudio e fazer upload.
// Usado no formulário de coleta/diário e no modal de adicionar evidência do RegistroCard.
export function useMultimidia() {
  const [pendentes, setPendentes] = useState<EvidenciaPendente[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordTime, setRecordTime] = useState('00:00')
  const [isCapturing, setIsCapturing] = useState(false)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const isRecordingRef = useRef(false)
  const playingIdRef = useRef<string | null>(null)

  // Sair da tela no meio de uma gravação/reprodução encerra o gravador e o player
  useEffect(() => {
    return () => {
      audioRecorderPlayer.removeRecordBackListener()
      audioRecorderPlayer.removePlayBackListener()
      if (isRecordingRef.current) audioRecorderPlayer.stopRecorder().catch(() => {})
      if (playingIdRef.current) audioRecorderPlayer.stopPlayer().catch(() => {})
    }
  }, [])

  function adicionar(tipo: TipoPendente, payload: CriarEvidenciaPayload, detalhe: string) {
    setPendentes(prev => [...prev, { id: `${Date.now()}-${prev.length}`, tipo, payload, detalhe }])
  }

  async function pararReproducao() {
    if (!playingIdRef.current) return
    playingIdRef.current = null
    setPlayingId(null)
    audioRecorderPlayer.removePlayBackListener()
    await audioRecorderPlayer.stopPlayer().catch(() => {})
  }

  async function remover(id: string) {
    if (playingIdRef.current === id) await pararReproducao()
    setPendentes(prev => prev.filter(p => p.id !== id))
  }

  async function capturar(mediaType: 'photo' | 'video') {
    const allowed = await requestPermissions(
      mediaType === 'photo'
        ? [PermissionsAndroid.PERMISSIONS.CAMERA]
        : [PermissionsAndroid.PERMISSIONS.CAMERA, PermissionsAndroid.PERMISSIONS.RECORD_AUDIO],
    )
    if (!allowed) {
      setError('Permissão de câmera negada. Habilite o acesso à câmera para capturar fotos e vídeos.')
      return
    }

    setIsCapturing(true)
    try {
      const result = await launchCamera({ mediaType, saveToPhotos: true, videoQuality: 'high' })
      if (result.didCancel) return
      const asset = result.assets?.[0]
      if (result.errorCode || !asset?.uri) {
        setError(`Não foi possível capturar ${mediaType === 'photo' ? 'a foto' : 'o vídeo'}. Tente novamente.`)
        return
      }
      const isPhoto = mediaType === 'photo'
      const nome = asset.fileName ?? `${isPhoto ? 'foto' : 'video'}_${Date.now()}.${isPhoto ? 'jpg' : 'mp4'}`
      const type = asset.type ?? (isPhoto ? 'image/jpeg' : 'video/mp4')
      adicionar(isPhoto ? 'imagem' : 'video', {
        arquivo: { uri: asset.uri, name: nome, type },
        nome,
        capturado_em: new Date().toISOString(),
      }, formatFileSize(asset.fileSize))
    } finally {
      setIsCapturing(false)
    }
  }

  function abrirCamera() {
    setError(null)
    Alert.alert('Câmera', 'O que você deseja capturar?', [
      { text: 'Tirar foto', onPress: () => capturar('photo') },
      { text: 'Gravar vídeo', onPress: () => capturar('video') },
      { text: 'Cancelar', style: 'cancel' },
    ])
  }

  function capturarFoto() {
    setError(null)
    return capturar('photo')
  }

  function capturarVideo() {
    setError(null)
    return capturar('video')
  }

  async function upload() {
    setError(null)
    try {
      const results = await pick({
        allowMultiSelection: true,
        type: [types.images, types.video, types.audio],
      })
      const agora = new Date().toISOString()
      for (const file of results) {
        const nome = file.name ?? file.uri.split('/').pop() ?? `upload_${Date.now()}`
        const type = file.type ?? 'application/octet-stream'
        adicionar(tipoPorMime(type), {
          arquivo: { uri: file.uri, name: nome, type },
          nome,
          capturado_em: agora,
        }, formatFileSize(file.size))
      }
    } catch (err: any) {
      if (err?.code === 'OPERATION_CANCELED' || String(err).toLowerCase().includes('cancel')) return
      setError('Não foi possível fazer o upload. Tente novamente.')
    }
  }

  async function alternarGravacao() {
    setError(null)

    if (isRecording) {
      const uri = await audioRecorderPlayer.stopRecorder()
      audioRecorderPlayer.removeRecordBackListener()
      isRecordingRef.current = false
      setIsRecording(false)

      // O gravador salva AAC em container MP4 (.mp4 no Android, .m4a no iOS)
      const extensao = uri.endsWith('.m4a') ? 'm4a' : 'mp4'
      const nome = `audio_${Date.now()}.${extensao}`
      adicionar('audio', {
        arquivo: { uri, name: nome, type: 'audio/mp4' },
        nome,
        capturado_em: new Date().toISOString(),
      }, recordTime)
      return
    }

    const allowed = await requestPermissions([PermissionsAndroid.PERMISSIONS.RECORD_AUDIO])
    if (!allowed) {
      setError('Permissão de microfone negada. Habilite o acesso ao microfone para gravar áudio.')
      return
    }

    await pararReproducao()
    isRecordingRef.current = true
    setIsRecording(true)
    setRecordTime('00:00')
    await audioRecorderPlayer.startRecorder()
    audioRecorderPlayer.addRecordBackListener(e => {
      setRecordTime(audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)).substring(0, 5))
    })
  }

  async function alternarReproducao(item: EvidenciaPendente) {
    const tocandoEste = playingIdRef.current === item.id
    await pararReproducao()
    if (tocandoEste || isRecording) return

    playingIdRef.current = item.id
    setPlayingId(item.id)
    await audioRecorderPlayer.startPlayer(item.payload.arquivo.uri)
    audioRecorderPlayer.addPlayBackListener(e => {
      if (e.duration > 0 && e.currentPosition >= e.duration) pararReproducao()
    })
  }

  return {
    pendentes,
    setPendentes,
    error,
    setError,
    isRecording,
    recordTime,
    isCapturing,
    playingId,
    // Enquanto grava ou a câmera está aberta, não dá para salvar
    busy: isRecording || isCapturing,
    abrirCamera,
    capturarFoto,
    capturarVideo,
    upload,
    alternarGravacao,
    alternarReproducao,
    remover,
  }
}

export type MultimidiaState = ReturnType<typeof useMultimidia>
