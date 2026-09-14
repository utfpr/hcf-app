import { NavigationContainer } from '@react-navigation/native'
import React from 'react'
import { ActivityIndicator, View } from 'react-native'

import { useAuth } from '@/contexts/Auth/useAuth'

import { AppNavigator } from './AppNavigator'
import { AuthNavigator } from './AuthNavigator'

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
      {loggedIn ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  )
}
