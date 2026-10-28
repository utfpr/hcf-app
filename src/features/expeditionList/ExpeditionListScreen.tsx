import { useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Menu } from 'lucide-react-native'

import { CampoBusca } from '@/components/CampoBusca'
import { FiltroChips, type OpcaoFiltro } from '@/components/FiltroChips'
import { OfflineBanner } from '@/components/OfflineBanner'
import { useAuth } from '@/contexts/Auth/useAuth'
import type { ExpeditionStatus } from '@/features/home/types'
import { RootStackParamList } from '@/navigation/types'
import { colors } from '@/theme/colors'

import { useExpeditionsInfinite } from '../expedition/hooks/useExpeditionsInfinite'
import { ExpeditionCard } from '../home/components/ExpeditionCard'
import { toApiDate, toExpedition } from '../home/mapExpeditions'
import { NavigationMenu } from '../navigation/NavigationMenu'

type ExpeditionListNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ExpeditionList'>

// paddingVertical (12 + 12) + ícone do menu (24)
const HEADER_HEIGHT = 48

type FiltroStatus = 'todas' | ExpeditionStatus

const OPCOES_STATUS: ReadonlyArray<OpcaoFiltro<FiltroStatus>> = [
  { valor: 'todas', rotulo: 'Todas' },
  { valor: 'Em andamento', rotulo: 'Em andamento' },
  { valor: 'Planejada', rotulo: 'Planejadas' },
  { valor: 'Finalizada', rotulo: 'Finalizadas' },
]

export function ExpeditionListScreen() {
  const navigation = useNavigation<ExpeditionListNavigationProp>()
  const { user } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const [busca, setBusca] = useState('')
  const [status, setStatus] = useState<FiltroStatus>('todas')
  const filtrando = busca.trim() !== '' || status !== 'todas'
  const { itens, error, loading, loadingMore, loadMore, refresh, syncStatusDe } = useExpeditionsInfinite({
    busca,
    status: status === 'todas' ? null : status,
  })
  const today = toApiDate(new Date())

  // Componentes de Loading e Erro
  function renderContent() {
    if (loading && itens.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      )
    }

    if (error && itens.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>Não foi possível carregar as expedições.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refresh()}>
            <Text style={styles.retryButtonText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      )
    }

    if (!loading && itens.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>
            {filtrando ? 'Nenhuma expedição com esse filtro.' : 'Nenhuma expedição encontrada.'}
          </Text>
        </View>
      )
    }

    return (
      <FlatList
        data={itens}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={styles.content}
        numColumns={2}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={<Text style={styles.title}>Expedições</Text>}
        refreshing={loading}
        onRefresh={refresh}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        renderItem={({ item }) => (
          <ExpeditionCard
            expedition={toExpedition(item, today, syncStatusDe(item.id))}
            onPress={expedition => navigation.navigate('ExpeditionDetail', { expeditionId: expedition.id })}
          />
        )}
        // Indicador de carregamento do scroll infinito
        ListFooterComponent={
          loadingMore ? <ActivityIndicator style={styles.footerLoader} color={colors.accent} /> : null
        }
      />
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity hitSlop={12} onPress={() => setIsMenuOpen(open => !open)}>
          <Menu size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.userName} numberOfLines={1}>{user?.nome}</Text>
      </View>

      <OfflineBanner />

      <View style={styles.filtros}>
        <CampoBusca value={busca} onChangeText={setBusca} placeholder="Buscar por nome ou cidade" />
        <FiltroChips opcoes={OPCOES_STATUS} selecionado={status} onSelecionar={setStatus} />
      </View>

      {renderContent()}

      <NavigationMenu
        visible={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        current="ExpeditionList"
        headerHeight={HEADER_HEIGHT}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userName: {
    flexShrink: 1,
    marginLeft: 16,
    color: colors.textPrimary,
    fontSize: 14,
  },
  filtros: {
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 16,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderAlt,
  },
  retryButtonText: {
    color: colors.textPrimary,
    fontSize: 14,
  },
  footerLoader: {
    marginVertical: 20,
  },
})

