import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import { Search, X } from 'lucide-react-native'

import { colors } from '@/theme/colors'

interface CampoBuscaProps {
  value: string
  onChangeText: (texto: string) => void
  placeholder: string
}

/** Campo de busca com lupa e botão de limpar */
export function CampoBusca({ value, onChangeText, placeholder }: CampoBuscaProps) {
  return (
    <View style={styles.container}>
      <Search size={16} color={colors.placeholder} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
        autoCorrect={false}
        returnKeyType="search"
      />
      {value ? (
        <TouchableOpacity onPress={() => onChangeText('')} hitSlop={10} accessibilityLabel="Limpar busca">
          <X size={16} color={colors.placeholder} />
        </TouchableOpacity>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: colors.inputBackground,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    color: colors.inputText,
    fontSize: 14,
  },
})
