import { useMemo, useState } from 'react'
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Calendar, ChevronDown, Menu, MapPin, Plus } from 'lucide-react-native'

import { RootStackParamList } from '@/navigation/types'

type ExpeditionListNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ExpeditionList'>

type ExpeditionStatus = 'Em andamento' | 'Planejada' | 'Concluída'

interface Expedition {
  id: string
  name: string
  date: string
  location: string
  status: ExpeditionStatus
}

type ListEntry =
  | { type: 'title'; id: string; label: string }
  | { type: 'row'; id: string; cards: [Expedition, Expedition?] }
  | { type: 'toggle'; id: string }

const activeExpeditions: Expedition[] = [
  { id: '1', name: 'Serra da Canastra', date: '15/02/2026', location: 'MG – Brasil', status: 'Em andamento' },
  { id: '2', name: 'Pantanal Norte', date: '03/01/2026', location: 'MT – Brasil', status: 'Em andamento' },
  { id: '3', name: 'Chapada Diamantina', date: '20/12/2025', location: 'BA – Brasil', status: 'Planejada' },
  { id: '4', name: 'Ilha do Cardoso', date: '10/11/2025', location: 'SP – Brasil', status: 'Em andamento' },
]

const historyExpeditions: Expedition[] = [
  { id: '5', name: 'Mata do Paraíso', date: '05/08/2025', location: 'MG – Brasil', status: 'Concluída' },
  { id: '6', name: 'Restinga de Jurubatiba', date: '22/03/2025', location: 'RJ – Brasil', status: 'Concluída' },
]

function chunkIntoRows(expeditions: Expedition[], prefix: string): ListEntry[] {
  const rows: ListEntry[] = []
  for (let i = 0; i < expeditions.length; i += 2) {
    rows.push({
      type: 'row',
      id: `${prefix}-row-${i}`,
      cards: [expeditions[i], expeditions[i + 1]],
    })
  }
  return rows
}

export function ExpeditionListScreen() {
  const navigation = useNavigation<ExpeditionListNavigationProp>()
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)

  const listData = useMemo<ListEntry[]>(() => {
    const entries: ListEntry[] = [
      { type: 'title', id: 'title', label: 'Expedições Ativas' },
      ...chunkIntoRows(activeExpeditions, 'active'),
      { type: 'toggle', id: 'toggle' },
    ]

    if (isHistoryOpen) {
      entries.push(...chunkIntoRows(historyExpeditions, 'history'))
    }

    return entries
  }, [isHistoryOpen])

  function handleCardPress(expeditionId: string) {
    navigation.navigate('ExpeditionDetail', { expeditionId })
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity hitSlop={12}>
          <Menu size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.userName}>Dr. Silva</Text>
      </View>

      <FlatList
        data={listData}
        keyExtractor={entry => entry.id}
        contentContainerStyle={styles.content}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={7}
        removeClippedSubviews
        renderItem={({ item }) => {
          if (item.type === 'title') {
            return <Text style={styles.title}>{item.label}</Text>
          }

          if (item.type === 'toggle') {
            return (
              <TouchableOpacity
                style={styles.historyToggle}
                onPress={() => setIsHistoryOpen(prev => !prev)}
                activeOpacity={0.8}>
                <Text style={styles.historyTitle}>Histórico de Expedições</Text>
                <ChevronDown
                  size={20}
                  color="#FFFFFF"
                  style={isHistoryOpen ? styles.chevronOpen : undefined}
                />
              </TouchableOpacity>
            )
          }

          return (
            <View style={styles.row}>
              <ExpeditionCard
                expedition={item.cards[0]}
                onPress={handleCardPress}
              />
              {item.cards[1] ? (
                <ExpeditionCard
                  expedition={item.cards[1]}
                  onPress={handleCardPress}
                />
              ) : (
                <View style={styles.cardPlaceholder} />
              )}
            </View>
          )
        }}
      />

      <TouchableOpacity style={styles.fab} activeOpacity={0.85}>
        <Plus size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  )
}

interface ExpeditionCardProps {
  expedition: Expedition
  onPress: (expeditionId: string) => void
}

function ExpeditionCard({ expedition, onPress }: ExpeditionCardProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => onPress(expedition.id)}
    >
      <Text style={styles.cardName}>{expedition.name}</Text>

      <View style={styles.cardRow}>
        <Calendar size={13} color="#8FA896" />
        <Text style={styles.cardRowText}>{expedition.date}</Text>
      </View>

      <View style={styles.cardRow}>
        <MapPin size={13} color="#8FA896" />
        <Text style={styles.cardRowText}>{expedition.location}</Text>
      </View>

      <View style={styles.badge}>
        <Text style={styles.badgeText}>{expedition.status}</Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#082113',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#0E2E1B',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1C4029',
    padding: 12,
    marginBottom: 12,
  },
  cardPlaceholder: {
    width: '48%',
  },
  cardName: {
    color: '#FFFFFF',
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
    color: '#8FA896',
    fontSize: 12,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#14472A',
    borderRadius: 4,
    paddingVertical: 3,
    paddingHorizontal: 7,
    marginTop: 6,
  },
  badgeText: {
    color: '#4ED97B',
    fontSize: 10,
  },
  historyToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0E2E1B',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1C4029',
    paddingVertical: 16,
    paddingHorizontal: 14,
    marginTop: 4,
    marginBottom: 12,
  },
  historyTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  chevronOpen: {
    transform: [{ rotate: '180deg' }],
  },
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#22A455',
    alignItems: 'center',
    justifyContent: 'center',
  },
})