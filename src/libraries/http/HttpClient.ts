import axios, { AxiosInstance, InternalAxiosRequestConfig, isAxiosError } from 'axios'

import type { AccessTokenSource } from './AccessTokenSource'

export interface HttpHeaders extends Record<string, string | undefined> {
  'Content-Type': string
  'Content-Length': string
  Authorization?: string
}

// renewed: ganhou access token novo, dá para repetir o pedido
// expired: o servidor recusou o refresh, a sessão acabou de verdade
// failed: não deu para renovar agora (ex.: sem conexão); não é motivo para deslogar
export type RefreshOutcome = 'renewed' | 'expired' | 'failed'

type RetriableConfig = InternalAxiosRequestConfig & { _renovado?: boolean }

export type HttpClientResponse<T> = {
  data: T
  status: number
  headers: HttpHeaders
}

export class HttpClient {
  private readonly accessTokenSource?: AccessTokenSource

  private readonly axios: AxiosInstance

  private unauthorizedHandler?: () => void

  private refreshHandler?: () => Promise<RefreshOutcome>

  // Vários pedidos podem tomar 401 juntos: todos esperam a mesma renovação
  private renovacao?: Promise<RefreshOutcome>

  constructor(params: {
    baseUrl: string
    accessTokenSource?: AccessTokenSource
  }) {
    this.accessTokenSource = params.accessTokenSource
    this.axios = axios.create({
      baseURL: params.baseUrl,
      timeout: 15000,
      headers: { 'Content-Type': 'application/json' },
    })

    this.axios.interceptors.request.use(config => {
      const token = this.accessTokenSource?.getAccessToken()
      if (token) {
        config.headers.set('Authorization', `Bearer ${token}`)
      }
      return config
    })

    // 401 num pedido que levava token: o access token venceu. Tenta renovar com o
    // refresh token e repete o pedido; só avisa "sessão expirada" se o servidor
    // recusar a renovação. Sem token (ex.: credenciais erradas no login) o erro só
    // segue para quem chamou. As rotas /auth/* não entram aqui (evita laço no refresh).
    this.axios.interceptors.response.use(undefined, async error => {
      if (!isAxiosError(error) || error.response?.status !== 401 || !error.config?.headers?.Authorization) {
        return Promise.reject(error)
      }

      const config = error.config as RetriableConfig
      if (config.url?.startsWith('/auth/')) return Promise.reject(error)

      if (!this.refreshHandler || config._renovado) {
        this.unauthorizedHandler?.()
        return Promise.reject(error)
      }

      const resultado = await this.renovar()
      if (resultado === 'renewed') {
        config._renovado = true
        config.headers.set('Authorization', `Bearer ${this.accessTokenSource?.getAccessToken()}`)
        return this.axios.request(config)
      }
      if (resultado === 'expired') this.unauthorizedHandler?.()
      return Promise.reject(error)
    })
  }

  setUnauthorizedHandler(handler: (() => void) | undefined): void {
    this.unauthorizedHandler = handler
  }

  setRefreshHandler(handler: (() => Promise<RefreshOutcome>) | undefined): void {
    this.refreshHandler = handler
  }

  private renovar(): Promise<RefreshOutcome> {
    if (!this.renovacao) {
      this.renovacao = (this.refreshHandler as () => Promise<RefreshOutcome>)()
        .catch((): RefreshOutcome => 'failed')
        .finally(() => {
          this.renovacao = undefined
        })
    }
    return this.renovacao
  }

  async get<T>(
    url: string,
    params?: Record<string, string | number | boolean | undefined>
  ): Promise<HttpClientResponse<T>> {
    const response = await this.axios.get<T>(url, { params })
    return {
      data: response.data,
      status: response.status,
      headers: response.headers as HttpHeaders,
    }
  }

  async post<T>(url: string, data: unknown): Promise<HttpClientResponse<T>> {
    const response = await this.axios.post<T>(url, data)
    return {
      data: response.data,
      status: response.status,
      headers: response.headers as HttpHeaders,
    }
  }

  // Envio multipart (upload de arquivos). O timeout é maior porque
  // imagens, áudios e vídeos podem demorar para subir em campo.
  async postForm<T>(url: string, data: FormData): Promise<HttpClientResponse<T>> {
    const response = await this.axios.post<T>(url, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    })
    return {
      data: response.data,
      status: response.status,
      headers: response.headers as HttpHeaders,
    }
  }

  async put<T>(url: string, data: unknown): Promise<HttpClientResponse<T>> {
    const response = await this.axios.put<T>(url, data)
    return {
      data: response.data,
      status: response.status,
      headers: response.headers as HttpHeaders,
    }
  }

  async delete<T>(url: string): Promise<HttpClientResponse<T>> {
    const response = await this.axios.delete<T>(url)
    return {
      data: response.data,
      status: response.status,
      headers: response.headers as HttpHeaders,
    }
  }
}
