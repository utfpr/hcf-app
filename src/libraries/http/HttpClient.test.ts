import { AxiosError, type AxiosAdapter, type InternalAxiosRequestConfig } from 'axios'

import { MemoryAccessTokenSource } from '@/libraries/session/MemoryAccessTokenSource'

import { HttpClient } from './HttpClient'

// Responde todo pedido com o status dado, sem rede
function respondWith(status: number): AxiosAdapter {
  return async (config: InternalAxiosRequestConfig) => {
    const response = { status, statusText: '', data: {}, headers: {}, config }
    throw new AxiosError('Request failed', AxiosError.ERR_BAD_RESPONSE, config, null, response)
  }
}

function createClient(status: number, token?: string) {
  const accessTokenSource = new MemoryAccessTokenSource()
  accessTokenSource.setAccessToken(token)
  const client = new HttpClient({ baseUrl: 'http://localhost/api', accessTokenSource })
  ;(client as any).axios.defaults.adapter = respondWith(status)
  const onUnauthorized = jest.fn()
  client.setUnauthorizedHandler(onUnauthorized)
  return { client, onUnauthorized }
}

describe('HttpClient', () => {
  it('avisa o handler quando um pedido autenticado recebe 401', async () => {
    const { client, onUnauthorized } = createClient(401, 'token-expirado')

    await expect(client.get('/v2/expedicoes')).rejects.toBeInstanceOf(AxiosError)
    expect(onUnauthorized).toHaveBeenCalledTimes(1)
  })

  it('não avisa o handler em 401 sem token (ex.: credenciais erradas no login)', async () => {
    const { client, onUnauthorized } = createClient(401)

    await expect(client.post('/login', {})).rejects.toBeInstanceOf(AxiosError)
    expect(onUnauthorized).not.toHaveBeenCalled()
  })

  it('não avisa o handler em 403 (sem permissão, mas a sessão continua válida)', async () => {
    const { client, onUnauthorized } = createClient(403, 'token-valido')

    await expect(client.get('/v2/expedicoes')).rejects.toBeInstanceOf(AxiosError)
    expect(onUnauthorized).not.toHaveBeenCalled()
  })
})
