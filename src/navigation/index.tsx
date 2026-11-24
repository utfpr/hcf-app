import { NavigationContainer } from '@react-navigation/native'
import React from 'react'
import { ActivityIndicator, View } from 'react-native'

import { useAuth } from '@/contexts/Auth/useAuth'
import { OfflineProvider } from '@/features/offline/OfflineContext'

import { AppNavigator } from './AppNavigator'
import { AuthNavigator } from './AuthNavigator'

/**
 * Raiz da navegação do app.
 * Enquanto a sessão salva é lida (ready = false), mostra um carregamento.
 * Depois, mostra o AppNavigator (dentro do OfflineProvider) se o usuário estiver
 * logado, ou o AuthNavigator caso contrário. Logar/deslogar troca a pilha sozinho.
 */
export function Navigation() {
  const { loggedIn, ready } = useAuth()

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#082113' }}>
        <ActivityIndicator color="#00B14F" size="large" />
      </View>
    )
  }

  return (
    <NavigationContainer>
      {loggedIn ? (
        <OfflineProvider>
          <AppNavigator />
        </OfflineProvider>
      ) : <AuthNavigator />}
    </NavigationContainer>
  )
}
