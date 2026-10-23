import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { FileClock } from 'lucide-react-native'

import { colors } from '@/theme/colors'

/** Avisa que o formulário veio de um rascunho salvo, com a opção de começar do zero */
export function RascunhoBanner({ onDescartar }: { onDescartar: () => void }) {
  return (
    <View style={styles.banner}>
      <FileClock size={14} color={colors.accent} />
      <Text style={styles.text}>Rascunho recuperado</Text>
      <TouchableOpacity onPress={onDescartar} hitSlop={8}>
        <Text style={styles.action}>Descartar</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: colors.backgroundAccent,
  },
  text: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 13,
  },
  action: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '600',
  },
})
