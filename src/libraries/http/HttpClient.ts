import axios, { AxiosInstance } from 'axios'

import type { AccessTokenSource } from './AccessTokenSource'

export interface HttpHeaders extends Record<string, string | undefined> {
  'Content-Type': string
  'Content-Length': string
  Authorization?: string
}

export type HttpClientResponse<T> = {
  data: T
  status: number
  headers: HttpHeaders
}

export class HttpClient {
  private readonly accessTokenSource?: AccessTokenSource

  private readonly axios: AxiosInstance

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
