import { NativeStackNavigationProp } from '@react-navigation/native-stack'

export type EvidenceMode = 'collection' | 'diary'

export type RootStackParamList = {
  Login: undefined
  Home: undefined
  ExpeditionList: undefined
  ExpeditionDetail: { expeditionId: string }
  Synchronization: undefined
  UserProfile: undefined
  Formulario: {
    expeditionId?: string // Opcional (necessário na ExpeditionDetail, mas opcional na Home)
    mode?: EvidenceMode   // Opcional
    latitude: number
    longitude: number
  }
  Reminders: {
    expeditionId?: string // De onde o lembrete foi aberto, para voltar depois de salvar
    latitude?: number
    longitude?: number
  } | undefined
}

export type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>