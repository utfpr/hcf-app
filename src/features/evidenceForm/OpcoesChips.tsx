import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { Check } from 'lucide-react-native'

import {
  type CampoMultiplaEscolha,
  escolherOpcao,
  FICHA_MULTIPLA_ESCOLHA,
  opcoesSelecionadas,
} from '@/features/evento/fichaCampos'
import { colors } from '@/theme/colors'

import { styles } from './styles'

interface OpcoesChipsProps {
  campo: CampoMultiplaEscolha
  // Opções escolhidas, separadas por ", " (como vão para a API)
  valor: string
  onChange: (valor: string) => void
  disabled?: boolean
}

/**
 * Todas as opções do campo à vista, um toque para marcar: quem anota precisa
 * acompanhar o que os coletores falam, sem abrir e fechar listas.
 */
export function OpcoesChips({ campo, valor, onChange, disabled = false }: OpcoesChipsProps) {
  const selecionadas = opcoesSelecionadas(valor)

  return (
    <View style={styles.chips}>
      {FICHA_MULTIPLA_ESCOLHA[campo].map(opcao => {
        const selecionada = selecionadas.includes(opcao)
        return (
          <TouchableOpacity
            key={opcao}
            style={[styles.chip, selecionada && styles.chipSelecionado]}
            onPress={() => onChange(escolherOpcao(campo, valor, opcao))}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityState={{ selected: selecionada, disabled }}
          >
            {selecionada ? <Check size={14} color={colors.onAccent} /> : null}
            <Text style={[styles.chipTexto, selecionada && styles.chipTextoSelecionado]}>{opcao}</Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}
