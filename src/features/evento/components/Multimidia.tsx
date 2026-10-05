import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Camera, FileText, Mic, Pause, Play, Upload, Video, X } from 'lucide-react-native'

import { colors } from '@/theme/colors'

import type { MultimidiaState } from '../hooks/useMultimidia'

interface MultimidiaProps {
  state: MultimidiaState
  // Bloqueia os botões, por exemplo enquanto as evidências estão sendo enviadas
  disabled?: boolean
}

const HIT_SLOP = { top: 8, bottom: 8, left: 8, right: 8 }

export function Multimidia({ state, disabled = false }: MultimidiaProps) {
  const { pendentes, error, isRecording, recordTime, isCapturing, playingId } = state

  return (
    <View>
      <View style={styles.mediaRow}>
        <TouchableOpacity
          style={styles.mediaButton}
          onPress={state.abrirCamera}
          disabled={disabled || state.busy}
        >
          {isCapturing
            ? <ActivityIndicator size="small" color={colors.onAccent} />
            : <Camera size={16} color={colors.onAccent} />}
          <Text style={styles.mediaButtonText} numberOfLines={1} adjustsFontSizeToFit>Câmera</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.mediaButton}
          onPress={state.upload}
          disabled={disabled || state.busy}
        >
          <Upload size={16} color={colors.onAccent} />
          <Text style={styles.mediaButtonText} numberOfLines={1} adjustsFontSizeToFit>Upload</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.mediaButton, isRecording && styles.mediaButtonRecording]}
          onPress={state.alternarGravacao}
          disabled={disabled || isCapturing}
        >
          <Mic size={16} color={isRecording ? colors.danger : colors.onAccent} />
          <Text
            style={[styles.mediaButtonText, isRecording && styles.mediaButtonTextRecording]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {isRecording ? recordTime : 'Áudio'}
          </Text>
        </TouchableOpacity>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

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
            <Text style={styles.previewMeta}>{item.detalhe}</Text>
          </View>
          <TouchableOpacity onPress={() => state.remover(item.id)} disabled={disabled} hitSlop={HIT_SLOP}>
            <X size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  mediaRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
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
  previewInfo: { flex: 1 },
  previewName: { color: colors.textPrimary, fontSize: 12 },
  previewMeta: { color: colors.textSecondary, fontSize: 11, marginTop: 2 },
})
