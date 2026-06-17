import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { HomeScreen } from '@/features/home/screens/HomeScreen';

const Stack = createNativeStackNavigator();

export function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
    </Stack.Navigator>
  );
}
