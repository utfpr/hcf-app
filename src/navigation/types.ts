
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

/** Modo do formulário de evidências: registro de coleta ou de diário */
export type EvidenceMode = 'collection' | 'diary'

/** Todas as rotas do app e os parâmetros que cada uma recebe */
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

/** Tipo do objeto navigation para usar com useNavigation em qualquer tela */
export type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>
