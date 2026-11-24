import { createNativeStackNavigator } from '@react-navigation/native-stack'
import React from 'react'

import { LoginScreen } from '@/features/login/LoginScreen'

import { RootStackParamList } from './types'

const Stack = createNativeStackNavigator<RootStackParamList>()

/** Pilha de telas de quem ainda não está logado (só o Login) */
export function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  )
}
