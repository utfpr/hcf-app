import { PropsWithChildren, useMemo } from 'react'

import { HttpClient } from '@/libraries/http/HttpClient'
import { MemoryAccessTokenSource } from '@/libraries/session/MemoryAccessTokenSource'

import { ContainerContext, ContainerContextValue } from './ContainerContext'

interface ContainerProviderProps extends PropsWithChildren {
  baseUrl: string
}

export function ContainerProvider({ children, baseUrl }: ContainerProviderProps) {
  const accessTokenSource = useMemo(() => new MemoryAccessTokenSource(), [])

  const httpClient = useMemo(
    () => new HttpClient({
      baseUrl,
      accessTokenSource,
    }),
    [baseUrl, accessTokenSource],
  )

  const contextValue = useMemo<ContainerContextValue>(() => ({
    httpClient,
    accessTokenSource,
  }), [httpClient, accessTokenSource])

  return (
    <ContainerContext.Provider value={contextValue}>
      {children}
    </ContainerContext.Provider>
  )
}
