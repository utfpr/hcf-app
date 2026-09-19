import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { RouteProp, useRoute } from '@react-navigation/native'
import React from 'react'

import { HomeScreen } from '@/features/home/HomeScreen'
import { Formulario } from '@/features/evidencia/Formulario'

import { RootStackParamList } from './types'

const Stack = createNativeStackNavigator<RootStackParamList>()

function FormularioScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'Formulario'>>()
  return <Formulario latitude={route.params.latitude} longitude={route.params.longitude} />
}

export function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Formulario" component={FormularioScreen} />
    </Stack.Navigator>
  )
}