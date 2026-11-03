import React, { useState } from 'react'
import { Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { Check, MapPin } from 'lucide-react-native'

import {
  escolherLocalColeta,
  localEstaSelecionado,
  type FichaValues,
  type OpcaoLocalColeta,
} from '@/features/evento/fichaCampos'
import { colors } from '@/theme/colors'

import { styles } from './styles'

interface LocalColetaInputProps {
  ficha: FichaValues
  // Locais das rotas da expedição; vazio = só texto livre
  locais: OpcaoLocalColeta[]
  onChange: (ficha: FichaValues) => void
}

/**
 * Local da coleta: o usuário escreve livremente ou escolhe um dos locais
 * cadastrados nas rotas da expedição (o que também preenche cidade e estado).
 */
export function LocalColetaInput({ ficha, locais, onChange }: LocalColetaInputProps) {
  const [aberto, setAberto] = useState(false)
  const temLocais = locais.length > 0

  return (
    <>
      <View style={styles.localInputRow}>
        <TextInput
          style={[styles.input, styles.localInputText]}
          value={ficha.referencia_local}
          onChangeText={value => onChange({ ...ficha, referencia_local: value })}
          placeholder={temLocais ? 'Escreva ou escolha um local da expedição' : 'Ex.: Trilha da cachoeira'}
          placeholderTextColor={colors.placeholder}
        />
        {temLocais ? (
          <TouchableOpacity
            testID="abrir-locais-coleta"
            style={styles.localListButton}
            onPress={() => setAberto(true)}
            accessibilityLabel="Escolher um local da expedição"
          >
            <MapPin color={colors.textPrimary} size={18} />
          </TouchableOpacity>
        ) : null}
      </View>

      <Modal visible={aberto} transparent animationType="slide" onRequestClose={() => setAberto(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.optionModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Local da coleta</Text>
              <TouchableOpacity onPress={() => setAberto(false)}>
                <Text style={styles.modalClose}>Fechar</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.modalHint}>A cidade e o estado são preenchidos a partir do local escolhido.</Text>
            <ScrollView contentContainerStyle={styles.modalOptions}>
              {locais.map(local => {
                const selecionado = localEstaSelecionado(ficha, local)
                return (
                  <TouchableOpacity
                    key={local.id}
                    testID={`local-coleta-${local.id}`}
                    style={[styles.modalOption, selecionado && styles.modalOptionSelected]}
                    onPress={() => {
                      onChange(escolherLocalColeta(ficha, local))
                      setAberto(false)
                    }}
                  >
                    <View style={[styles.checkbox, styles.radio, selecionado && styles.checkboxSelected]}>
                      {selecionado ? <Check size={14} color={colors.onAccent} /> : null}
                    </View>
                    <View style={styles.localOptionText}>
                      <Text style={styles.modalOptionText}>{local.descricao}</Text>
                      <Text style={styles.localOptionCidade}>
                        {[local.municipio, local.estado].filter(Boolean).join(' – ')}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  )
}
