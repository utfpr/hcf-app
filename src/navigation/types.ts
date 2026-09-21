import { NativeStackNavigationProp } from '@react-navigation/native-stack'

export type EvidenceMode = 'collection' | 'diary'

export type RootStackParamList = {
  Login: undefined
  Home: undefined
  ExpeditionList: undefined
  ExpeditionDetail: { expeditionId: string }
  Formulario: {
    expeditionId: string
    mode: EvidenceMode
    latitude: number
    longitude: number
  }
}

export type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>