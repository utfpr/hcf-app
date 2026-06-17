import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';

import { useAuthStore } from '@/features/auth/store/useAuthStore';

import { AppNavigator } from './AppNavigator';
import { AuthNavigator } from './AuthNavigator';

export function Navigation() {
  const { isAuthenticated, _hydrated } = useAuthStore();

  if (!_hydrated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#082113' }}>
        <ActivityIndicator color="#00B14F" size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
