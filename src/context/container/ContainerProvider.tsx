import { HttpClient } from '../../library/http/client'

import { ContainerContext } from './ContainerContext'

interface ContainerProviderProps extends React.PropsWithChildren {
  baseUrl: string
}

export function ContainerProvider({ children, baseUrl }: ContainerProviderProps) {
  const httpClient = new HttpClient({
    baseUrl
  })

  const contextValue = {
    httpClient,
  }

  return (
    <ContainerContext.Provider value={contextValue}>
      {children}
    </ContainerContext.Provider>
  )
}
