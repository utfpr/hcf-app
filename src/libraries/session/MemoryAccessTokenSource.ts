import type { AccessTokenSource } from '@/libraries/http/AccessTokenSource'

export class MemoryAccessTokenSource implements AccessTokenSource {
  private token?: string

  getAccessToken(): string | undefined {
    return this.token
  }

  setAccessToken(token?: string): void {
    this.token = token
  }
}
