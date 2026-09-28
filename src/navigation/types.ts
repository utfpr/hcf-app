import { NativeStackNavigationProp } from '@react-navigation/native-stack'

export type EvidenceMode = 'collection' | 'diary'

export type RootStackParamList = {
  Login: undefined
  Home: undefined
  ExpeditionList: undefined
  ExpeditionDetail: { expeditionId: string }
  Formulario: {
    expeditionId?: string // Opcional (necessário na ExpeditionDetail, mas opcional na Home)
    mode?: EvidenceMode   // Opcional
    latitude: number
    longitude: number
  }
}

export type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>