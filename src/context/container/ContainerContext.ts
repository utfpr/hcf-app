import { createContext } from 'react'

import type { HttpClient } from '../../library/http/client'

export interface ContainerContextValue {
  httpClient: HttpClient
}

export const ContainerContext = createContext<ContainerContextValue | undefined>(undefined)
