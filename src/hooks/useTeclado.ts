import { useEffect, useState } from 'react'
import { Keyboard } from 'react-native'

export interface EstadoTeclado {
  visivel: boolean
  // Altura do teclado aberto; 0 fechado
  altura: number
}

/** Se o teclado está aberto e quanto ele ocupa da tela */
export function useTeclado(): EstadoTeclado {
  const [teclado, setTeclado] = useState<EstadoTeclado>({ visivel: false, altura: 0 })

  useEffect(() => {
    const aoAbrir = Keyboard.addListener('keyboardDidShow', evento => {
      setTeclado({ visivel: true, altura: evento?.endCoordinates?.height ?? 0 })
    })
    const aoFechar = Keyboard.addListener('keyboardDidHide', () => setTeclado({ visivel: false, altura: 0 }))
    return () => {
      aoAbrir.remove()
      aoFechar.remove()
    }
  }, [])

  return teclado
}
