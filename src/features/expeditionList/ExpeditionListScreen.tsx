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

import { useAuth } from '@/contexts/Auth/useAuth'
import { RootStackParamList } from '@/navigation/types'
import { colors } from '@/theme/colors'

import { useExpeditionsInfinite } from '../expedition/hooks/useExpeditionsInfinite'
import { ExpeditionCard } from '../home/components/ExpeditionCard'
import { toApiDate, toExpedition } from '../home/mapExpeditions'

type ExpeditionListNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ExpeditionList'>

export function ExpeditionListScreen() {
  const navigation = useNavigation<ExpeditionListNavigationProp>()
  const { user } = useAuth()

  const { itens, error, loading, loadingMore, loadMore, refresh } = useExpeditionsInfinite()
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
          <Text style={styles.emptyText}>Nenhuma expedição encontrada.</Text>
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
            expedition={toExpedition(item, today)}
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
        <TouchableOpacity hitSlop={12}>
          <Menu size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.userName} numberOfLines={1}>{user?.nome}</Text>
      </View>

      {renderContent()}
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