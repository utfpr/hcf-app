import { useState } from 'react'
import { Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import DateTimePicker, { DateTimePickerAndroid, type DateTimePickerEvent } from '@react-native-community/datetimepicker'
import { Calendar } from 'lucide-react-native'

import { dataBrParaIso, maskDataBr } from '@/features/lembrete/utils'
import { colors } from '@/theme/colors'

interface CampoDataProps {
  // DD/MM/AAAA, do jeito que aparece no campo
  value: string
  onChange: (valor: string) => void
  minimumDate?: Date
}

function paraDataBr(data: Date): string {
  const dia = String(data.getDate()).padStart(2, '0')
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  return `${dia}/${mes}/${data.getFullYear()}`
}

function deDataBr(valor: string): Date | null {
  const iso = dataBrParaIso(valor)
  if (!iso) return null
  const [ano, mes, dia] = iso.split('-').map(Number)
  return new Date(ano, mes - 1, dia)
}

/** Data DD/MM/AAAA: dá para digitar ou escolher no calendário */
export function CampoData({ value, onChange, minimumDate }: CampoDataProps) {
  const [calendarioAberto, setCalendarioAberto] = useState(false)
  // iOS: o calendário fica num modal e só vale ao tocar em "OK"
  const [selecionada, setSelecionada] = useState(new Date())

  function abrirCalendario() {
    const inicial = deDataBr(value) ?? minimumDate ?? new Date()

    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: inicial,
        mode: 'date',
        minimumDate,
        onChange: (event: DateTimePickerEvent, data?: Date) => {
          if (event.type === 'set' && data) onChange(paraDataBr(data))
        },
      })
      return
    }

    setSelecionada(inicial)
    setCalendarioAberto(true)
  }

  function confirmar() {
    onChange(paraDataBr(selecionada))
    setCalendarioAberto(false)
  }

  return (
    <>
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={texto => onChange(maskDataBr(texto))}
          placeholder="DD/MM/AAAA"
          placeholderTextColor={colors.placeholder}
          keyboardType="number-pad"
          maxLength={10}
        />
        <TouchableOpacity onPress={abrirCalendario} hitSlop={10} accessibilityLabel="Escolher data no calendário">
          <Calendar size={18} color={colors.accent} />
        </TouchableOpacity>
      </View>

      {Platform.OS === 'ios' ? (
        <Modal visible={calendarioAberto} transparent animationType="fade" onRequestClose={() => setCalendarioAberto(false)}>
          <View style={styles.fundo}>
            <View style={styles.modal}>
              <DateTimePicker
                value={selecionada}
                mode="date"
                display="inline"
                minimumDate={minimumDate}
                locale="pt-BR"
                accentColor={colors.accent}
                onChange={(_event, data) => data && setSelecionada(data)}
              />
              <View style={styles.acoes}>
                <TouchableOpacity onPress={() => setCalendarioAberto(false)} style={styles.botao}>
                  <Text style={styles.botaoCancelar}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={confirmar} style={styles.botao}>
                  <Text style={styles.botaoOk}>OK</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      ) : null}
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    minHeight: 48,
    borderRadius: 10,
    backgroundColor: colors.inputBackground,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.inputText,
  },
  fundo: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modal: {
    borderRadius: 12,
    padding: 12,
    backgroundColor: colors.inputBackground,
  },
  acoes: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  botao: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  botaoCancelar: {
    color: colors.placeholder,
    fontSize: 14,
    fontWeight: '600',
  },
  botaoOk: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '600',
  },
})
