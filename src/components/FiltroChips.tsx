import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native'

import { colors } from '@/theme/colors'

export interface OpcaoFiltro<T extends string> {
  valor: T
  rotulo: string
}

interface FiltroChipsProps<T extends string> {
  opcoes: ReadonlyArray<OpcaoFiltro<T>>
  selecionado: T
  onSelecionar: (valor: T) => void
}

/** Linha de filtros rápidos (um selecionado por vez), rolável na horizontal */
export function FiltroChips<T extends string>({ opcoes, selecionado, onSelecionar }: FiltroChipsProps<T>) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      keyboardShouldPersistTaps="handled"
    >
      {opcoes.map(opcao => {
        const ativo = opcao.valor === selecionado
        return (
          <TouchableOpacity
            key={opcao.valor}
            style={[styles.chip, ativo && styles.chipAtivo]}
            onPress={() => onSelecionar(opcao.valor)}
            accessibilityState={{ selected: ativo }}
          >
            <Text style={[styles.chipText, ativo && styles.chipTextAtivo]}>{opcao.rotulo}</Text>
          </TouchableOpacity>
        )
      })}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  row: {
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderAlt,
    backgroundColor: colors.surfaceAlt,
  },
  chipAtivo: {
    borderColor: colors.accent,
    backgroundColor: colors.backgroundAccent,
  },
  chipText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  chipTextAtivo: {
    color: colors.accent,
    fontWeight: '600',
  },
})
