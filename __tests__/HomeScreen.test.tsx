import React from 'react'
import ReactTestRenderer from 'react-test-renderer'
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
let mockError: unknown = null
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
    error: mockError,
    refresh: mockRefresh,
  }),
}))

function renderHome() {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined
  ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<HomeScreen />)
  })
  return renderer!.root
}

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockError = null
  })

  it('não mostra mais o card de sincronização geral', () => {
    const root = renderHome()

    expect(root.findAllByProps({ children: 'Sincronização Geral' })).toHaveLength(0)
    expect(root.findAllByProps({ testID: 'home-sync-all-button' })).toHaveLength(0)
    expect(root.findByProps({ children: 'Expedições Ativas' })).toBeDefined()
  })

  it('não mostra a caixa de erro quando as expedições carregam', () => {
    const root = renderHome()

    expect(root.findAllByProps({ children: 'Tentar novamente' })).toHaveLength(0)
  })

  it('mostra o erro de carregamento e tenta de novo ao tocar', () => {
    mockError = new Error('falha')
    const root = renderHome()

    expect(root.findByProps({ children: 'Não foi possível carregar as expedições.' })).toBeDefined()

    const [retry] = root.findAll(node => node.props.onPress === mockRefresh)
    ReactTestRenderer.act(() => {
      retry.props.onPress()
    })

    expect(mockRefresh).toHaveBeenCalledTimes(1)
  })
})
