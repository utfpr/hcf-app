import { Image, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Bell, CalendarDays, Crosshair, MapPin } from 'lucide-react-native'

import { urlDoArquivo } from '@/features/evento/utils'
import { SyncStatusIndicator } from '@/features/sync/components/SyncStatusIndicator'
import { colors } from '@/theme/colors'

import type { Lembrete } from '../types'

interface LembreteCardProps {
  lembrete: Lembrete
}

function formatarData(dataIso: string): string {
  const [ano, mes, dia] = dataIso.slice(0, 10).split('-')
  return `${dia}/${mes}/${ano}`
}

function formatarCoordenadas(latitude: number, longitude: number): string {
  return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
}

// Card de lembrete usado na aba da expedição e na tela de todos os lembretes:
// data, descrição, local de coleta, coordenadas e fotos anexadas.
export function LembreteCard({ lembrete }: LembreteCardProps) {
  const titulo = lembrete.nome_cientifico ?? lembrete.familia
  const temCoordenadas = lembrete.latitude != null && lembrete.longitude != null
  const fotos = lembrete.evidencias ?? []

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.badge}>
          <Bell size={12} color={colors.bell} />
          <Text style={styles.badgeText}>
            {lembrete.id > 0 ? `Lembrete #${lembrete.id}` : 'Lembrete (no aparelho)'}
          </Text>
        </View>
        <SyncStatusIndicator status={lembrete.syncStatus ?? 'synced'} />
      </View>

      {titulo ? <Text style={styles.title}>{titulo}</Text> : null}

      <View style={styles.row}>
        <CalendarDays size={15} color={colors.accent} />
        <Text style={[styles.info, styles.infoDestaque]}>
          Voltar em: {formatarData(lembrete.data_coleta)}
        </Text>
      </View>

      {lembrete.descricao ? (
        <Text style={styles.descricao}>{lembrete.descricao}</Text>
      ) : null}

      <View style={styles.row}>
        <MapPin size={15} color={colors.textSecondary} />
        <Text style={styles.info}>{lembrete.local_coleta}</Text>
      </View>

      {temCoordenadas ? (
        <View style={styles.row}>
          <Crosshair size={15} color={colors.textSecondary} />
          <Text style={styles.info}>
            {formatarCoordenadas(lembrete.latitude as number, lembrete.longitude as number)}
          </Text>
        </View>
      ) : null}

      {fotos.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.fotos}>
          {fotos.map(foto => (
            <Image key={foto.id} source={{ uri: urlDoArquivo(foto.url) }} style={styles.foto} />
          ))}
        </ScrollView>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceAlt,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 8,
  },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  badgeText: { color: colors.bell, fontSize: 12, fontWeight: '600' },
  title: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  info: { flexShrink: 1, color: colors.textSecondary, fontSize: 14 },
  infoDestaque: { color: colors.accent },
  descricao: {
    color: colors.textPrimary,
    fontSize: 14,
    marginBottom: 8,
  },
  fotos: { marginTop: 8 },
  foto: {
    width: 84,
    height: 84,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: colors.borderAlt,
  },
})
