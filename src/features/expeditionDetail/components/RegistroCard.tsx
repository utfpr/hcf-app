import { Image, StyleSheet, Text, View } from 'react-native'
import { BookOpen, Clock, FileText, Leaf, MapPin, Mic, Video } from 'lucide-react-native'

import { API_BASE_URL } from '@env'
import type { Evidencia, RegistroExpedicao } from '@/features/evento/types'
import { colors } from '@/theme/colors'

// A API serve os arquivos em /uploads na raiz do servidor, fora do prefixo da API (ex.: /api)
const API_ORIGIN = API_BASE_URL.match(/^https?:\/\/[^/]+/)?.[0] ?? ''

function arquivoUrl(evidencia: Evidencia): string {
  return `${API_ORIGIN}${evidencia.url}`
}

function formatDateTime(iso: string): string {
  const date = new Date(iso)
  return `${date.toLocaleDateString('pt-BR')} ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
}

function EvidenciaIcon({ mimeType }: { mimeType: string }) {
  if (mimeType.startsWith('audio/')) return <Mic size={14} color={colors.textSecondary} />
  if (mimeType.startsWith('video/')) return <Video size={14} color={colors.textSecondary} />
  return <FileText size={14} color={colors.textSecondary} />
}

interface RegistroCardProps {
  registro: RegistroExpedicao
}

export function RegistroCard({ registro }: RegistroCardProps) {
  const isColeta = registro.tipo === 'COLETA'
  const imagens = registro.evidencias.filter(e => e.mime_type.startsWith('image/'))
  const outros = registro.evidencias.filter(e => !e.mime_type.startsWith('image/'))

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.tipoBadge}>
          {isColeta
            ? <Leaf size={12} color={colors.accent} />
            : <BookOpen size={12} color={colors.accent} />}
          <Text style={styles.tipoText}>{isColeta ? 'Coleta' : 'Diário'}</Text>
        </View>
        <View style={styles.metaItem}>
          <Clock size={12} color={colors.textSecondary} />
          <Text style={styles.metaText}>{formatDateTime(registro.capturado_em)}</Text>
        </View>
      </View>

      {isColeta && registro.coleta ? (
        <View style={styles.coleta}>
          {registro.coleta.nome_cientifico ? (
            <Text style={styles.nomeCientifico}>{registro.coleta.nome_cientifico}</Text>
          ) : null}
          {registro.coleta.familia ? (
            <Text style={styles.familia}>{registro.coleta.familia}</Text>
          ) : null}
        </View>
      ) : null}

      {registro.observacoes ? (
        <Text style={styles.observacoes}>{registro.observacoes}</Text>
      ) : null}

      {registro.latitude !== null && registro.longitude !== null ? (
        <View style={styles.metaItem}>
          <MapPin size={12} color={colors.textSecondary} />
          <Text style={styles.metaText}>
            {registro.latitude.toFixed(4)}, {registro.longitude.toFixed(4)}
          </Text>
        </View>
      ) : null}

      {imagens.length > 0 ? (
        <View style={styles.imagens}>
          {imagens.map(imagem => (
            <Image key={imagem.id} source={{ uri: arquivoUrl(imagem) }} style={styles.imagem} />
          ))}
        </View>
      ) : null}

      {outros.map(evidencia => (
        <View key={evidencia.id} style={styles.arquivo}>
          <EvidenciaIcon mimeType={evidencia.mime_type} />
          <Text style={styles.arquivoNome} numberOfLines={1}>{evidencia.nome}</Text>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderAlt,
    padding: 12,
    marginBottom: 12,
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tipoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 4,
    paddingVertical: 3,
    paddingHorizontal: 7,
  },
  tipoText: {
    color: colors.accent,
    fontSize: 11,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  coleta: {
    gap: 2,
  },
  nomeCientifico: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  familia: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  observacoes: {
    color: colors.textPrimary,
    fontSize: 13,
  },
  imagens: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  imagem: {
    width: 72,
    height: 72,
    borderRadius: 8,
    backgroundColor: colors.surfaceAlt,
  },
  arquivo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  arquivoNome: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 12,
  },
})
