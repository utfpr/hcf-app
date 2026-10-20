import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import {
  AlertCircle, BookOpen, ChevronRight, CloudDownload, CloudUpload, RefreshCw, Wifi, WifiOff, X,
} from 'lucide-react-native'
import React, { useMemo, useState } from 'react'
import {
  ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useAuth } from '@/contexts/Auth/useAuth'
import { useFeedback } from '@/components/feedback/FeedbackContext'
import { useHomeExpeditions } from '@/features/home/hooks/useHomeExpeditions'
import { useOffline } from '@/features/offline/OfflineContext'
import type { Pendencias } from '@/features/offline/types'
import { useSync } from '@/features/sync/hooks/useSync'
import { useTaxonomia } from '@/features/taxonomia/hooks/useTaxonomia'
import { useConexao } from '@/libraries/network/conexao'
import { RootStackParamList } from '@/navigation/types'
import { colors } from '@/theme/colors'

import type { SyncResult } from './types'

type Action = 'current' | 'enviar' | 'baixar' | 'taxonomy' | 'all'

interface ItemComErro {
  id: string
  titulo: string
  erro: string
}

// O que a API recusou na última sincronização, para o usuário saber o que corrigir
function itensComErro(pendencias: Pendencias | null): ItemComErro[] {
  if (!pendencias) return []
  return [
    ...pendencias.eventos.filter(item => item.status === 'error').map(item => ({
      id: item.local_id,
      titulo: item.payload.tipo === 'COLETA'
        ? `Coleta${item.payload.coleta?.nome_cientifico ? `: ${item.payload.coleta.nome_cientifico}` : ''}`
        : 'Diário',
      erro: item.erro ?? '',
    })),
    ...pendencias.lembretes.filter(item => item.status === 'error').map(item => ({
      id: item.local_id,
      titulo: `Lembrete: ${item.payload.local_coleta}`,
      erro: item.erro ?? '',
    })),
    ...pendencias.midias.filter(item => item.status === 'error').map(item => ({
      id: item.local_id,
      titulo: `Mídia: ${item.payload.nome}`,
      erro: item.erro ?? '',
    })),
  ]
}

export function SyncScreen() {
  const { toast } = useFeedback()

  function mostrarResultado(titulo: string, resultado: SyncResult, sucesso: string) {
    toast(resultado.success
      ? { tipo: 'sucesso', titulo, mensagem: sucesso }
      : { tipo: 'erro', titulo, mensagem: resultado.message ?? 'Não foi possível concluir.' })
  }

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const insets = useSafeAreaInsets()
  const { user } = useAuth()
  const { active, future, loading, error } = useHomeExpeditions()
  const { lastSyncFormatted, progressoTexto } = useSync()
  const { sincronizar, baixar, pendencias, pendentes } = useOffline()
  const taxonomia = useTaxonomia()
  const { wifi, online } = useConexao()
  const [busy, setBusy] = useState<Action | null>(null)

  // Expedição ativa da semana: a que está em andamento (ou a próxima planejada)
  const current = active[0] ?? future[0]
  const erros = useMemo(() => itensComErro(pendencias), [pendencias])

  async function run(action: Action) {
    setBusy(action)
    try {
      if (action === 'taxonomy') {
        mostrarResultado('Dados taxonômicos', await taxonomia.importar(), 'Famílias atualizadas no aparelho.')
      } else if (action === 'enviar') {
        mostrarResultado(
          'Envio',
          await sincronizar({ semBaixar: true }),
          'Tudo o que estava no aparelho foi enviado para a API.',
        )
      } else if (action === 'baixar') {
        mostrarResultado(
          'Dados da API',
          await baixar(),
          'Expedições, registros e lembretes atualizados no aparelho.',
        )
      } else if (action === 'current' && current) {
        mostrarResultado(
          'Sincronização',
          await sincronizar({ expedicaoId: Number(current.id) }),
          'Os registros da expedição foram sincronizados.',
        )
      } else {
        mostrarResultado('Sincronização', await sincronizar(), 'Todos os dados foram sincronizados com sucesso.')
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
  // Enviar exige Wi-Fi; importar taxonomia (API → app) funciona em qualquer rede
  const envioBloqueado = disabled || !wifi

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
          Tudo o que você registra fica salvo no aparelho, mesmo offline. Ao abrir o app no
          Wi-Fi, as expedições do web e a taxonomia são baixadas sozinhas. "Sincronizar tudo"
          envia o que está no aparelho e baixa tudo de novo.
        </Text>
        <Text style={styles.lastSyncInfo}>Última sincronização: {lastSyncFormatted}</Text>

        <View style={styles.statusRow}>
          {wifi ? <Wifi size={16} color={colors.accent} /> : <WifiOff size={16} color={colors.danger} />}
          <Text style={[styles.statusText, !wifi && styles.statusTextAlerta]}>
            {wifi ? 'Conectado ao Wi-Fi' : 'Sem Wi-Fi: conecte-se para sincronizar'}
          </Text>
        </View>
        <Text style={styles.pendentesText}>
          {progressoTexto
            ?? (pendentes === 0
              ? 'Nada pendente: tudo o que está no aparelho já foi enviado.'
              : `${pendentes} item(ns) aguardando envio.`)}
        </Text>

        {erros.length > 0 ? (
          <View style={styles.errorBox}>
            <View style={styles.statusRow}>
              <AlertCircle size={16} color={colors.danger} />
              <Text style={styles.errorTitle}>Itens recusados pela API ({erros.length})</Text>
            </View>
            {erros.map(item => (
              <View key={item.id} style={styles.errorItem}>
                <Text style={styles.errorItemTitle} numberOfLines={1}>{item.titulo}</Text>
                <Text style={styles.errorItemText}>{item.erro}</Text>
              </View>
            ))}
            <Text style={styles.errorHint}>Eles são tentados de novo a cada sincronização.</Text>
          </View>
        ) : null}

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
          style={[styles.primaryButton, (envioBloqueado || !current) && styles.buttonDisabled]}
          onPress={() => run('current')}
          disabled={envioBloqueado || !current}
        >
          {busy === 'current' ? (
            <ActivityIndicator color={colors.onAccent} />
          ) : (
            <RefreshCw size={18} color={colors.onAccent} />
          )}
          <Text style={styles.primaryButtonText}>Sincronizar</Text>
        </Pressable>

        <Text style={styles.sectionLabel}>Só enviar ou só baixar</Text>
        <Pressable
          style={[styles.secondaryButton, styles.secondaryButtonSpaced, (envioBloqueado || pendentes === 0) && styles.buttonDisabled]}
          onPress={() => run('enviar')}
          disabled={envioBloqueado || pendentes === 0}
        >
          {busy === 'enviar' ? (
            <ActivityIndicator color={colors.accent} />
          ) : (
            <CloudUpload size={18} color={colors.accent} />
          )}
          <Text style={styles.secondaryButtonText}>Enviar tudo para a API</Text>
        </Pressable>

        <Pressable
          style={[styles.secondaryButton, styles.secondaryButtonSpaced, (disabled || !online) && styles.buttonDisabled]}
          onPress={() => run('baixar')}
          disabled={disabled || !online}
        >
          {busy === 'baixar' ? (
            <ActivityIndicator color={colors.accent} />
          ) : (
            <CloudDownload size={18} color={colors.accent} />
          )}
          <Text style={styles.secondaryButtonText}>Baixar expedições da API</Text>
        </Pressable>

        <Pressable
          style={[styles.secondaryButton, (disabled || !online) && styles.buttonDisabled]}
          onPress={() => run('taxonomy')}
          disabled={disabled || !online}
        >
          {busy === 'taxonomy' ? (
            <ActivityIndicator color={colors.accent} />
          ) : (
            <BookOpen size={18} color={colors.accent} />
          )}
          <Text style={styles.secondaryButtonText}>Importar dados taxonômicos</Text>
        </Pressable>
        <Text style={styles.taxonomiaInfo}>
          {taxonomia.atualizadoEm
            ? `${taxonomia.total} famílias no aparelho (atualizado em ${taxonomia.atualizadoEm})`
            : 'Dados taxonômicos ainda não importados'}
        </Text>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable
          style={[styles.primaryButton, styles.footerButton, envioBloqueado && styles.buttonDisabled]}
          onPress={() => run('all')}
          disabled={envioBloqueado}
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
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusText: { color: colors.textSecondary, fontSize: 13 },
  statusTextAlerta: { color: colors.danger },
  pendentesText: { color: colors.textPrimary, fontSize: 14, marginTop: 8, marginBottom: 20 },
  errorBox: {
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  errorTitle: { color: colors.danger, fontSize: 14, fontWeight: '600' },
  errorItem: { marginTop: 10 },
  errorItemTitle: { color: colors.textPrimary, fontSize: 13, fontWeight: '600' },
  errorItemText: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  errorHint: { color: colors.textSecondary, fontSize: 12, marginTop: 10 },
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
  secondaryButtonSpaced: { marginBottom: 12 },
  taxonomiaInfo: { color: colors.textSecondary, fontSize: 12, textAlign: 'center', marginTop: 8 },
  buttonDisabled: { opacity: 0.5 },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerButton: { marginBottom: 0 },
})
