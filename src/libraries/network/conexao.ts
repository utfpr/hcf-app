import NetInfo, { type NetInfoState, useNetInfo } from '@react-native-community/netinfo'

// isInternetReachable começa null enquanto o teste de alcance não termina: só
// `false` conta como sem internet, senão o app bloquearia logo ao abrir
function online(state: NetInfoState): boolean {
  return state.isConnected === true && state.isInternetReachable !== false
}

function wifi(state: NetInfoState): boolean {
  return state.type === 'wifi' && online(state)
}

export async function temInternet(): Promise<boolean> {
  return online(await NetInfo.fetch())
}

export async function estaNoWifi(): Promise<boolean> {
  return wifi(await NetInfo.fetch())
}

/** Estado da conexão que re-renderiza quando muda (para habilitar/desabilitar botões) */
export function useConexao(): { online: boolean; wifi: boolean } {
  const state = useNetInfo()
  return { online: online(state), wifi: wifi(state) }
}
