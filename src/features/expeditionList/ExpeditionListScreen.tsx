
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
import {
  Calendar,
  Menu,
  MapPin,
  Plus,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react-native'

import { RootStackParamList } from '@/navigation/types'
import { colors } from '@/theme/colors'

import { useExpeditions } from '../expedition/hooks/useExpeditions'
import { ExpedicaoListItem } from '../expedition/types'
import { formatDate, getStatus } from '../expedition/utils'

type ExpeditionListNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ExpeditionList'
>

export function ExpeditionListScreen() {
  const navigation = useNavigation<ExpeditionListNavigationProp>()

  const {
    data,
    error,
    loading,
    refresh,
    page,
    hasNextPage,
    nextPage,
    previousPage,
  } = useExpeditions()

  function renderContent() {
    if (loading && !data) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      )
    }

    if (error && !data) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>
            Não foi possível carregar as expedições.
          </Text>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => refresh()}
          >
            <Text style={styles.retryButtonText}>
              Tentar Novamente
            </Text>
          </TouchableOpacity>
        </View>
      )
    }

    if (data?.itens.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>
            Nenhuma expedição encontrada.
          </Text>
        </View>
      )
    }

    return (
      <FlatList
        data={data?.itens}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={styles.content}
        numColumns={2}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={
          <Text style={styles.title}>Expedições</Text>
        }
        refreshing={loading}
        onRefresh={refresh}
        renderItem={({ item }) => (
          <ExpeditionCard
            expedition={item}
            onPress={() =>
              navigation.navigate('ExpeditionDetail', {
                expeditionId: String(item.id),
              })
            }
          />
        )}
        ListFooterComponent={
          data && data.total > 0 ? (
            <View style={styles.paginationContainer}>
              <TouchableOpacity
                disabled={page === 1}
                onPress={previousPage}
                style={[
                  styles.pageButton,
                  page === 1 && styles.pageButtonDisabled,
                ]}
              >
                <ChevronLeft
                  color={
                    page === 1
                      ? colors.textSecondary
                      : colors.onAccent
                  }
                />
              </TouchableOpacity>

              <Text style={styles.pageText}>
                Página {page}
              </Text>

              <TouchableOpacity
                disabled={!hasNextPage}
                onPress={nextPage}
                style={[
                  styles.pageButton,
                  !hasNextPage && styles.pageButtonDisabled,
                ]}
              >
                <ChevronRight
                  color={
                    !hasNextPage
                      ? colors.textSecondary
                      : colors.onAccent
                  }
                />
              </TouchableOpacity>
            </View>
          ) : null
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

        {/* Botão para acessar a lista de lembretes */}
        <TouchableOpacity
          style={styles.lembretesButton}
          onPress={() => navigation.navigate('LembreteList')}
          accessibilityRole="button"
          accessibilityLabel="Abrir meus lembretes"
        >
          <Calendar size={16} color={colors.accent} />
          <Text style={styles.lembretesButtonText}>
            Meus Lembretes
          </Text>
        </TouchableOpacity>

        <Text style={styles.userName}>Dr. Silva</Text>
      </View>

      {renderContent()}

      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() =>
          navigation.navigate('Formulario', {
            latitude: -25.4284,
            longitude: -49.2733,
          })
        }
      >
        <Plus size={28} color={colors.onAccent} />
      </TouchableOpacity>
    </SafeAreaView>
  )
}

interface ExpeditionCardProps {
  expedition: ExpedicaoListItem
  onPress: () => void
}

function ExpeditionCard({
  expedition,
  onPress,
}: ExpeditionCardProps) {
  const status = getStatus(
    expedition.data_inicio,
    expedition.data_fim,
  )

  const title =
    expedition.descricao ?? `Expedição #${expedition.id}`

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <Text style={styles.cardName} numberOfLines={2}>
        {title}
      </Text>

      <View style={styles.cardRow}>
        <Calendar
          size={13}
          color={colors.textSecondary}
        />
        <Text style={styles.cardRowText}>
          {formatDate(expedition.data_inicio)}
        </Text>
      </View>

      <View style={styles.cardRow}>
        <MapPin
          size={13}
          color={colors.textSecondary}
        />
        <Text
          style={styles.cardRowText}
          numberOfLines={1}
        >
          Cidade ID: {expedition.cidade_id}
        </Text>
      </View>

      <View style={styles.badge}>
        <Text style={styles.badgeText}>
          {status}
        </Text>
      </View>
    </TouchableOpacity>
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

  // Botão de navegação para lembretes
  lembretesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.surfaceAlt,
  },

  lembretesButtonText: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '600',
  },

  userName: {
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
  },

  card: {
    width: '48%',
    backgroundColor: colors.cardBackground,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderAlt,
    padding: 12,
    marginBottom: 12,
  },

  cardName: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },

  cardRowText: {
    color: colors.textSecondary,
    fontSize: 12,
  },

  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceAlt,
    borderRadius: 4,
    paddingVertical: 3,
    paddingHorizontal: 7,
    marginTop: 6,
  },

  badgeText: {
    color: colors.accent,
    fontSize: 10,
  },

  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
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

  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
    gap: 16,
  },

  pageButton: {
    backgroundColor: colors.surfaceAlt,
    padding: 8,
    borderRadius: 8,
  },

  pageButtonDisabled: {
    opacity: 0.5,
  },

  pageText: {
    color: colors.textPrimary,
    fontSize: 14,
  },
})
