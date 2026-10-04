import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { BookOpen, Clock, FileText, Leaf, MapPin, Play, Plus, Video } from 'lucide-react-native'


import type { Evidencia, RegistroExpedicao } from '@/features/evento/types'
import { arquivoUrl, tipoEvidencia } from '@/features/evento/utils'
import { colors } from '@/theme/colors'

import { AudioPlayer } from './AudioPlayer'

function formatDateTime(iso: string): string {
  const date = new Date(iso)
  return `${date.toLocaleDateString('pt-BR')} ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
}

function EvidenciaIcon({ evidencia }: { evidencia: Evidencia }) {
  const tipo = tipoEvidencia(evidencia)
  if (tipo === 'video') return <Video size={14} color={colors.textSecondary} />
  return <FileText size={14} color={colors.textSecondary} />
}

interface RegistroCardProps {
  registro: RegistroExpedicao
  onOpenEvidencia: (evidencia: Evidencia) => void
  onAddEvidencia: (registro: RegistroExpedicao) => void
  audioAtivoId: number | null
  onActivateAudio: (evidenciaId: number) => void
}

export function RegistroCard({ registro, onOpenEvidencia, onAddEvidencia, audioAtivoId, onActivateAudio }: RegistroCardProps) {
  const isColeta = registro.tipo === 'COLETA'
  const imagens = registro.evidencias.filter(e => tipoEvidencia(e) === 'imagem')
  const audios = registro.evidencias.filter(e => tipoEvidencia(e) === 'audio')
  const outros = registro.evidencias.filter(e => !['imagem', 'audio'].includes(tipoEvidencia(e)))

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.tipoBadge, !isColeta && styles.tipoBadgeDiary]}>
          {isColeta
            ? <Leaf size={12} color={colors.accent} />
            : <BookOpen size={12} color={colors.diary} />}
          <Text style={[styles.tipoText, isColeta ? styles.tipoTextColeta : styles.tipoTextDiario]}>{isColeta ? 'Coleta' : 'Diário'}</Text>
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

      {imagens.length > 0 ? (
        <View style={styles.imagens}>
          {imagens.map(imagem => (
            <TouchableOpacity key={imagem.id} onPress={() => onOpenEvidencia(imagem)} activeOpacity={0.8}>
              <Image source={{ uri: arquivoUrl(imagem) }} style={styles.imagem} />
            </TouchableOpacity>
          ))}
        </View>
      ) : null}

      {audios.map(audio => (
        <AudioPlayer
          key={audio.id}
          evidencia={audio}
          ativo={audioAtivoId === audio.id}
          onActivate={() => onActivateAudio(audio.id)}
        />
      ))}

      {outros.map(evidencia => (
        <TouchableOpacity
          key={evidencia.id}
          style={styles.arquivo}
          onPress={() => onOpenEvidencia(evidencia)}
          activeOpacity={0.8}
        >
          <EvidenciaIcon evidencia={evidencia} />
          <Text style={styles.arquivoNome} numberOfLines={1}>{evidencia.nome}</Text>
          <Play size={14} color={colors.accent} />
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={styles.addEvidencia}
        onPress={() => onAddEvidencia(registro)}
        activeOpacity={0.8}
      >
        <Plus size={14} color={colors.accent} />
        <Text style={styles.addEvidenciaText}>Adicionar evidência</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <View style={styles.metaItem}>
          <Clock size={12} color={colors.textSecondary} />
          <Text style={styles.metaText}>{formatDateTime(registro.capturado_em)}</Text>
        </View>
        {registro.latitude !== null && registro.longitude !== null ? (
          <View style={styles.metaItem}>
            <MapPin size={12} color={colors.textSecondary} />
            <Text style={styles.metaText}>
              {registro.latitude.toFixed(4)}, {registro.longitude.toFixed(4)}
            </Text>
          </View>
        ) : null}
      </View>
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
    backgroundColor: colors.backgroundAccent,
    borderRadius: 9999,
    paddingVertical: 3,
    paddingHorizontal: 7,
  },
  tipoBadgeDiary: {
    backgroundColor: colors.backgroundDiary,
  },
  tipoText: {
    fontSize: 11,
  },
  tipoTextColeta: {
    color: colors.accent,
  },
  tipoTextDiario: {
    color: colors.diary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: colors.textSecondary,
    fontSize: 10,
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
    addEvidencia: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  addEvidenciaText: {
    color: colors.accent,
    fontSize: 12,
  },
})
