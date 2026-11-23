import React from 'react'
import { Text, View } from 'react-native'

import { styles } from './styles'

interface CardFichaProps {
  titulo: string
  // "Escolha uma" / "Uma ou mais"
  dica?: string
  children: React.ReactNode
}

/** Um card por seção da ficha, com o título e, se houver opções, o tipo de escolha */
export function CardFicha({ titulo, dica, children }: CardFichaProps) {
  return (
    <View style={styles.formCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitulo}>{titulo}</Text>
        {dica ? <Text style={styles.cardDica}>{dica}</Text> : null}
      </View>
      {children}
    </View>
  )
}
