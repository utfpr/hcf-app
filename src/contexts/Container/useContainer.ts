import { useContext } from 'react'

import { ContainerContext, ContainerContextValue } from './ContainerContext'

export function useContainer(): ContainerContextValue {
  const context = useContext(ContainerContext)
  if (!context) {
    throw new Error('useContainer must be used within a ContainerProvider')
  }

  return context
}
