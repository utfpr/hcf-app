import {
  ActivityIndicator,
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
import { ArrowLeft } from 'lucide-react-native'
import { useState } from 'react'

import { EvidenceMode, RootStackParamList } from '@/navigation/types'
import { colors } from '@/theme/colors'

import { useExpedition } from '../expedition/hooks/useExpedition'
import { formatDate, getStatus } from '../expedition/utils'

type ExpeditionDetailRouteProp = RouteProp<RootStackParamList, 'ExpeditionDetail'>
type ExpeditionDetailNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ExpeditionDetail'>

const MOCK_COORDS = { latitude: -20.2508, longitude: -46.4167 }

export function ExpeditionDetailScreen() {
  const navigation = useNavigation<ExpeditionDetailNavigationProp>()
  const route = useRoute<ExpeditionDetailRouteProp>()
  const { expeditionId } = route.params

  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const { data, error, loading, refresh } = useExpedition(Number(expeditionId))
  function handleOpenForm(mode: EvidenceMode) {
    setIsMenuOpen(false)
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

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.expeditionName}>
          {data.descricao ?? `Expedição #${data.id}`}
        </Text>
        <View style={styles.infoRow}>
          <Text style={styles.info}>
            🕒 {formatDate(data.data_inicio)} – {formatDate(data.data_fim)}
          </Text>
          <Text style={styles.status}>{status}</Text>
        </View>

        {/* TODO: seção de registros (diário/coleta) entra aqui quando a
            integração com a feature de evidências (evidenceForm) estiver pronta */}
      </ScrollView>

      {isMenuOpen && (
        <View style={styles.floatingMenu}>
          <TouchableOpacity style={styles.menuOption} onPress={() => handleOpenForm('diary')}>
            <Text style={styles.menuOptionText}>📘 Novo diário</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuOption} onPress={() => handleOpenForm('collection')}>
            <Text style={styles.menuOptionText}>🌿 Nova coleta</Text>
          </TouchableOpacity>
        </View>
      )}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => setIsMenuOpen(!isMenuOpen)}
      >
        <Text style={styles.floatingButtonText}>+</Text>
      </TouchableOpacity>
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
  info: { color: colors.textSecondary, marginRight: 12 },
  status: { color: colors.accent },
  sectionTitle: { color: colors.textSecondary, fontSize: 12, marginTop: 20, marginBottom: 8 },
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