
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
import { ArrowLeft, CalendarDays, MapPin } from 'lucide-react-native'

import { colors } from '@/theme/colors'
import { useLembretes } from './hooks/useLembretes'
import type { Lembrete } from './types'

const filtros = {
  limite: 10,
  order: 'data_coleta:asc' as const,
}

function formatarData(data: string): string {
  const [ano, mes, dia] = data.slice(0, 10).split('-')
  return `${dia}/${mes}/${ano}`
}

export function LembreteListScreen() {
  const navigation = useNavigation()

  const {
    data,
    loading,
    error,
    refresh,
    page,
    hasNextPage,
    nextPage,
    previousPage,
  } = useLembretes(filtros)

  function renderLembrete({ item }: { item: Lembrete }) {
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          Lembrete #{item.id}
        </Text>

        <View style={styles.infoRow}>
          <CalendarDays
            size={18}
            color={colors.accent}
          />
          <Text style={styles.infoText}>
            {formatarData(item.data_coleta)}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <MapPin
            size={18}
            color={colors.accent}
          />
          <Text style={styles.infoText}>
            {item.local_coleta}
          </Text>
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={12}
        >
          <ArrowLeft
            color={colors.textPrimary}
            size={24}
          />
        </TouchableOpacity>

        <Text style={styles.title}>
          Meus Lembretes
        </Text>

        <View style={{ width: 24 }} />
      </View>

      {loading && !data ? (
        <View style={styles.center}>
          <ActivityIndicator
            size="large"
            color={colors.accent}
          />
          <Text style={styles.message}>
            Carregando lembretes...
          </Text>
        </View>
      ) : error && !data ? (
        <View style={styles.center}>
          <Text style={styles.message}>
            Não foi possível carregar os lembretes.
          </Text>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => refresh()}
          >
            <Text style={styles.actionText}>
              Tentar novamente
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={data?.itens ?? []}
            keyExtractor={item => String(item.id)}
            renderItem={renderLembrete}
            contentContainerStyle={styles.list}
            onRefresh={() => refresh()}
            refreshing={loading}
            ListEmptyComponent={
              <View style={styles.center}>
                <CalendarDays
                  size={40}
                  color={colors.textSecondary}
                />
                <Text style={styles.message}>
                  Nenhum lembrete encontrado.
                </Text>
              </View>
            }
          />

          {data && data.total > 0 && (
            <View style={styles.pagination}>
              <TouchableOpacity
                disabled={page === 1 || loading}
                onPress={previousPage}
                style={[
                  styles.pageButton,
                  (page === 1 || loading) &&
                    styles.disabledButton,
                ]}
              >
                <Text style={styles.actionText}>
                  Anterior
                </Text>
              </TouchableOpacity>

              <Text style={styles.infoText}>
                Página {page}
              </Text>

              <TouchableOpacity
                disabled={!hasNextPage || loading}
                onPress={nextPage}
                style={[
                  styles.pageButton,
                  (!hasNextPage || loading) &&
                    styles.disabledButton,
                ]}
              >
                <Text style={styles.actionText}>
                  Próxima
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </SafeAreaView>
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
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderAlt,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: 'bold',
  },
  list: {
    padding: 16,
    flexGrow: 1,
  },
  card: {
    backgroundColor: colors.surfaceAlt,
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  infoText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  message: {
    color: colors.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    marginTop: 12,
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 8,
  },
  actionText: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: 'bold',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.borderAlt,
  },
  pageButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  disabledButton: {
    opacity: 0.4,
  },
})
