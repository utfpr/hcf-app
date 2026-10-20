import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { BookOpen, ChevronRight, RefreshCw, X } from 'lucide-react-native'
import React, { useState } from 'react'
import {
  ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useAuth } from '@/contexts/Auth/useAuth'
import { useHomeExpeditions } from '@/features/home/hooks/useHomeExpeditions'
import { useSync } from '@/features/sync/hooks/useSync'
import { RootStackParamList } from '@/navigation/types'
import { colors } from '@/theme/colors'

type Action = 'current' | 'taxonomy' | 'all'

export function SyncScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const insets = useSafeAreaInsets()
  const { user } = useAuth()
  const { active, loading, error, refresh } = useHomeExpeditions()
  const { syncAll, lastSyncFormatted } = useSync()
  const [busy, setBusy] = useState<Action | null>(null)

  // Expedição ativa da semana: a que está em andamento (ou a próxima planejada)
  const current = active.find(item => item.status === 'Em andamento') ?? active[0]

  async function run(action: Action) {
    setBusy(action)
    try {
      if (action === 'all') {
        await syncAll(refresh)
      } else {
        await new Promise<void>(resolve => setTimeout(resolve, 1000))
      }
    } finally {
      setBusy(null)
    }
  }

  function handleChooseExpedition() {
    // TODO: abrir a tela de escolha de outra expedição (por enquanto, a lista)
    navigation.navigate('ExpeditionList')
  }

  function currentTitle() {
    if (current) return current.name
    if (loading) return 'Carregando...'
    if (error) return 'Não foi possível carregar a expedição'
    return 'Nenhuma expedição ativa esta semana'
  }

  const disabled = busy !== null

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
          <X size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.userName} numberOfLines={1}>{user?.nome}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Sincronize seus dados</Text>
        <Text style={styles.subtitle}>
          Colete dados em campo, mesmo offline. Ao restabelecer a conexão, sincronize
          suas expedições com apenas um toque e mantenha todas as informações alinhadas.
        </Text>
        <Text style={styles.lastSyncInfo}>Última sincronização: {lastSyncFormatted}</Text>

        <Text style={styles.sectionLabel}>Expedição atual</Text>
        <Pressable style={styles.currentCard} onPress={handleChooseExpedition}>
          <View style={styles.currentInfo}>
            <Text style={styles.currentName} numberOfLines={2}>{currentTitle()}</Text>
            {current ? (
              <Text style={styles.currentMeta} numberOfLines={1}>
                {current.date} – {current.location}
              </Text>
            ) : null}
          </View>
          <ChevronRight size={20} color={colors.textSecondary} />
        </Pressable>

        <Pressable
          style={[styles.primaryButton, (disabled || !current) && styles.buttonDisabled]}
          onPress={() => run('current')}
          disabled={disabled || !current}
        >
          {busy === 'current' ? (
            <ActivityIndicator color={colors.onAccent} />
          ) : (
            <RefreshCw size={18} color={colors.onAccent} />
          )}
          <Text style={styles.primaryButtonText}>Sincronizar</Text>
          
        </Pressable>

        <Pressable
          style={[styles.secondaryButton, disabled && styles.buttonDisabled]}
          onPress={() => run('taxonomy')}
          disabled={disabled}
        >
          {busy === 'taxonomy' ? (
            <ActivityIndicator color={colors.accent} />
          ) : (
            <BookOpen size={18} color={colors.accent} />
          )}
          <Text style={styles.secondaryButtonText}>Importar dados taxonômicos</Text>
        </Pressable>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable
          style={[styles.primaryButton, styles.footerButton, disabled && styles.buttonDisabled]}
          onPress={() => run('all')}
          disabled={disabled}
        >
          {busy === 'all' ? (
            <ActivityIndicator color={colors.onAccent} />
          ) : (
            <RefreshCw size={18} color={colors.onAccent} />
          )}
          <Text style={styles.primaryButtonText}>Sincronizar tudo</Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  userName: { color: colors.textPrimary, fontSize: 16, maxWidth: '60%' },
  content: { paddingHorizontal: 20, paddingTop: 28, paddingBottom: 24 },
  title: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: 12,
  },
  lastSyncInfo: {
    color: colors.accent,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '500',
  },
  sectionLabel: { color: colors.textSecondary, fontSize: 13, marginBottom: 8 },
  currentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.borderAlt,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  currentInfo: { flex: 1, marginRight: 12 },
  currentName: { color: colors.textPrimary, fontSize: 16, fontWeight: '600' },
  currentMeta: { color: colors.textSecondary, fontSize: 13, marginTop: 4 },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  primaryButtonText: { color: colors.onAccent, fontSize: 16, fontWeight: '600' },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tagText: { color: colors.onAccent, fontSize: 11 },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.backgroundAccent,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 14,
  },
  secondaryButtonText: { color: colors.accent, fontSize: 16, fontWeight: '600' },
  buttonDisabled: { opacity: 0.5 },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerButton: { marginBottom: 0 },
})
