import React, { useState } from 'react'
import { Text, TextInput, TouchableOpacity, View } from 'react-native'

import {
  buscarLocaisColeta,
  type CidadeEstado,
  digitarLocal,
  escolherLocalColeta,
  type FichaValues,
  type OpcaoLocalColeta,
  precisaCidadeEstado,
} from '@/features/evento/fichaCampos'
import { colors } from '@/theme/colors'

import { styles } from './styles'

interface LocalColetaInputProps {
  ficha: FichaValues
  // Locais das rotas da expedição
  locais: OpcaoLocalColeta[]
  onChange: (ficha: FichaValues) => void
  // Cidade da rota quando a expedição passa por uma só: sugerida para local digitado
  cidadeUnica?: CidadeEstado | null
}

/**
 * Local da coleta com sugestões dos locais da expedição, como o campo de família.
 * O valor é sempre o texto do campo: um local fora da expedição é salvo como foi
 * digitado. Escolher uma sugestão também preenche a cidade e o estado, por trás;
 * só um local digitado à mão mostra os campos Município e Estado.
 */
export function LocalColetaInput({ ficha, locais, onChange, cidadeUnica = null }: LocalColetaInputProps) {
  const [aberto, setAberto] = useState(false)
  const sugestoes = buscarLocaisColeta(locais, ficha.referencia_local)

  function handleChangeText(text: string) {
    onChange(digitarLocal(ficha, text, locais, cidadeUnica))
    setAberto(true)
  }

  function handleSelect(local: OpcaoLocalColeta) {
    onChange(escolherLocalColeta(ficha, local))
    setAberto(false)
  }

  function renderSugestoes() {
    if (!locais.length) {
      return (
        <Text style={styles.emptyOption}>
          Esta expedição não tem locais cadastrados. O local digitado será salvo assim mesmo.
        </Text>
      )
    }

    if (!sugestoes.length) {
      return (
        <Text style={styles.emptyOption}>
          Nenhum local da expedição encontrado. O local digitado será salvo assim mesmo.
        </Text>
      )
    }

    return sugestoes.map(local => (
      <TouchableOpacity key={local.id} style={styles.option} onPress={() => handleSelect(local)}>
        <Text style={styles.optionText}>{local.descricao}</Text>
        <Text style={styles.localOptionCidade}>{[local.municipio, local.estado].filter(Boolean).join(' – ')}</Text>
      </TouchableOpacity>
    ))
  }

  // Com o campo vazio, a lista só aparece se houver locais para sugerir
  const mostrarLista = aberto && (ficha.referencia_local.trim().length > 0 || locais.length > 0)

  return (
    <>
      <TextInput
        style={styles.input}
        value={ficha.referencia_local}
        onChangeText={handleChangeText}
        onFocus={() => setAberto(true)}
        onBlur={() => setAberto(false)}
        placeholder={locais.length ? 'Digite para buscar os locais da expedição' : 'Ex.: Trilha da cachoeira'}
        placeholderTextColor={colors.placeholder}
        autoCorrect={false}
      />
      {mostrarLista ? <View style={styles.optionsList}>{renderSugestoes()}</View> : null}

      {precisaCidadeEstado(ficha, locais) ? (
        <>
          <Text style={styles.label}>Município</Text>
          <TextInput
            style={styles.input}
            value={ficha.municipio}
            onChangeText={municipio => onChange({ ...ficha, municipio })}
            placeholder="Ex.: Campo Mourão"
            placeholderTextColor={colors.placeholder}
          />
          <Text style={styles.label}>Estado</Text>
          <TextInput
            style={styles.input}
            value={ficha.estado}
            onChangeText={estado => onChange({ ...ficha, estado })}
            placeholder="Ex.: Paraná"
            placeholderTextColor={colors.placeholder}
          />
        </>
      ) : null}
    </>
  )
}
