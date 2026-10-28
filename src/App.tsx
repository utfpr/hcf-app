import { API_BASE_URL } from '@env'
import React from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { FeedbackProvider } from '@/components/feedback/FeedbackProvider'
import { AuthProvider } from '@/contexts/Auth/AuthProvider'
import { ContainerProvider } from '@/contexts/Container/ContainerProvider'
import { Navigation } from '@/navigation'

function App() {
  return (
    <SafeAreaProvider>
      <FeedbackProvider>
        <ContainerProvider baseUrl={API_BASE_URL}>
          <AuthProvider>
            <Navigation />
          </AuthProvider>
        </ContainerProvider>
      </FeedbackProvider>
    </SafeAreaProvider>
  )
}

export default App
