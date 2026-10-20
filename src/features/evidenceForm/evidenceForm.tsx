import React, { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { ArrowLeft, Check, ChevronDown, Clock } from 'lucide-react-native'
import { useNavigation } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { OfflineBanner } from '@/components/OfflineBanner'
import { LocalizacaoChip } from '@/features/evento/components/LocalizacaoChip'
import { Multimidia } from '@/features/evento/components/Multimidia'
import { useFeedback } from '@/components/feedback/FeedbackContext'
import {
  EMPTY_FICHA,
  FICHA_FIELDS,
  fichaParaPayload,
  municipioEEstadoDoLocal,
  type FichaFieldName,
  type FichaValues,
} from '@/features/evento/fichaCampos'
import { type EvidenciaPendente, useMultimidia } from '@/features/evento/hooks/useMultimidia'
import { useRegistrosExpedicao } from '@/features/evento/hooks/useRegistrosExpedicao'
import type { CriarEventoPayload } from '@/features/evento/types'
import { useRegistrarEvento } from '@/features/evento/hooks/useRegistrarEvento'
import { useExpedition } from '@/features/expedition/hooks/useExpedition'
import { existeColetaComNumero } from '@/features/offline/mesclagem'
import { RascunhoBanner } from '@/features/offline/RascunhoBanner'
import { useRascunho } from '@/features/offline/useRascunho'
import { FamiliaInput } from '@/features/taxonomia/components/FamiliaInput'
import { getUserFacingHttpError } from '@/libraries/http/httpError'
import { useLocalizacao } from '@/libraries/location/useLocalizacao'
import { EvidenceMode } from '@/navigation/types'
import { colors } from '@/theme/colors'
import { styles } from './styles'

export interface FormularioProps {
  expedicaoId?: number
  mode: EvidenceMode
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

// O que o rascunho guarda para devolver o formulário como estava
interface Rascunho {
  iniciado_em: string
  numero: string
  familia: string
  local_id: number | null
  ficha: FichaValues
  observacoes: string
  midias: EvidenciaPendente[]
}

function rascunhoVazio(rascunho: Rascunho): boolean {
  return !rascunho.numero && !rascunho.familia && rascunho.local_id === null && !rascunho.observacoes
    && rascunho.midias.length === 0 && Object.values(rascunho.ficha).every(valor => !valor)
}

export function Formulario({ expedicaoId, mode }: FormularioProps) {
  const navigation = useNavigation()
  const { toast } = useFeedback()
  const config = MODE_CONFIG[mode]
  const isCollection = mode === 'collection'

  const [agora, setAgora] = useState(() => new Date())
  const dataHora = `${agora.toLocaleDateString('pt-BR')} ${agora.toLocaleTimeString('pt-BR')}`

  const [collectionIdentifier, setCollectionIdentifier] = useState('')
  const [family, setFamily] = useState('')
  const [isLocalListVisible, setIsLocalListVisible] = useState(false)
  const [selectedLocalId, setSelectedLocalId] = useState<number | null>(null)
  const [ficha, setFicha] = useState<FichaValues>(EMPTY_FICHA)
  const [notes, setNotes] = useState('')
  const [saveError, setSaveError] = useState<string | null>(null)

  const localizacao = useLocalizacao()
  const expedition = useExpedition(expedicaoId)
  const registros = useRegistrosExpedicao(isCollection ? expedicaoId : undefined)
  const locaisColeta = expedition.data?.rotas.flatMap(rota => rota.locais_coleta ?? []) ?? []
  const selectedLocal = locaisColeta.find(local => local.id === selectedLocalId)
  const multimidia = useMultimidia()
  const { pendentes, setPendentes } = multimidia

  const { trigger: registrar, loading: isSaving } = useRegistrarEvento(expedicaoId)
  const saveDisabled = !expedicaoId || isSaving || multimidia.busy

  // Mesmo número de uma coleta que já existe = mesma coleta: a API junta as duas
  const numero = collectionIdentifier.trim()
  const juntaComExistente = isCollection && !!registros.data && existeColetaComNumero(registros.data, numero)

  const rascunho = useRascunho<Rascunho>(expedicaoId ? `${isCollection ? 'coleta' : 'diario'}-${expedicaoId}` : null)
  const [recuperado, setRecuperado] = useState(false)
  const restaurou = useRef(false)

  // Abriu com um rascunho salvo: devolve o formulário como estava
  useEffect(() => {
    if (restaurou.current || !rascunho.pronto) return
    restaurou.current = true
    const salvo = rascunho.restaurado
    if (!salvo || rascunhoVazio(salvo)) return

    setAgora(new Date(salvo.iniciado_em))
    setCollectionIdentifier(salvo.numero)
    setFamily(salvo.familia)
    setSelectedLocalId(salvo.local_id)
    setFicha({ ...EMPTY_FICHA, ...salvo.ficha })
    setNotes(salvo.observacoes)
    setPendentes(salvo.midias)
    setRecuperado(true)
  }, [rascunho.pronto, rascunho.restaurado, setPendentes])

  const { salvar: salvarRascunho } = rascunho
  useEffect(() => {
    if (!restaurou.current) return
    const atual: Rascunho = {
      iniciado_em: agora.toISOString(),
      numero: collectionIdentifier,
      familia: family,
      local_id: selectedLocalId,
      ficha,
      observacoes: notes,
      midias: pendentes,
    }
    if (!rascunhoVazio(atual)) salvarRascunho(atual)
  }, [agora, collectionIdentifier, family, selectedLocalId, ficha, notes, pendentes, salvarRascunho])

  async function handleDescartarRascunho() {
    await rascunho.descartar()
    setAgora(new Date())
    setCollectionIdentifier('')
    setFamily('')
    setSelectedLocalId(null)
    setFicha(EMPTY_FICHA)
    setNotes('')
    setPendentes([])
    setRecuperado(false)
  }

  function updateFicha(field: FichaFieldName, value: string) {
    setFicha(current => ({ ...current, [field]: value }))
  }

  // Escolher o local preenche município e estado com a cidade dele; os campos
  // continuam editáveis
  function handleSelectLocal(localId: number) {
    setSelectedLocalId(localId)
    setIsLocalListVisible(false)
    const cidade = municipioEEstadoDoLocal(expedition.data?.rotas ?? [], localId)
    if (cidade) setFicha(current => ({ ...current, ...cidade }))
  }

  async function handleSave() {
    if (saveDisabled) return
    setSaveError(null)

    const base = {
      data_captura: agora.toISOString(),
      latitude: localizacao.coords?.latitude ?? null,
      longitude: localizacao.coords?.longitude ?? null,
      altitude: localizacao.coords?.altitude ?? null,
      observacoes: notes.trim() || null,
    }

    const eventoPayload: CriarEventoPayload = isCollection
      ? {
          ...base,
          tipo: 'COLETA',
          numero_coleta: numero || null,
          coleta: {
            ...fichaParaPayload(ficha),
            familia: family.trim() || null,
            referencia_local: selectedLocal?.descricao ?? null,
          },
        }
      : { ...base, tipo: 'DIARIO' }

    try {
      await registrar(eventoPayload, pendentes.map(item => item.payload))
      await rascunho.descartar()
      toast({
        tipo: 'sucesso',
        titulo: isCollection ? 'Coleta salva' : 'Diário salvo',
        mensagem: 'Salvo no aparelho. Será enviado no próximo "Sincronizar".',
      })
      navigation.goBack()
    } catch (error) {
      setSaveError(getUserFacingHttpError(error, 'Erro ao salvar o registro no aparelho.'))
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

        <OfflineBanner />

        <View style={styles.metaRow}>
          <LocalizacaoChip localizacao={localizacao} />
          <View style={styles.metaChip}>
            <Clock size={14} color={colors.textSecondary} />
            <Text style={styles.metaText}>{dataHora}</Text>
          </View>
        </View>

        {recuperado ? <RascunhoBanner onDescartar={handleDescartarRascunho} /> : null}

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.formCard}>
            {isCollection ? (
              <>
                <Text style={styles.labelFirst}>Nº da coleta</Text>
                <TextInput
                  style={styles.input}
                  value={collectionIdentifier}
                  onChangeText={value => setCollectionIdentifier(value.replace(/\D/g, ''))}
                  placeholder="Mesmo número para quem registra a mesma coleta"
                  placeholderTextColor={colors.placeholder}
                  keyboardType="number-pad"
                />
                {juntaComExistente ? (
                  <Text style={styles.fieldHint}>
                    Já existe a coleta Nº {numero} nesta expedição: este registro e as evidências serão juntados a ela.
                  </Text>
                ) : null}

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
                      <TouchableOpacity key={local.id} style={styles.option} onPress={() => handleSelectLocal(local.id)}>
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
                <FamiliaInput value={family} onChangeText={setFamily} disabled={isSaving} />
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
