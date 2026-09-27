import { createContext } from 'react'

import type { HttpClient } from '@/libraries/http/HttpClient'
import type { MemoryAccessTokenSource } from '@/libraries/session/MemoryAccessTokenSource'

export interface ContainerContextValue {
  httpClient: HttpClient
  accessTokenSource: MemoryAccessTokenSource
}

export const ContainerContext = createContext<ContainerContextValue | undefined>(undefined)
