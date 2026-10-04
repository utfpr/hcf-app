import { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Image,
  Modal,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { launchCamera, launchImageLibrary } from 'react-native-image-picker'
import AudioRecorderPlayer from 'react-native-audio-recorder-player'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Check, Image as ImageIcon, Mic, Video as VideoIcon, X } from 'lucide-react-native'

import { useAdicionarEvidencias } from '@/features/evento/hooks/useAdicionarEvidencias'
import type { CriarEvidenciaPayload, RegistroExpedicao } from '@/features/evento/types'
import { getUserFacingHttpError } from '@/libraries/http/httpError'
import { colors } from '@/theme/colors'

const audioRecorderPlayer = new AudioRecorderPlayer()

interface EvidenciaPendente {
  id: string
  tipo: 'imagem' | 'audio' | 'video'
  payload: CriarEvidenciaPayload
}

interface AdicionarEvidenciaModalProps {
  registro: RegistroExpedicao | null
  expedicaoId: number
  onClose: () => void
}

export function AdicionarEvidenciaModal({ registro, expedicaoId, onClose }: AdicionarEvidenciaModalProps) {
  return (
    <Modal visible={!!registro} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {/* key remonta o conteúdo a cada abertura, zerando a lista de pendentes */}
        {registro ? (
          <Conteudo key={registro.id} registro={registro} expedicaoId={expedicaoId} onClose={onClose} />
        ) : null}
      </SafeAreaView>
    </Modal>
  )
}

interface ConteudoProps {
  registro: RegistroExpedicao
  expedicaoId: number
  onClose: () => void
}

function Conteudo({ registro, expedicaoId, onClose }: ConteudoProps) {
  const [pendentes, setPendentes] = useState<EvidenciaPendente[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordTime, setRecordTime] = useState('00:00')
  const [isCapturingVideo, setIsCapturingVideo] = useState(false)
  const isRecordingRef = useRef(false)

  const { trigger: adicionar, loading: isSaving } = useAdicionarEvidencias(expedicaoId)
  const busy = isSaving || isRecording || isCapturingVideo

  // Fechar o modal no meio de uma gravação encerra o gravador
  useEffect(() => {
    return () => {
      audioRecorderPlayer.removeRecordBackListener()
      if (isRecordingRef.current) {
        audioRecorderPlayer.stopRecorder().catch(() => {})
      }
    }
  }, [])

  function adicionarPendente(tipo: EvidenciaPendente['tipo'], payload: CriarEvidenciaPayload) {
    setPendentes(prev => [...prev, { id: `${Date.now()}-${prev.length}`, tipo, payload }])
  }

  function removerPendente(id: string) {
    setPendentes(prev => prev.filter(p => p.id !== id))
  }

  async function handleAddImage() {
    setError(null)
    const result = await launchImageLibrary({ mediaType: 'photo', selectionLimit: 1 })
    if (result.didCancel) return
    const asset = result.assets?.[0]
    if (result.errorCode || !asset?.uri) {
      setError('Não foi possível selecionar a imagem. Tente novamente.')
      return
    }
    const nome = asset.fileName ?? `imagem_${Date.now()}.jpg`
    adicionarPendente('imagem', {
      arquivo: { uri: asset.uri, name: nome, type: asset.type ?? 'image/jpeg' },
      nome,
      capturado_em: new Date().toISOString(),
    })
  }

  async function requestPermissions(permissions: Array<(typeof PermissionsAndroid.PERMISSIONS)[keyof typeof PermissionsAndroid.PERMISSIONS]>) {
    if (Platform.OS !== 'android') return true
    try {
      const grants = await PermissionsAndroid.requestMultiple(permissions)
      return permissions.every(p => grants[p] === PermissionsAndroid.RESULTS.GRANTED)
    } catch {
      return false
    }
  }

  async function handleAddVideo() {
    setError(null)
    const allowed = await requestPermissions([
      PermissionsAndroid.PERMISSIONS.CAMERA,
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    ])
    if (!allowed) {
      setError('Permissão de câmera negada. Habilite o acesso à câmera para gravar vídeos.')
      return
    }

    setIsCapturingVideo(true)
    try {
      const result = await launchCamera({ mediaType: 'video', videoQuality: 'high', saveToPhotos: false })
      if (result.didCancel) return
      const asset = result.assets?.[0]
      if (result.errorCode || !asset?.uri) {
        setError('Não foi possível gravar o vídeo. Tente novamente.')
        return
      }
      const nome = asset.fileName ?? `video_${Date.now()}.mp4`
      adicionarPendente('video', {
        arquivo: { uri: asset.uri, name: nome, type: asset.type ?? 'video/mp4' },
        nome,
        capturado_em: new Date().toISOString(),
      })
    } finally {
      setIsCapturingVideo(false)
    }
  }

  async function handleToggleRecord() {
    setError(null)

    if (isRecording) {
      const uri = await audioRecorderPlayer.stopRecorder()
      audioRecorderPlayer.removeRecordBackListener()
      isRecordingRef.current = false
      setIsRecording(false)

      // O gravador salva AAC em container MP4 (.mp4 no Android, .m4a no iOS)
      const extensao = uri.endsWith('.m4a') ? 'm4a' : 'mp4'
      const nome = `audio_${Date.now()}.${extensao}`
      adicionarPendente('audio', {
        arquivo: { uri, name: nome, type: 'audio/mp4' },
        nome,
        capturado_em: new Date().toISOString(),
      })
      return
    }

    const allowed = await requestPermissions([PermissionsAndroid.PERMISSIONS.RECORD_AUDIO])
    if (!allowed) {
      setError('Permissão de microfone negada. Habilite o acesso ao microfone para gravar áudio.')
      return
    }

    isRecordingRef.current = true
    setIsRecording(true)
    setRecordTime('00:00')
    await audioRecorderPlayer.startRecorder()
    audioRecorderPlayer.addRecordBackListener(e => {
      const time = audioRecorderPlayer.mmssss(Math.floor(e.currentPosition))
      setRecordTime(time.substring(0, 5))
    })
  }

    async function handleSave() {
    if (pendentes.length === 0 || busy) return
    setError(null)

    const lote = pendentes
    let enviadas = 0
    try {
      await adicionar(
        registro.id,
        lote.map(p => p.payload),
        indice => {
          enviadas += 1
          setPendentes(prev => prev.filter(p => p.id !== lote[indice].id))
        },
      )
    } catch (e) {
      const mensagem = getUserFacingHttpError(e, 'Não foi possível salvar as evidências. Tente novamente.')
      setError(enviadas > 0 ? `${mensagem} Parte das evidências já foi enviada; as restantes continuam na lista.` : mensagem)
      return
    }
    onClose()
  }

  const titulo = registro.tipo === 'COLETA'
    ? registro.coleta?.nome_cientifico ?? 'Coleta'
    : 'Diário'

  return (
    <>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Adicionar evidência</Text>
          <Text style={styles.subtitle} numberOfLines={1}>{titulo}</Text>
        </View>
        <TouchableOpacity onPress={onClose} disabled={isSaving} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <X size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.mediaRow}>
          <TouchableOpacity style={styles.mediaButton} onPress={handleAddImage} disabled={busy}>
            <ImageIcon size={16} color={colors.onAccent} />
            <Text style={styles.mediaButtonText}>Imagem</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.mediaButton, isRecording && styles.mediaButtonRecording]}
            onPress={handleToggleRecord}
            disabled={isSaving || isCapturingVideo}
          >
            <Mic size={16} color={isRecording ? colors.danger : colors.onAccent} />
            <Text style={[styles.mediaButtonText, isRecording && styles.mediaButtonTextRecording]}>
              {isRecording ? `Gravando... ${recordTime}` : 'Áudio'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.mediaButton} onPress={handleAddVideo} disabled={busy}>
            {isCapturingVideo ? (
              <ActivityIndicator size="small" color={colors.onAccent} />
            ) : (
              <VideoIcon size={16} color={colors.onAccent} />
            )}
            <Text style={styles.mediaButtonText}>Vídeo</Text>
          </TouchableOpacity>
        </View>

        {pendentes.map(item => (
          <View key={item.id} style={styles.previewRow}>
            {item.tipo === 'imagem' ? (
              <Image source={{ uri: item.payload.arquivo.uri }} style={styles.thumb} />
            ) : (
              <View style={[styles.thumb, styles.thumbIcon]}>
                {item.tipo === 'audio'
                  ? <Mic size={18} color={colors.textSecondary} />
                  : <VideoIcon size={18} color={colors.textSecondary} />}
              </View>
            )}
            <Text style={styles.previewName} numberOfLines={1}>{item.payload.nome}</Text>
            <TouchableOpacity onPress={() => removerPendente(item.id)} disabled={isSaving} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        ))}

        {pendentes.length === 0 ? (
          <Text style={styles.hint}>Escolha uma imagem, grave um áudio ou um vídeo. Você pode adicionar mais de um antes de salvar.</Text>
        ) : null}
      </ScrollView>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity
        style={[styles.saveButton, (pendentes.length === 0 || busy) && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={pendentes.length === 0 || busy}
      >
        {isSaving ? <ActivityIndicator color={colors.onAccent} /> : <Check size={18} color={colors.onAccent} />}
        <Text style={styles.saveButtonText}>
          {isSaving ? 'Salvando...' : `Salvar evidências${pendentes.length ? ` (${pendentes.length})` : ''}`}
        </Text>
      </TouchableOpacity>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderAlt,
  },
  headerText: { flex: 1 },
  title: { color: colors.textPrimary, fontSize: 17, fontWeight: '600' },
  subtitle: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
  content: { padding: 16, gap: 10, flexGrow: 1 },
  mediaRow: { flexDirection: 'row', gap: 10, marginBottom: 6 },
  mediaButton: {
    flex: 1,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderAlt,
    borderRadius: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  mediaButtonRecording: { borderColor: colors.danger },
  mediaButtonText: { color: colors.onAccent, fontSize: 13 },
  mediaButtonTextRecording: { color: colors.danger },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 10,
    padding: 8,
  },
  thumb: { width: 44, height: 44, borderRadius: 8 },
  thumbIcon: {
    backgroundColor: colors.borderAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewName: { flex: 1, color: colors.textPrimary, fontSize: 12 },
  hint: { color: colors.textSecondary, fontSize: 13, textAlign: 'center', marginTop: 24 },
  error: {
    color: colors.danger,
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  saveButton: {
    backgroundColor: colors.accent,
    marginHorizontal: 16,
    marginBottom: 20,
    paddingVertical: 15,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  saveButtonDisabled: { opacity: 0.5 },
  saveButtonText: { color: colors.onAccent, fontSize: 15, fontWeight: '500' },
})