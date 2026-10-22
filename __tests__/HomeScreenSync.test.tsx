import React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import { FeedbackProvider } from '../src/components/feedback/FeedbackProvider'
import { HomeScreen } from '../src/features/home/HomeScreen'

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
const mockSyncAll = jest.fn().mockResolvedValue({ success: true })
jest.mock('../src/features/sync/hooks/useSync', () => ({
  useSync: () => ({
    isSyncing: false,
    lastSyncDate: null,
    lastSyncFormatted: 'Nunca',
    pendentes: 0,
    syncAll: mockSyncAll,
  }),
}))

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
    future: [],
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
  })

  it('renders general sync card and sync buttons on HomeScreen', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(<FeedbackProvider><HomeScreen /></FeedbackProvider>)
    })

    const root = renderer!.root

    // O cabeçalho não tem mais botão de sync: só o refresh e o card
    expect(root.findAllByProps({ testID: 'header-sync-button' })).toHaveLength(0)

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
      renderer = ReactTestRenderer.create(<FeedbackProvider><HomeScreen /></FeedbackProvider>)
    })

    const root = renderer!.root
    const homeSyncAllBtn = root.findByProps({ testID: 'home-sync-all-button' })

    await ReactTestRenderer.act(async () => {
      homeSyncAllBtn.props.onPress()
    })

    expect(mockSyncAll).toHaveBeenCalledTimes(1)
    // Resultado no aviso do app, não no diálogo nativo
    expect(root.findByProps({ children: 'Sincronização concluída' })).toBeDefined()
  })
})
