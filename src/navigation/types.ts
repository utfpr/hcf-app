
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

export type EvidenceMode = 'collection' | 'diary'

export type RootStackParamList = {
  Login: undefined
  Home: undefined
  ExpeditionList: undefined
  LembreteList: undefined
  ExpeditionDetail: { expeditionId: string }
  Synchronization: undefined
  UserProfile: undefined
  // A posição vem do GPS do aparelho dentro do próprio formulário
  Formulario: {
    expeditionId?: string // Opcional
    mode?: EvidenceMode
  }
  Reminders: {
    expeditionId?: string // De onde o lembrete foi aberto, para voltar depois de salvar
  } | undefined
}

export type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>
