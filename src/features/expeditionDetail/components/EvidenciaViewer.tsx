import { useState } from 'react'
import { ActivityIndicator, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { X } from 'lucide-react-native'
import Video from 'react-native-video'

import type { Evidencia } from '@/features/evento/types'
import { arquivoUrl, tipoEvidencia } from '@/features/evento/utils'
import { colors } from '@/theme/colors'

interface EvidenciaViewerProps {
  evidencia: Evidencia | null
  onClose: () => void
}

// Visualizador em tela cheia de imagens e vídeos (o áudio toca direto no card do registro)
export function EvidenciaViewer({ evidencia, onClose }: EvidenciaViewerProps) {
  return (
    <Modal visible={!!evidencia} animationType="fade" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>{evidencia?.nome}</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <X size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* key força remontar o player ao trocar de evidência */}
        {evidencia ? <Conteudo key={evidencia.id} evidencia={evidencia} /> : null}
      </SafeAreaView>
    </Modal>
  )
}

function Conteudo({ evidencia }: { evidencia: Evidencia }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const uri = arquivoUrl(evidencia)
  const tipo = tipoEvidencia(evidencia)

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Não foi possível abrir este arquivo.</Text>
      </View>
    )
  }

  if (tipo === 'imagem') {
    return (
      <View style={styles.media}>
        <Image
          source={{ uri }}
          style={styles.fill}
          resizeMode="contain"
          onLoadEnd={() => setLoading(false)}
          onError={() => setError(true)}
        />
        {loading ? <ActivityIndicator style={styles.loading} color={colors.accent} size="large" /> : null}
      </View>
    )
  }

  if (tipo === 'video') {
    return (
      <View style={styles.media}>
        <Video
          source={{ uri }}
          style={styles.fill}
          resizeMode="contain"
          controls
          onLoad={() => setLoading(false)}
          onError={() => setError(true)}
        />
        {loading ? <ActivityIndicator style={styles.loading} color={colors.accent} size="large" /> : null}
      </View>
    )
  }

  return (
    <View style={styles.centered}>
      <Text style={styles.errorText}>Tipo de arquivo sem visualização ({evidencia.mime_type}).</Text>
    </View>
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
  title: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 15,
  },
  media: {
    flex: 1,
    justifyContent: 'center',
  },
  fill: {
    flex: 1,
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
})
