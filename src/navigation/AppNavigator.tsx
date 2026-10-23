import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { RouteProp, useRoute } from '@react-navigation/native'
import React from 'react'

import { HomeScreen } from '@/features/home/HomeScreen'
import { ExpeditionListScreen } from '@/features/expeditionList/ExpeditionListScreen'
import { ExpeditionDetailScreen } from '@/features/expeditionDetail/ExpeditionDetailScreen'
import { Formulario } from '@/features/evidenceForm/evidenceForm'
import { LembreteForm } from '@/features/reminderForm/reminderForm'
import { LembreteListScreen } from '@/features/lembrete/LembreteListScreen'
import { SyncScreen } from '@/features/sync/SyncScreen'
import { UserProfileScreen } from '@/features/userProfile/UserProfileScreen'

import { RootStackParamList } from './types'

const Stack = createNativeStackNavigator<RootStackParamList>()

function FormularioScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'Formulario'>>()
  const { expeditionId, mode } = route.params
  return (
    <Formulario
      expedicaoId={expeditionId ? Number(expeditionId) : undefined}
      mode={mode ?? 'collection'}
    />
  )
}

function RemindersScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'Reminders'>>()
  const { expeditionId } = route.params ?? {}
  return (
    <LembreteForm expedicaoId={expeditionId ? Number(expeditionId) : undefined} />
  )
}

export function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="ExpeditionList" component={ExpeditionListScreen} />
      <Stack.Screen name="LembreteList" component={LembreteListScreen} />
      <Stack.Screen name="ExpeditionDetail" component={ExpeditionDetailScreen} />
      <Stack.Screen name="Formulario" component={FormularioScreen} />
      <Stack.Screen name="Synchronization" component={SyncScreen} />
      <Stack.Screen name="Reminders" component={RemindersScreen} />
      <Stack.Screen name="UserProfile" component={UserProfileScreen} />
    </Stack.Navigator>
  )
}