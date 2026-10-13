import React, { useState } from 'react'
import { ActivityIndicator, Alert, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { ArrowLeft, Check, ChevronDown, Clock, MapPin } from 'lucide-react-native'
import { useNavigation } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Multimidia } from '@/features/evento/components/Multimidia'
import { useMultimidia } from '@/features/evento/hooks/useMultimidia'
import type { CriarEventoPayload } from '@/features/evento/types'
import { useRegistrarEvento } from '@/features/evento/hooks/useRegistrarEvento'
import { useExpedition } from '@/features/expedition/hooks/useExpedition'
import { getUserFacingHttpError } from '@/libraries/http/httpError'
import { EvidenceMode } from '@/navigation/types'
import { colors } from '@/theme/colors'

import { styles } from './styles'

export interface FormularioProps {
  expedicaoId?: number
  mode: EvidenceMode
  latitude: number
  longitude: number
}

interface ModeConfig {
  title: string
  descriptionPlaceholder: string
  saveLabel: string
}

const MODE_CONFIG: Record<EvidenceMode, ModeConfig> = {
  collection: {
    title: 'Registro de Coleta',
    descriptionPlaceholder: 'Detalhes adicionais da coleta...',
    saveLabel: 'Salvar Coleta',
  },
  diary: {
    title: 'Registro de Diário',
    descriptionPlaceholder: 'Descreva detalhadamente o que foi observado em campo...',
    saveLabel: 'Salvar Diário',
  },
}

const FAMILY_OPTIONS = ['Acanthaceae', 'Asteraceae', 'Bromeliaceae', 'Fabaceae', 'Myrtaceae', 'Orchidaceae', 'Rubiaceae']

const FICHA_FIELDS = [
  ['nome_popular', 'Nome popular', 'Ex.: Palmito-juçara'],
  ['nome_cientifico', 'Nome científico', 'Ex.: Euterpe edulis'],
  ['municipio', 'Município', 'Ex.: Campo Mourão'],
  ['estado', 'Estado', 'Ex.: Paraná'],
  ['tipo_vegetacao', 'Tipo de vegetação', 'Ex.: Floresta estacional'],
  ['solo', 'Solo', 'Ex.: Argiloso'],
  ['relevo', 'Relevo', 'Ex.: Plano'],
  ['substrato', 'Substrato', 'Ex.: Solo úmido'],
  ['tronco_com_casca', 'Tronco com casca', 'Descreva o tronco'],
  ['associacoes', 'Associações', 'Espécies associadas'],
  ['folhas', 'Folhas', 'Descreva as folhas'],
  ['habito', 'Hábito', 'Ex.: Arbóreo'],
  ['frutos', 'Frutos', 'Descreva os frutos'],
  ['flores', 'Flores', 'Descreva as flores'],
  ['luminosidade', 'Luminosidade', 'Ex.: Meia-sombra'],
] as const

type FichaFieldName = (typeof FICHA_FIELDS)[number][0]
type FichaValues = Record<FichaFieldName, string>

const EMPTY_FICHA: FichaValues = Object.fromEntries(
  FICHA_FIELDS.map(([key]) => [key, '']),
) as FichaValues

export function Formulario({ expedicaoId, mode, latitude, longitude }: FormularioProps) {
  const navigation = useNavigation()
  const config = MODE_CONFIG[mode]
  const isCollection = mode === 'collection'
  const [agora] = useState(() => new Date())
  const dataHora = `${agora.toLocaleDateString('pt-BR')} ${agora.toLocaleTimeString('pt-BR')}`
  const [collectionIdentifier, setCollectionIdentifier] = useState('')
  const [family, setFamily] = useState<string | null>(null)
  const [isFamilyListVisible, setIsFamilyListVisible] = useState(false)
  const [isLocalListVisible, setIsLocalListVisible] = useState(false)
  const [selectedLocalId, setSelectedLocalId] = useState<number | null>(null)
  const [ficha, setFicha] = useState<FichaValues>(EMPTY_FICHA)
  const [notes, setNotes] = useState('')
  const [saveError, setSaveError] = useState<string | null>(null)

  const expedition = useExpedition(expedicaoId)
  const locaisColeta = expedition.data?.rotas.flatMap(rota => rota.locais_coleta ?? []) ?? []
  const selectedLocal = locaisColeta.find(local => local.id === selectedLocalId)
  const multimidia = useMultimidia()
  const { trigger: registrar, loading: isSaving } = useRegistrarEvento(expedicaoId)
  const saveDisabled = !expedicaoId || isSaving || multimidia.busy

  function updateFicha(field: FichaFieldName, value: string) {
    setFicha(current => ({ ...current, [field]: value }))
  }

  async function handleSave() {
    if (saveDisabled) return
    setSaveError(null)

    const base = {
      capturado_em: agora.toISOString(),
      latitude,
      longitude,
      observacoes: notes.trim() || null,
    }
    const eventoPayload: CriarEventoPayload = isCollection
      ? {
          ...base,
          tipo: 'COLETA',
          coleta: {
            ...ficha,
            familia: family,
            referencia_local: selectedLocal?.descricao ?? null,
          },
        }
      : { ...base, tipo: 'DIARIO' }

    try {
      await registrar(eventoPayload, multimidia.pendentes.map(item => item.payload))
      Alert.alert('Sucesso', isCollection ? 'Coleta salva!' : 'Diário salvo!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ])
    } catch (error) {
      setSaveError(getUserFacingHttpError(error, 'Erro ao salvar o registro.'))
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <View style={styles.header}>
          <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} onPress={() => navigation.goBack()}>
            <ArrowLeft color={colors.textPrimary} size={22} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{config.title}</Text>
          <View style={{ width: 22 }} />
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaChip}>
            <MapPin size={14} color={colors.textSecondary} />
            <Text style={styles.metaText}>{latitude.toFixed(4)}, {longitude.toFixed(4)}</Text>
          </View>
          <View style={styles.metaChip}>
            <Clock size={14} color={colors.textSecondary} />
            <Text style={styles.metaText}>{dataHora}</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.formCard}>
            {isCollection ? (
              <>
                <Text style={styles.labelFirst}>ID da coleta</Text>
                <TextInput
                  style={styles.input}
                  value={collectionIdentifier}
                  onChangeText={value => setCollectionIdentifier(value.replace(/\D/g, ''))}
                  placeholder="Digite o ID da coleta"
                  placeholderTextColor={colors.placeholder}
                  keyboardType="number-pad"
                />

                <Text style={styles.label}>Local da coleta</Text>
                <TouchableOpacity
                  style={styles.selectInput}
                  onPress={() => setIsLocalListVisible(current => !current)}
                  disabled={!expedicaoId || expedition.loading}
                >
                  <Text style={selectedLocal ? styles.selectValue : styles.selectPlaceholder}>
                    {expedition.loading ? 'Carregando locais...' : selectedLocal?.descricao ?? 'Selecione o local'}
                  </Text>
                  <ChevronDown color={colors.textSecondary} size={18} />
                </TouchableOpacity>
                {expedition.error ? <Text style={styles.mediaError}>Não foi possível carregar os locais da expedição.</Text> : null}
                {isLocalListVisible && (
                  <View style={styles.optionsList}>
                    {locaisColeta.length ? locaisColeta.map(local => (
                      <TouchableOpacity key={local.id} style={styles.option} onPress={() => { setSelectedLocalId(local.id); setIsLocalListVisible(false) }}>
                        <Text style={styles.optionText}>{local.descricao ?? `Local #${local.id}`}</Text>
                      </TouchableOpacity>
                    )) : <Text style={styles.emptyOption}>Nenhum local vinculado às rotas desta expedição.</Text>}
                  </View>
                )}
              </>
            ) : null}

            <Text style={isCollection ? styles.label : styles.labelFirst}>Multimídia</Text>
            <Multimidia state={multimidia} disabled={isSaving} />

            {isCollection ? (
              <>
                <Text style={styles.label}>Família</Text>
                <TouchableOpacity style={styles.selectInput} onPress={() => setIsFamilyListVisible(current => !current)}>
                  <Text style={family ? styles.selectValue : styles.selectPlaceholder}>{family ?? 'Selecione a família'}</Text>
                  <ChevronDown color={colors.textSecondary} size={18} />
                </TouchableOpacity>
                {isFamilyListVisible && (
                  <View style={styles.optionsList}>
                    {FAMILY_OPTIONS.map(option => (
                      <TouchableOpacity key={option} style={styles.option} onPress={() => { setFamily(option); setIsFamilyListVisible(false) }}>
                        <Text style={styles.optionText}>{option}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {FICHA_FIELDS.map(([field, label, placeholder]) => (
                  <View key={field}>
                    <Text style={styles.label}>{label}</Text>
                    <TextInput
                      style={styles.input}
                      value={ficha[field]}
                      onChangeText={value => updateFicha(field, value)}
                      placeholder={placeholder}
                      placeholderTextColor={colors.placeholder}
                    />
                  </View>
                ))}
              </>
            ) : null}

            <Text style={styles.label}>{isCollection ? 'Observações' : 'Descrição'}</Text>
            <TextInput
              style={[styles.textArea, !isCollection && styles.diaryTextArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder={config.descriptionPlaceholder}
              placeholderTextColor={colors.placeholder}
              multiline
              numberOfLines={isCollection ? 5 : 10}
            />
            {saveError ? <Text style={styles.mediaError}>{saveError}</Text> : null}
          </View>
        </ScrollView>

        <TouchableOpacity style={[styles.saveButton, saveDisabled && { opacity: 0.7 }]} onPress={handleSave} disabled={saveDisabled}>
          {isSaving ? <ActivityIndicator color="#FFFFFF" size="small" /> : <Check size={18} color="#FFFFFF" />}
          <Text style={styles.saveButtonText}>{isSaving ? 'Salvando...' : config.saveLabel}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}
