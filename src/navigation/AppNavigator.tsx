import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { RouteProp, useRoute } from '@react-navigation/native'
import React from 'react'

import { HomeScreen } from '@/features/home/HomeScreen'
import { ExpeditionListScreen } from '@/features/expeditionList/ExpeditionListScreen'
import { ExpeditionDetailScreen } from '@/features/expeditionDetail/ExpeditionDetailScreen'
import { Formulario } from '@/features/evidenceForm/evidenceForm'
import { LembreteForm } from '@/features/reminderForm/reminderForm'
import { PlaceholderScreen } from '@/features/navigation/PlaceholderScreen'
import { UserProfileScreen } from '@/features/userProfile/UserProfileScreen'

import { RootStackParamList } from './types'

const Stack = createNativeStackNavigator<RootStackParamList>()

// Coordenadas provisórias enquanto a localização real não é obtida
const DEFAULT_COORDS = { latitude: -25.4284, longitude: -49.2733 }

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
  const route = useRoute<RouteProp<RootStackParamList, 'Reminders'>>()
  const { expeditionId, latitude, longitude } = route.params ?? {}
  return (
    <LembreteForm
      expedicaoId={expeditionId ? Number(expeditionId) : undefined}
      latitude={latitude ?? DEFAULT_COORDS.latitude}
      longitude={longitude ?? DEFAULT_COORDS.longitude}
    />
  )
}



export function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="ExpeditionList" component={ExpeditionListScreen} />
      <Stack.Screen name="ExpeditionDetail" component={ExpeditionDetailScreen} />
      <Stack.Screen name="Formulario" component={FormularioScreen} />
      <Stack.Screen name="Synchronization" component={SynchronizationScreen} />
      <Stack.Screen name="Reminders" component={RemindersScreen} />
      <Stack.Screen name="UserProfile" component={UserProfileScreen} />
    </Stack.Navigator>
  )
}