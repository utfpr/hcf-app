import { SyncService } from '../src/features/sync/SyncService'

describe('SyncService', () => {
  let service: SyncService

  beforeEach(() => {
    service = new SyncService()
  })

  it('starts with null as lastSyncDate', () => {
    expect(service.obterUltimaSincronizacao()).toBeNull()
    expect(service.formatarUltimaSincronizacao()).toBe('Nunca')
  })

  it('successfully runs sincronizarGeral and updates lastSyncDate', async () => {
    const onRefreshMock = jest.fn().mockResolvedValue(undefined)

    const result = await service.sincronizarGeral(onRefreshMock)

    expect(result.success).toBe(true)
    expect(result.message).toBe('Sincronização geral concluída com sucesso.')
    expect(result.syncedAt).toBeDefined()
    expect(onRefreshMock).toHaveBeenCalledTimes(1)
    expect(service.obterUltimaSincronizacao()).toBe(result.syncedAt)
  })

  it('works when onRefreshRemote is not provided', async () => {
    const result = await service.sincronizarGeral()

    expect(result.success).toBe(true)
    expect(service.obterUltimaSincronizacao()).toBeDefined()
  })

  it('handles errors during sincronizarGeral gracefully', async () => {
    const onRefreshMock = jest.fn().mockRejectedValue(new Error('Falha de conexão com a API'))

    const result = await service.sincronizarGeral(onRefreshMock)

    expect(result.success).toBe(false)
    expect(result.message).toBe('Falha de conexão com a API')
    expect(service.obterUltimaSincronizacao()).toBeNull()
  })

  it('formats valid ISO date correctly', () => {
    const iso = '2026-10-13T15:30:00.000Z'
    const formatted = service.formatarUltimaSincronizacao(iso)

    expect(formatted).toContain('13/10/2026')
    expect(formatted).toContain('às')
  })

  it('returns "Nunca" for invalid date strings or null', () => {
    expect(service.formatarUltimaSincronizacao(null)).toBe('Nunca')
    expect(service.formatarUltimaSincronizacao('invalid-date')).toBe('Nunca')
  })

  it('allows setting lastSyncDate manually', () => {
    service.definirUltimaSincronizacao('2026-10-12T10:00:00.000Z')
    expect(service.obterUltimaSincronizacao()).toBe('2026-10-12T10:00:00.000Z')
  })

  it('enviarPendenciasLocais returns default zero pendencies count', async () => {
    const res = await service.enviarPendenciasLocais()
    expect(res).toEqual({ enviados: 0 })
  })
})
