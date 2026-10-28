import React from 'react'
import {
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native'
import { AlertCircle, CheckCheck, RefreshCw } from 'lucide-react-native'

import { colors } from '@/theme/colors'
import type { SyncStatus } from '../types'

export interface SyncStatusIndicatorProps {
  status?: SyncStatus
  size?: number
  showLabel?: boolean
  style?: ViewStyle
  testID?: string
}

interface StatusConfig {
  label: string
  color: string
  bgColor: string
  Icon: React.ComponentType<{ size: number; color: string }>
}

const STATUS_CONFIGS: Record<SyncStatus, StatusConfig> = {
  // Check duplo, como mensagem lida: tudo já está na API
  synced: {
    label: 'Sincronizado',
    color: colors.accent,
    bgColor: 'rgba(31, 173, 90, 0.15)',
    Icon: CheckCheck,
  },
  // Coisa nova no aparelho esperando o "Sincronizar"
  pending: {
    label: 'Pendente',
    color: colors.bell,
    bgColor: 'rgba(242, 201, 76, 0.15)',
    Icon: RefreshCw,
  },
  syncing: {
    label: 'Sincronizando',
    color: colors.diary,
    bgColor: 'rgba(48, 140, 232, 0.15)',
    Icon: RefreshCw,
  },
  // A API recusou algum item ao sincronizar
  error: {
    label: 'Erro',
    color: colors.danger,
    bgColor: 'rgba(252, 165, 165, 0.15)',
    Icon: AlertCircle,
  },
}

/**
 * Indicador visual do status de sincronização (ícone e rótulo opcional).
 * Usado nos cards de Expedição e Eventos.
 */
export function SyncStatusIndicator({
  status = 'synced',
  size = 12,
  showLabel = false,
  style,
  testID = 'sync-status-indicator',
}: SyncStatusIndicatorProps) {
  const config = STATUS_CONFIGS[status] ?? STATUS_CONFIGS.synced
  const { Icon, color, bgColor, label } = config

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: bgColor },
        style,
      ]}
      accessibilityRole="image"
      accessibilityLabel={`Status de sincronização: ${label}`}
      testID={testID}
    >
      <Icon size={size} color={color} />
      {showLabel ? (
        <Text style={[styles.label, { color }]}>{label}</Text>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 9999,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
  },
})
