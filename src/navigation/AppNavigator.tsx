import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { RouteProp, useRoute } from '@react-navigation/native'
import React from 'react'

import { ExpeditionListScreen } from '@/features/expeditionList/ExpeditionListScreen'
import { ExpeditionDetailScreen } from '@/features/expeditionDetail/ExpeditionDetailScreen'
import { Formulario } from '@/features/evidenceForm/evidenceForm'
import { PlaceholderScreen } from '@/features/navigation/PlaceholderScreen'

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

function SynchronizationScreen() {
  return <PlaceholderScreen title="Sincronização" />
}

function RemindersScreen() {
  return <PlaceholderScreen title="Lembretes" />
}

function UserProfileScreen() {
  return <PlaceholderScreen title="Perfil do Usuário" />
}

export function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ExpeditionList" component={ExpeditionListScreen} />
      <Stack.Screen name="ExpeditionDetail" component={ExpeditionDetailScreen} />
      <Stack.Screen name="Formulario" component={FormularioScreen} />
      <Stack.Screen name="Synchronization" component={SynchronizationScreen} />
      <Stack.Screen name="Reminders" component={RemindersScreen} />
      <Stack.Screen name="UserProfile" component={UserProfileScreen} />
    </Stack.Navigator>
  )
}