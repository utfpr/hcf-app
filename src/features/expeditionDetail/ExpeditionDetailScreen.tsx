import { StyleSheet, Text, View, ScrollView, TouchableOpacity, StatusBar } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { ArrowLeft } from 'lucide-react-native'
import { useState } from 'react'

import { EvidenceMode, RootStackParamList } from '@/navigation/types'
import { colors } from '@/theme/colors'

type ExpeditionDetailRouteProp = RouteProp<RootStackParamList, 'ExpeditionDetail'>
type ExpeditionDetailNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ExpeditionDetail'>

interface Member {
  name: string
}

interface ExpeditionRecord {
  type: EvidenceMode
  title?: string
  habit?: string
  environment?: string
  text?: string
  date: string
  location: string
}

interface Expedition {
  id: string
  name: string
  status: string
  date: string
  leader: string
  team: Member[]
  records: ExpeditionRecord[]
}

const MOCK_COORDS = { latitude: -20.2508, longitude: -46.4167 }

const mockDataById: Record<string, Expedition> = {
  '1': {
    id: '1',
    name: 'Serra da Canastra',
    status: 'Em andamento',
    date: '15/02/2026',
    leader: 'Dr. Ana Souza',
    team: [
      { name: 'Dr. Ana Souza' },
      { name: 'MSc. Carlos Lima' },
      { name: 'Grad. Juliana Santos' },
    ],
    records: [
      {
        type: 'collection',
        title: 'Vellozia squamata',
        habit: 'Herbácea',
        environment: 'Campo rupestre, solo arenoso',
        date: '15/02 14:32',
        location: '-20.2508, -46.4167',
      },
      {
        type: 'diary',
        text: 'Área de transição entre cerrado e campo rupestre. Solo predominantemente arenoso com afloramentos rochosos.',
        date: '15/02 13:15',
        location: '-20.2510, -46.4170',
      },
    ],
  },
}

export function ExpeditionDetailScreen() {
  const navigation = useNavigation<ExpeditionDetailNavigationProp>()
  const route = useRoute<ExpeditionDetailRouteProp>()
  const { expeditionId } = route.params

  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const data = mockDataById[expeditionId]

  function handleOpenForm(mode: EvidenceMode) {
    setIsMenuOpen(false)
    navigation.navigate('Formulario', { expeditionId, mode, ...MOCK_COORDS })
  }

  if (!data) {
    return (
      <SafeAreaView style={styles.wrapper}>
        <View style={styles.header}>
          <TouchableOpacity
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft color={colors.textPrimary} size={22} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalhes da Expedição</Text>
          <View style={{ width: 22 }} />
        </View>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Expedição não encontrada.</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.wrapper}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <View style={styles.header}>
        <TouchableOpacity
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft color={colors.textPrimary} size={22} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes da Expedição</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.expeditionName}>{data.name}</Text>
        <View style={styles.infoRow}>
          <Text style={styles.info}>🕒 {data.date}</Text>
          <Text style={styles.status}>{data.status}</Text>
        </View>
        <Text style={styles.leader}>Chefe: {data.leader}</Text>

        <Text style={styles.sectionTitle}>👥 EQUIPE</Text>
        <View style={styles.teamRow}>
          {data.team.map((member) => (
            <View key={member.name} style={styles.memberTag}>
              <Text style={styles.memberTagText}>{member.name}</Text>
            </View>
          ))}
        </View>

        {data.records.map((item, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.cardType}>
              {item.type === 'collection' ? '🌿 Coleta' : '📘 Diário'}
            </Text>
            {item.title && <Text style={styles.cardTitle}>{item.title}</Text>}
            {item.habit && <Text style={styles.cardText}>Hábito: {item.habit}</Text>}
            {item.environment && <Text style={styles.cardText}>Ambiente: {item.environment}</Text>}
            {item.text && <Text style={styles.cardText}>{item.text}</Text>}
            <Text style={styles.cardDate}>{item.date} · 📍 {item.location}</Text>
          </View>
        ))}
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
  leader: { color: colors.textSecondary, marginTop: 2 },
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
  card: { backgroundColor: colors.cardBackground, borderRadius: 12, padding: 14, marginBottom: 12 },
  cardType: { color: colors.accent, fontSize: 12, marginBottom: 6 },
  cardTitle: { color: colors.textPrimary, fontSize: 16, fontStyle: 'italic', marginBottom: 4 },
  cardText: { color: colors.textSecondary, fontSize: 13, marginBottom: 2 },
  cardDate: { color: colors.textSecondary, fontSize: 11, marginTop: 6 },
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
  },
})