import React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import { HomeScreen } from '../src/features/home/HomeScreen'
import { syncService } from '../src/features/sync/SyncService'

// Mocks dos contextos e hooks de navegação
const mockNavigate = jest.fn()
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}))

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 20, bottom: 20, left: 0, right: 0 }),
}))

jest.mock('../src/contexts/Auth/useAuth', () => ({
  useAuth: () => ({ user: { nome: 'Dr. Botânico' } }),
}))

const mockRefresh = jest.fn().mockResolvedValue(undefined)
jest.mock('../src/features/home/hooks/useHomeExpeditions', () => ({
  useHomeExpeditions: () => ({
    active: [
      {
        id: '1',
        name: 'Expedição Cerrado',
        date: '13/10/2026',
        location: 'Campo Mourão – PR',
        status: 'Em andamento',
      },
    ],
    history: [],
    loading: false,
    refreshing: false,
    error: null,
    refresh: mockRefresh,
  }),
}))

describe('HomeScreen Sincronização Geral', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    syncService.definirUltimaSincronizacao('')
  })

  it('renders general sync card and sync buttons on HomeScreen', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(<HomeScreen />)
    })

    const root = renderer!.root

    // Botão de sync no cabeçalho
    const headerSyncBtn = root.findByProps({ testID: 'header-sync-button' })
    expect(headerSyncBtn).toBeDefined()

    // Card de sincronização geral no conteúdo
    const syncTitle = root.findByProps({ children: 'Sincronização Geral' })
    expect(syncTitle).toBeDefined()

    // Botão de sincronização no card
    const homeSyncAllBtn = root.findByProps({ testID: 'home-sync-all-button' })
    expect(homeSyncAllBtn).toBeDefined()
    expect(root.findByProps({ children: 'Sincronizar' })).toBeDefined()
  })

  it('triggers sync when pressing the home sync button', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(<HomeScreen />)
    })

    const root = renderer!.root
    const homeSyncAllBtn = root.findByProps({ testID: 'home-sync-all-button' })

    await ReactTestRenderer.act(async () => {
      homeSyncAllBtn.props.onPress()
    })

    expect(mockRefresh).toHaveBeenCalledTimes(1)
  })

  it('triggers sync when pressing the header sync button', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(<HomeScreen />)
    })

    const root = renderer!.root
    const headerSyncBtn = root.findByProps({ testID: 'header-sync-button' })

    await ReactTestRenderer.act(async () => {
      headerSyncBtn.props.onPress()
    })

    expect(mockRefresh).toHaveBeenCalledTimes(1)
  })
})
