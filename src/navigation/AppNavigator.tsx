import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { RouteProp, useRoute } from '@react-navigation/native'
import React from 'react'

import { ExpeditionListScreen } from '@/features/expeditionList/ExpeditionListScreen'
import { ExpeditionDetailScreen } from '@/features/expeditionDetail/ExpeditionDetailScreen'
import { Formulario } from '@/features/evidenceForm/evidenceForm'
import { LembreteListScreen } from '@/features/lembrete/LembreteListScreen'

import { RootStackParamList } from './types'

const Stack = createNativeStackNavigator<RootStackParamList>()

function FormularioScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'Formulario'>>()
  const { expeditionId, mode, latitude, longitude } = route.params
  return (
    <Formulario
      expedicaoId={expeditionId ? Number(expeditionId) : undefined}
      mode={mode ?? 'collection'}
      latitude={latitude}
      longitude={longitude}
    />
  )
}

export function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ExpeditionList" component={ExpeditionListScreen} />
      <Stack.Screen name="LembreteList" component={LembreteListScreen} />
      <Stack.Screen name="ExpeditionDetail" component={ExpeditionDetailScreen} />
      <Stack.Screen name="Formulario" component={FormularioScreen} />
    </Stack.Navigator>
  )
}