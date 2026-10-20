import Geolocation from '@react-native-community/geolocation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { PermissionsAndroid, Platform } from 'react-native'

export interface Coordenadas {
  latitude: number
  longitude: number
  altitude: number | null
  // Raio de incerteza em metros
  precisao: number | null
}

async function pedirPermissao(): Promise<boolean> {
  // No iOS o próprio getCurrentPosition pede a permissão (NSLocationWhenInUseUsageDescription)
  if (Platform.OS !== 'android') return true
  try {
    const resultado = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)
    return resultado === PermissionsAndroid.RESULTS.GRANTED
  } catch {
    return false
  }
}

function lerPosicao(): Promise<Coordenadas> {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      ({ coords }) => resolve({
        latitude: coords.latitude,
        longitude: coords.longitude,
        altitude: coords.altitude ?? null,
        precisao: coords.accuracy ?? null,
      }),
      reject,
      // GPS do aparelho: funciona sem internet; no meio do mato pode demorar a fixar
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 10000 },
    )
  })
}

/** Posição atual do aparelho, lida ao montar a tela; `atualizar()` lê de novo */
export function useLocalizacao() {
  const [coords, setCoords] = useState<Coordenadas | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const montado = useRef(true)

  const atualizar = useCallback(async () => {
    setCarregando(true)
    setErro(null)
    try {
      if (!(await pedirPermissao())) {
        if (montado.current) setErro('Permissão de localização negada.')
        return
      }
      const posicao = await lerPosicao()
      if (montado.current) setCoords(posicao)
    } catch {
      if (montado.current) setErro('Não foi possível obter a localização.')
    } finally {
      if (montado.current) setCarregando(false)
    }
  }, [])

  useEffect(() => {
    montado.current = true
    atualizar()
    return () => {
      montado.current = false
    }
  }, [atualizar])

  return { coords, carregando, erro, atualizar }
}

export function formatarCoordenadas(coords: Coordenadas): string {
  return `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`
}
