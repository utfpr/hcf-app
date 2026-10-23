import { useMemo, useState } from 'react'
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
import { ArrowLeft, CalendarDays } from 'lucide-react-native'

import { FiltroChips, type OpcaoFiltro } from '@/components/FiltroChips'
import { OfflineBanner } from '@/components/OfflineBanner'
import { toApiDate } from '@/features/home/mapExpeditions'
import { colors } from '@/theme/colors'
import { LembreteCard } from './components/LembreteCard'
import { useLembretesInfinite } from './hooks/useLembretesInfinite'
import type { FiltrosLembrete, Lembrete } from './types'

const UM_DIA_MS = 24 * 60 * 60 * 1000

type Periodo = 'proximos' | 'semana' | 'vencidos' | 'todos'

const OPCOES_PERIODO: ReadonlyArray<OpcaoFiltro<Periodo>> = [
  { valor: 'proximos', rotulo: 'Próximos' },
  { valor: 'semana', rotulo: 'Próximos 7 dias' },
  { valor: 'vencidos', rotulo: 'Vencidos' },
  { valor: 'todos', rotulo: 'Todos' },
]

// Datas locais (YYYY-MM-DD), no mesmo formato de data_coleta
function filtrosDoPeriodo(periodo: Periodo): FiltrosLembrete {
  const hoje = toApiDate(new Date())
  switch (periodo) {
    case 'proximos':
      return { order: 'data_coleta:asc', data_coleta_de: hoje }
    case 'semana':
      return {
        order: 'data_coleta:asc',
        data_coleta_de: hoje,
        data_coleta_ate: toApiDate(new Date(Date.now() + 7 * UM_DIA_MS)),
      }
    case 'vencidos':
      // O que passou da data, do mais recente para o mais antigo
      return {
        order: 'data_coleta:desc',
        data_coleta_ate: toApiDate(new Date(Date.now() - UM_DIA_MS)),
      }
    default:
      return { order: 'data_coleta:asc' }
  }
}

const VAZIO_POR_PERIODO: Record<Periodo, string> = {
  proximos: 'Nenhum lembrete a partir de hoje.',
  semana: 'Nenhum lembrete nos próximos 7 dias.',
  vencidos: 'Nenhum lembrete vencido.',
  todos: 'Nenhum lembrete encontrado.',
}

export function LembreteListScreen() {
  const navigation = useNavigation()
  const [periodo, setPeriodo] = useState<Periodo>('todos')
  const filtros = useMemo(() => filtrosDoPeriodo(periodo), [periodo])

  const {
    itens,
    loading,
    error,
    refreshing,
    refresh,
    loadMore,
  } = useLembretesInfinite(filtros)

  function renderLembrete({ item }: { item: Lembrete }) {
    return <LembreteCard lembrete={item} />
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
          Todos Lembretes
        </Text>

        <View style={{ width: 24 }} />
      </View>

      <OfflineBanner />

      <View style={styles.filtros}>
        <FiltroChips opcoes={OPCOES_PERIODO} selecionado={periodo} onSelecionar={setPeriodo} />
      </View>

      {loading && itens.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator
            size="large"
            color={colors.accent}
          />
          <Text style={styles.message}>
            Carregando lembretes...
          </Text>
        </View>
      ) : error && itens.length === 0 ? (
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
        <FlatList
          data={itens}
          keyExtractor={item => String(item.id)}
          renderItem={renderLembrete}
          contentContainerStyle={styles.list}
          onRefresh={refresh}
          refreshing={refreshing}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <View style={styles.center}>
              <CalendarDays
                size={40}
                color={colors.textSecondary}
              />
              <Text style={styles.message}>
                {VAZIO_POR_PERIODO[periodo]}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  filtros: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
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
})
