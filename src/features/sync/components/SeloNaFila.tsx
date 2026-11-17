import { StyleSheet, Text, View, type ViewStyle } from 'react-native'
import { Clock } from 'lucide-react-native'

import { colors } from '@/theme/colors'

interface SeloNaFilaProps {
  // Só "Na fila", para miniaturas e linhas apertadas
  compacto?: boolean
  style?: ViewStyle
}

/** Arquivo guardado no aparelho que sobe no próximo "Sincronizar". Mesma cor do "Pendente". */
export function SeloNaFila({ compacto = false, style }: SeloNaFilaProps) {
  return (
    <View style={[styles.selo, style]}>
      <Clock size={12} color={colors.bell} />
      <Text style={styles.texto}>{compacto ? 'Na fila' : 'Na fila · enviado ao sincronizar'}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  selo: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(242, 201, 76, 0.15)',
  },
  texto: { color: colors.bell, fontSize: 11, fontWeight: '600' },
})
