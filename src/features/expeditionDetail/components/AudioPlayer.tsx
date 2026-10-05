import { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Pause, Play } from 'lucide-react-native'
import Video, { type VideoRef } from 'react-native-video'

import type { Evidencia } from '@/features/evento/types'
import { arquivoUrl } from '@/features/evento/utils'
import { colors } from '@/theme/colors'

function formatTime(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds))
  const min = Math.floor(total / 60)
  const sec = total % 60
  return `${min}:${String(sec).padStart(2, '0')}`
}

interface AudioPlayerProps {
  evidencia: Evidencia
  // Só um áudio toca por vez: o pai controla qual está ativo
  ativo: boolean
  onActivate: () => void
}

export function AudioPlayer({ evidencia, ativo, onActivate }: AudioPlayerProps) {
  const playerRef = useRef<VideoRef>(null)
  const [playing, setPlaying] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const [position, setPosition] = useState(0)
  const [duration, setDuration] = useState(0)
  const [barWidth, setBarWidth] = useState(0)
  // Muda a key do player para recarregar o arquivo ao tentar de novo após um erro
  const [tentativa, setTentativa] = useState(0)

  // Outro áudio foi iniciado (ou a tela abriu o visualizador): para este
  useEffect(() => {
    if (!ativo) {
      setPlaying(false)
      setLoaded(false)
      setPosition(0)
    }
  }, [ativo])

  function handleToggle() {
    if (error) {
      setError(false)
      setLoaded(false)
      setTentativa(t => t + 1)
      if (!ativo) onActivate()
      setPlaying(true)
      return
    }
    if (!ativo) onActivate()
    setPlaying(p => !p)
  }

  function handleSeek(locationX: number) {
    if (!loaded || !duration || !barWidth) return
    const time = (locationX / barWidth) * duration
    playerRef.current?.seek(time)
    setPosition(time)
  }

  const progress = duration ? Math.min(position / duration, 1) : 0
  const carregando = ativo && playing && !loaded && !error

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={handleToggle} hitSlop={8}>
        {carregando ? (
          <ActivityIndicator size="small" color={colors.onAccent} />
        ) : playing ? (
          <Pause size={16} color={colors.onAccent} />
        ) : (
          <Play size={16} color={colors.onAccent} />
        )}
      </TouchableOpacity>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{evidencia.nome}</Text>
        {error ? (
          <Text style={styles.error}>Não foi possível tocar o áudio.</Text>
        ) : (
          <View style={styles.progressRow}>
            <Pressable
              style={styles.track}
              onLayout={e => setBarWidth(e.nativeEvent.layout.width)}
              onPress={e => handleSeek(e.nativeEvent.locationX)}
              hitSlop={{ top: 10, bottom: 10 }}
            >
              <View style={[styles.fill, { width: `${progress * 100}%` }]} />
            </Pressable>
            <Text style={styles.time}>
              {formatTime(position)}{duration ? ` / ${formatTime(duration)}` : ''}
            </Text>
          </View>
        )}
      </View>

      {/* Player invisível: só existe enquanto este áudio está ativo */}
      {ativo ? (
        <Video
          key={tentativa}
          ref={playerRef}
          source={{ uri: arquivoUrl(evidencia) }}
          paused={!playing}
          style={styles.hidden}
          progressUpdateInterval={250}
          onLoad={e => {
            setLoaded(true)
            setDuration(e.duration)
          }}
          onProgress={e => setPosition(e.currentTime)}
          onEnd={() => {
            setPlaying(false)
            setPosition(0)
            playerRef.current?.seek(0)
          }}
          onError={() => {
            setError(true)
            setPlaying(false)
          }}
        />
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  button: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 6,
  },
  name: {
    color: colors.textPrimary,
    fontSize: 12,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  track: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderAlt,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.accent,
  },
  time: {
    color: colors.textSecondary,
    fontSize: 11,
    fontVariant: ['tabular-nums'],
  },
  error: {
    color: colors.danger,
    fontSize: 11,
  },
  hidden: {
    width: 0,
    height: 0,
  },
})
