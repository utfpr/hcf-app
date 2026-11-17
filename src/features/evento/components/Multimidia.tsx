import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Camera, FileText, Mic, Pause, Play, Upload, Video, X } from 'lucide-react-native'
import VideoPlayer from 'react-native-video'

import { SeloNaFila } from '@/features/sync/components/SeloNaFila'
import { colors } from '@/theme/colors'

import { descricaoAnexo, type MultimidiaState } from '../hooks/useMultimidia'

interface PecaProps {
  state: MultimidiaState
  // Bloqueia os botões, por exemplo enquanto as evidências estão sendo enviadas
  disabled?: boolean
}

interface BotoesMidiaProps extends PecaProps {
  // Lembrete: só foto (câmera e galeria), sem vídeo nem áudio
  apenasFotos?: boolean
  // Rodapé fixo: todos os botões numa linha, ícone sobre o rótulo
  compacto?: boolean
}

const HIT_SLOP = { top: 8, bottom: 8, left: 8, right: 8 }

/**
 * Players ocultos que leem a duração dos vídeos escolhidos. Precisam ficar montados
 * mesmo com a lista de anexos fechada, senão o salvar fica bloqueado esperando.
 */
export function ValidadorVideos({ state }: Pick<PecaProps, 'state'>) {
  return (
    <>
      {state.pendentes.filter(item => item.tipo === 'video' && item.validandoDuracao).map(item => (
        <VideoPlayer
          key={`duracao-${item.id}`}
          source={{ uri: item.payload.arquivo.uri }}
          paused
          style={styles.hiddenVideo}
          onLoad={evento => state.validarDuracaoVideo(item.id, evento.duration)}
          onError={() => state.rejeitarVideoSemDuracao(item.id)}
        />
      ))}
    </>
  )
}

export function BotoesMidia({ state, disabled = false, apenasFotos = false, compacto = false }: BotoesMidiaProps) {
  const { isRecording, recordTime, isCapturing } = state
  const botao = [styles.mediaButton, compacto && styles.mediaButtonCompacto]
  const texto = [styles.mediaButtonText, compacto && styles.mediaButtonTextCompacto]

  return (
    <View style={[styles.mediaRow, compacto && styles.mediaRowCompacta]}>
      <TouchableOpacity style={botao} onPress={state.capturarFoto} disabled={disabled || state.busy}>
        {isCapturing
          ? <ActivityIndicator size="small" color={colors.onAccent} />
          : <Camera size={16} color={colors.onAccent} />}
        <Text style={texto} numberOfLines={1} adjustsFontSizeToFit>Foto</Text>
      </TouchableOpacity>

      {apenasFotos ? null : (
        <TouchableOpacity style={botao} onPress={state.capturarVideo} disabled={disabled || state.busy}>
          <Video size={16} color={colors.onAccent} />
          <Text style={texto} numberOfLines={1} adjustsFontSizeToFit>Vídeo</Text>
        </TouchableOpacity>
      )}

      {apenasFotos ? null : (
        <TouchableOpacity
          style={[...botao, isRecording && styles.mediaButtonRecording]}
          onPress={state.alternarGravacao}
          disabled={disabled || isCapturing}
        >
          <Mic size={16} color={isRecording ? colors.danger : colors.onAccent} />
          <Text style={[...texto, isRecording && styles.mediaButtonTextRecording]} numberOfLines={1} adjustsFontSizeToFit>
            {isRecording ? recordTime : 'Áudio'}
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={botao} onPress={state.upload} disabled={disabled || state.busy}>
        <Upload size={16} color={colors.onAccent} />
        <Text style={texto} numberOfLines={1} adjustsFontSizeToFit>
          {apenasFotos ? 'Galeria' : 'Arquivo'}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

/** Anexos ainda no aparelho, cada um com o selo de que sobe no próximo "Sincronizar" */
export function ListaAnexos({ state, disabled = false }: PecaProps) {
  const { pendentes, isRecording, playingId } = state

  return (
    <>
      {pendentes.map(item => (
        <View key={item.id} style={styles.previewRow}>
          {item.tipo === 'imagem' ? (
            <Image source={{ uri: item.payload.arquivo.uri }} style={styles.thumb} />
          ) : item.tipo === 'audio' ? (
            <TouchableOpacity
              style={[styles.thumb, styles.thumbIcon]}
              onPress={() => state.alternarReproducao(item)}
              disabled={isRecording}
            >
              {playingId === item.id
                ? <Pause size={18} color={colors.accent} />
                : <Play size={18} color={colors.textSecondary} />}
            </TouchableOpacity>
          ) : (
            <View style={[styles.thumb, styles.thumbIcon]}>
              {item.tipo === 'video'
                ? <Video size={18} color={colors.textSecondary} />
                : <FileText size={18} color={colors.textSecondary} />}
            </View>
          )}
          <View style={styles.previewInfo}>
            <Text style={styles.previewName} numberOfLines={1}>{item.payload.nome}</Text>
            {item.validandoDuracao ? (
              <Text style={styles.previewMeta}>Verificando duração do vídeo...</Text>
            ) : (
              <>
                <Text style={styles.previewMeta}>{descricaoAnexo(item)}</Text>
                <SeloNaFila style={styles.selo} />
              </>
            )}
          </View>
          <TouchableOpacity onPress={() => state.remover(item.id)} disabled={disabled} hitSlop={HIT_SLOP}>
            <X size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      ))}
    </>
  )
}

/** Botões e lista juntos, como no modal "Adicionar evidência" */
export function Multimidia({ state, disabled = false, apenasFotos = false }: Omit<BotoesMidiaProps, 'compacto'>) {
  return (
    <View>
      <ValidadorVideos state={state} />
      <BotoesMidia state={state} disabled={disabled} apenasFotos={apenasFotos} />
      {state.error ? <Text style={styles.error}>{state.error}</Text> : null}
      <ListaAnexos state={state} disabled={disabled} />
    </View>
  )
}

const styles = StyleSheet.create({
  mediaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  mediaRowCompacta: {
    flexWrap: 'nowrap',
    gap: 8,
    marginBottom: 8,
  },
  mediaButton: {
    width: '47%',
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
  mediaButtonCompacto: {
    width: undefined,
    flex: 1,
    flexDirection: 'column',
    paddingVertical: 8,
    gap: 2,
  },
  mediaButtonRecording: { borderColor: colors.danger },
  mediaButtonText: { color: colors.onAccent, fontSize: 13 },
  mediaButtonTextCompacto: { fontSize: 12 },
  mediaButtonTextRecording: { color: colors.danger },
  error: {
    color: colors.danger,
    fontSize: 12,
    marginBottom: 12,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 10,
    padding: 8,
    marginBottom: 8,
  },
  thumb: { width: 44, height: 44, borderRadius: 8 },
  thumbIcon: {
    backgroundColor: colors.borderAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hiddenVideo: {
    width: 0,
    height: 0,
  },
  previewInfo: { flex: 1 },
  previewName: { color: colors.textPrimary, fontSize: 12 },
  previewMeta: { color: colors.textSecondary, fontSize: 11, marginTop: 2 },
  selo: { marginTop: 4 },
})
