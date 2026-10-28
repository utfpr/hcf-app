import { StyleSheet, Text, View } from 'react-native'
import { WifiOff } from 'lucide-react-native'

import { useConexao } from '@/libraries/network/conexao'
import { colors } from '@/theme/colors'

/** Faixa no topo quando o aparelho está sem internet: lembra que nada se perde */
export function OfflineBanner() {
  const { online } = useConexao()
  if (online) return null

  return (
    <View style={styles.banner} accessibilityRole="alert">
      <WifiOff size={14} color={colors.bell} />
      <Text style={styles.text}>Sem internet — tudo fica salvo no aparelho</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(242, 201, 76, 0.12)',
  },
  text: {
    color: colors.bell,
    fontSize: 12,
  },
})
