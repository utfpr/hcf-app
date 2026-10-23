import { useState } from 'react'
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native'

import { styles } from '@/features/evidenceForm/styles'
import { colors } from '@/theme/colors'

import { MIN_CARACTERES_BUSCA, useBuscaFamilias } from '../hooks/useBuscaFamilias'

interface FamiliaInputProps {
  value: string
  onChangeText: (value: string) => void
  disabled?: boolean
}

/**
 * Campo de família com sugestões da API enquanto o usuário digita.
 * O valor é sempre o texto do campo: a sugestão só ajuda a preenchê-lo. Assim dá para
 * registrar uma família que não está na base (ou sem conexão), já que a ficha de
 * campo guarda texto livre e a determinação é provisória.
 */
export function FamiliaInput({ value, onChangeText, disabled = false }: FamiliaInputProps) {
  const [aberto, setAberto] = useState(false)
  const busca = useBuscaFamilias(value)
  const termo = value.trim()

  function handleChangeText(text: string) {
    onChangeText(text)
    setAberto(true)
  }

  function handleSelect(nome: string) {
    onChangeText(nome)
    setAberto(false)
  }

  function renderSugestoes() {
    if (termo.length < MIN_CARACTERES_BUSCA) {
      return <Text style={styles.emptyOption}>Digite ao menos {MIN_CARACTERES_BUSCA} letras para buscar.</Text>
    }

    if (!busca.data && (busca.loading || busca.aguardando)) {
      return (
        <View style={[styles.option, { flexDirection: 'row', alignItems: 'center', gap: 8 }]}>
          <ActivityIndicator size="small" color={colors.accent} />
          <Text style={styles.emptyOption}>Buscando famílias...</Text>
        </View>
      )
    }

    if (busca.error && !busca.data) {
      return (
        <Text style={styles.emptyOption}>
          Não foi possível buscar as famílias. O nome digitado será salvo assim mesmo.
        </Text>
      )
    }

    if (!busca.data?.length) {
      return (
        <Text style={styles.emptyOption}>
          Nenhuma família encontrada. O nome digitado será salvo assim mesmo.
        </Text>
      )
    }

    return busca.data.map(familia => (
      <TouchableOpacity key={familia.id} style={styles.option} onPress={() => handleSelect(familia.nome)}>
        <Text style={styles.optionText}>{familia.nome}</Text>
      </TouchableOpacity>
    ))
  }

  return (
    <>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={handleChangeText}
        onBlur={() => setAberto(false)}
        placeholder="Digite o nome da família"
        placeholderTextColor={colors.placeholder}
        autoCapitalize="words"
        autoCorrect={false}
        editable={!disabled}
      />
      {aberto && termo.length > 0 ? <View style={styles.optionsList}>{renderSugestoes()}</View> : null}
    </>
  )
}
