import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { ArrowLeft, BookOpen, Clock, Leaf, Plus, Users } from 'lucide-react-native'
import { useState } from 'react'

import { EvidenceMode, RootStackParamList } from '@/navigation/types'
import { colors } from '@/theme/colors'

import { useRegistrosExpedicao } from '../evento/hooks/useRegistrosExpedicao'
import { useExpedition } from '../expedition/hooks/useExpedition'
import { formatDate, getStatus } from '../expedition/utils'

import type { Evidencia } from '../evento/types'

import { EvidenciaViewer } from './components/EvidenciaViewer'
import { RegistroCard } from './components/RegistroCard'

type ExpeditionDetailRouteProp = RouteProp<RootStackParamList, 'ExpeditionDetail'>
type ExpeditionDetailNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ExpeditionDetail'>

const MOCK_COORDS = { latitude: -20.2508, longitude: -46.4167 }

export function ExpeditionDetailScreen() {
  const navigation = useNavigation<ExpeditionDetailNavigationProp>()
  const route = useRoute<ExpeditionDetailRouteProp>()
  const { expeditionId } = route.params

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [evidenciaAberta, setEvidenciaAberta] = useState<Evidencia | null>(null)
  const [audioAtivoId, setAudioAtivoId] = useState<number | null>(null)

  function handleOpenEvidencia(evidencia: Evidencia) {
    // Para o áudio que estiver tocando antes de abrir a foto/vídeo
    setAudioAtivoId(null)
    setEvidenciaAberta(evidencia)
  }

  const { data, error, loading, refresh } = useExpedition(Number(expeditionId))
  const registros = useRegistrosExpedicao(Number(expeditionId))

  function handleRefresh() {
    refresh()
    registros.refresh()
  }

  function handleOpenForm(mode: EvidenceMode) {
    setIsMenuOpen(false)
    setAudioAtivoId(null)
    navigation.navigate('Formulario', { expeditionId, mode, ...MOCK_COORDS })
  }

  function renderHeader() {
    return (
      <View style={styles.header}>
        <TouchableOpacity
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft color={colors.textPrimary} size={22} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes da Expedição</Text>
        <View style={styles.headerSpacer} />
      </View>
    )
  }

  // Carregando pela primeira vez (sem nada em cache ainda)
  if (loading && !data) {
    return (
      <SafeAreaView style={styles.wrapper}>
        {renderHeader()}
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </SafeAreaView>
    )
  }

  // Erro ao buscar (sem nada em cache para mostrar)
  if (error && !data) {
    return (
      <SafeAreaView style={styles.wrapper}>
        {renderHeader()}
        <View style={styles.centered}>
          <Text style={styles.notFoundText}>Não foi possível carregar a expedição.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refresh()}>
            <Text style={styles.retryButtonText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  // Terminou de carregar e não veio nada (id inválido, por exemplo)
  if (!data) {
    return (
      <SafeAreaView style={styles.wrapper}>
        {renderHeader()}
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Expedição não encontrada.</Text>
        </View>
      </SafeAreaView>
    )
  }

  const status = getStatus(data.data_inicio, data.data_fim)

  return (
    <SafeAreaView style={styles.wrapper}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      {renderHeader()}

      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={(
          <RefreshControl
            refreshing={registros.validating && !registros.loading}
            onRefresh={handleRefresh}
            colors={[colors.accent]}
            tintColor={colors.accent}
          />
        )}
      >
        <Text style={styles.expeditionName}>
          {data.descricao ?? `Expedição #${data.id}`}
        </Text>
        <View style={styles.infoRow}>
          <View style={[styles.iconRow, styles.infoItem]}>
            <Clock color={colors.placeholder} size={12} />
            <Text style={styles.info}>
              {formatDate(data.data_inicio)} – {formatDate(data.data_fim)}
            </Text>
          </View>
          <Text style={styles.status}>{status}</Text>
        </View>

        <View style={styles.divider} />

        <View style={[styles.iconRow, styles.sectionHeader]}>
          <Users size={12} color={colors.textSecondary} />
          <Text style={styles.sectionTitleText}>EQUIPE</Text>
        </View>
        {data.participantes.length > 0 ? (
          <View style={styles.teamRow}>
            {data.participantes.map(participante => (
              <View key={participante.id} style={styles.memberTag}>
                <Text style={styles.memberTagText}>{participante.nome}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyTeamText}>Nenhum participante cadastrado.</Text>
        )}

        <View style={styles.divider} />

        {registros.loading && !registros.data ? (
          <ActivityIndicator color={colors.accent} />
        ) : registros.error && !registros.data ? (
          <View>
            <Text style={styles.emptyTeamText}>Não foi possível carregar os registros.</Text>
            <TouchableOpacity onPress={() => registros.refresh()}>
              <Text style={styles.retryLink}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        ) : registros.data?.length ? (
          registros.data.map(registro => (
            <RegistroCard
              key={registro.id}
              registro={registro}
              onOpenEvidencia={handleOpenEvidencia}
              audioAtivoId={audioAtivoId}
              onActivateAudio={setAudioAtivoId}
            />
          ))
        ) : (
          <Text style={styles.emptyTeamText}>
            Nenhum registro ainda. Use o botão + para adicionar uma coleta ou diário.
          </Text>
        )}
      </ScrollView>

      {isMenuOpen && (
        <View style={styles.floatingMenu}>
          <TouchableOpacity style={[styles.menuOption, styles.iconRow]} onPress={() => handleOpenForm('collection')}>
            <Leaf color={colors.accent} size={14} />
            <Text style={styles.menuOptionText}>Coleta</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.menuOption, styles.iconRow]} onPress={() => handleOpenForm('diary')}>
            <BookOpen color={colors.diary} size={14} />
            <Text style={styles.menuOptionText}>Diário</Text>
          </TouchableOpacity>
        </View>
      )}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => setIsMenuOpen(!isMenuOpen)}
      >
        <Text style={styles.floatingButtonText}><Plus color={colors.onAccent} size={28}/></Text>
      </TouchableOpacity>

      <EvidenciaViewer evidencia={evidenciaAberta} onClose={() => setEvidenciaAberta(null)} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderAlt,
  },
  CardIcon: {
    fontSize: 14,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '600',
  },
  headerSpacer: { width: 22 },
  container: {
    padding: 16,
    paddingBottom: 100,
  },
  expeditionName: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: 'bold',
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  iconRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  infoItem: { marginRight: 12 },
  info: { color: colors.textSecondary, fontSize: 12 },
  status: { color: colors.accent, fontWeight: 700 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 16, marginHorizontal: -16 },
  sectionHeader: { marginBottom: 8 },
  sectionTitleText: { color: colors.textSecondary, fontSize: 12, fontWeight: 700 },
  teamRow: { flexDirection: 'row', flexWrap: 'wrap' },
  memberTag: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  memberTagText: { color: colors.textPrimary, fontSize: 12 },
  emptyTeamText: { color: colors.textSecondary, fontSize: 13 },
  retryLink: { color: colors.accent, fontSize: 13, marginTop: 6 },
  floatingButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingButtonText: { color: colors.onAccent, fontSize: 28, lineHeight: 30 },
  floatingMenu: { position: 'absolute', bottom: 90, right: 24 },
  menuOption: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  menuOptionText: { color: colors.textPrimary, fontSize: 13 },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundText: {
    color: colors.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 16,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  retryButton: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  retryButtonText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: 'bold',
  },
})