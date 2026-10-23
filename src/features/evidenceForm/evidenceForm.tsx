import React, { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Modal, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { ArrowLeft, Check, ChevronDown, ChevronUp, Clock } from 'lucide-react-native'
import { useNavigation } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { OfflineBanner } from '@/components/OfflineBanner'
import { LocalizacaoChip } from '@/features/evento/components/LocalizacaoChip'
import { Multimidia } from '@/features/evento/components/Multimidia'
import { useFeedback } from '@/components/feedback/FeedbackContext'
import {
  EMPTY_FICHA,
  FICHA_MULTIPLA_ESCOLHA,
  FICHA_FIELDS,
  fichaComObservacoesMultiplas,
  fichaParaPayload,
  ROTULO_OBSERVACAO_MULTIPLA,
  type CampoMultiplaEscolha,
  type FichaValues,
  type ObservacoesMultiplas,
} from '@/features/evento/fichaCampos'
import { type EvidenciaPendente, useMultimidia } from '@/features/evento/hooks/useMultimidia'
import { useRegistrosExpedicao } from '@/features/evento/hooks/useRegistrosExpedicao'
import type { CriarEventoPayload } from '@/features/evento/types'
import { useRegistrarEvento } from '@/features/evento/hooks/useRegistrarEvento'
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
  ficha: FichaValues
  observacoes_multiplas: ObservacoesMultiplas
  observacoes: string
  midias: EvidenciaPendente[]
}

const CAMPOS_DETALHE = FICHA_FIELDS

function rascunhoVazio(rascunho: Rascunho): boolean {
  return !rascunho.numero && !rascunho.familia && !rascunho.observacoes
    && rascunho.midias.length === 0
    && Object.values(rascunho.ficha).every(valor => !valor)
    && Object.values(rascunho.observacoes_multiplas ?? {}).every(valor => !valor)
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
  const [ficha, setFicha] = useState<FichaValues>(EMPTY_FICHA)
  const [observacoesMultiplas, setObservacoesMultiplas] = useState<ObservacoesMultiplas>({})
  const [detalhesAbertos, setDetalhesAbertos] = useState(false)
  const [campoAberto, setCampoAberto] = useState<CampoMultiplaEscolha | null>(null)
  const [notes, setNotes] = useState('')
  const [saveError, setSaveError] = useState<string | null>(null)

  const localizacao = useLocalizacao()
  const registros = useRegistrosExpedicao(isCollection ? expedicaoId : undefined)
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
    setFicha({ ...EMPTY_FICHA, ...salvo.ficha })
    setObservacoesMultiplas(salvo.observacoes_multiplas ?? {})
    setNotes(salvo.observacoes)
    setPendentes(salvo.midias.map(item => item.tipo === 'video'
      ? { ...item, validandoDuracao: true }
      : item))
    setRecuperado(true)
  }, [rascunho.pronto, rascunho.restaurado, setPendentes])

  const { salvar: salvarRascunho } = rascunho
  useEffect(() => {
    if (!restaurou.current) return
    const atual: Rascunho = {
      iniciado_em: agora.toISOString(),
      numero: collectionIdentifier,
      familia: family,
      ficha,
      observacoes_multiplas: observacoesMultiplas,
      observacoes: notes,
      midias: pendentes,
    }
    if (!rascunhoVazio(atual)) salvarRascunho(atual)
  }, [agora, collectionIdentifier, family, ficha, observacoesMultiplas, notes, pendentes, salvarRascunho])

  async function handleDescartarRascunho() {
    await rascunho.descartar()
    setAgora(new Date())
    setCollectionIdentifier('')
    setFamily('')
    setFicha(EMPTY_FICHA)
    setObservacoesMultiplas({})
    setNotes('')
    setPendentes([])
    setRecuperado(false)
  }

  function updateFicha(field: keyof FichaValues, value: string) {
    setFicha(current => ({ ...current, [field]: value }))
  }

  function alternarOpcao(campo: CampoMultiplaEscolha, opcao: string) {
    const selecionadas = ficha[campo]
      ? ficha[campo].split(', ').filter(Boolean)
      : []
    const proximo = selecionadas.includes(opcao)
      ? selecionadas.filter(item => item !== opcao)
      : [...selecionadas, opcao]

    updateFicha(campo, proximo.join(', '))
  }

  const opcoesDoModal = campoAberto ? FICHA_MULTIPLA_ESCOLHA[campoAberto] : []
  const rotuloDoModal = campoAberto
    ? FICHA_FIELDS.find(([campo]) => campo === campoAberto)?.[1] ?? ''
    : ''
  const selecionadasNoModal = campoAberto ? ficha[campoAberto].split(', ').filter(Boolean) : []

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
            ...fichaParaPayload(fichaComObservacoesMultiplas(ficha, observacoesMultiplas)),
            familia: family.trim() || null,
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
                  keyboardType="number-pad"
                />
                {juntaComExistente ? (
                  <Text style={styles.fieldHint}>
                    Já existe a coleta Nº {numero} nesta expedição: este registro e as evidências serão juntados a ela.
                  </Text>
                ) : null}

                <Text style={styles.label}>Família</Text>
                <FamiliaInput value={family} onChangeText={setFamily} disabled={isSaving} />

                <Text style={styles.label}>Local da coleta</Text>
                <TextInput
                  style={styles.input}
                  value={ficha.referencia_local}
                  onChangeText={value => updateFicha('referencia_local', value)}
                  placeholder="Ex.: Trilha da cachoeira"
                  placeholderTextColor={colors.placeholder}
                />

              </>
            ) : null}

            <Text style={isCollection ? styles.label : styles.labelFirst}>Multimídia</Text>
            <Multimidia state={multimidia} disabled={isSaving} />

            {isCollection ? (
              <>
                <TouchableOpacity
                  style={styles.detalhesToggle}
                  onPress={() => setDetalhesAbertos(aberto => !aberto)}
                >
                  <Text style={styles.detalhesToggleText}>Mais detalhes da coleta</Text>
                  {detalhesAbertos
                    ? <ChevronUp size={18} color={colors.accent} />
                    : <ChevronDown size={18} color={colors.accent} />}
                </TouchableOpacity>

                {detalhesAbertos ? CAMPOS_DETALHE.map(([field, label, placeholder]) => {
                  const opcoes = FICHA_MULTIPLA_ESCOLHA[field as CampoMultiplaEscolha]
                  if (!opcoes) {
                    return (
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
                    )
                  }

                  const campo = field as CampoMultiplaEscolha
                  const selecionadas = ficha[campo].split(', ').filter(Boolean)
                  const rotuloObservacao = ROTULO_OBSERVACAO_MULTIPLA[campo]
                  return (
                    <View key={field}>
                      <Text style={styles.label}>{label}</Text>
                      <TouchableOpacity style={styles.selectInput} onPress={() => setCampoAberto(campo)}>
                        <Text
                          style={selecionadas.length ? styles.selectValue : styles.selectPlaceholder}
                          numberOfLines={1}
                        >
                          {selecionadas.length
                            ? selecionadas.join(', ')
                            : 'Selecionar uma ou mais opções'}
                        </Text>
                        <ChevronDown color={colors.textSecondary} size={18} />
                      </TouchableOpacity>
                      {rotuloObservacao ? (
                        <TextInput
                          style={[styles.input, styles.conditionalInput]}
                          value={observacoesMultiplas[campo] ?? ''}
                          onChangeText={value => setObservacoesMultiplas(atual => ({ ...atual, [campo]: value }))}
                          placeholder={rotuloObservacao}
                          placeholderTextColor={colors.placeholder}
                        />
                      ) : null}
                    </View>
                  )
                }) : null}
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

        <Modal
          visible={!!campoAberto}
          transparent
          animationType="slide"
          onRequestClose={() => setCampoAberto(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.optionModal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{rotuloDoModal}</Text>
                <TouchableOpacity onPress={() => setCampoAberto(null)}>
                  <Text style={styles.modalClose}>Concluído</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.modalHint}>Selecione uma ou mais opções.</Text>
              <ScrollView contentContainerStyle={styles.modalOptions}>
                {opcoesDoModal.map(opcao => {
                  const selecionada = selecionadasNoModal.includes(opcao)
                  return (
                    <TouchableOpacity
                      key={opcao}
                      style={[styles.modalOption, selecionada && styles.modalOptionSelected]}
                      onPress={() => campoAberto && alternarOpcao(campoAberto, opcao)}
                    >
                      <View style={[styles.checkbox, selecionada && styles.checkboxSelected]}>
                        {selecionada ? <Check size={14} color={colors.onAccent} /> : null}
                      </View>
                      <Text style={styles.modalOptionText}>{opcao}</Text>
                    </TouchableOpacity>
                  )
                })}
              </ScrollView>
            </View>
          </View>
        </Modal>

        <TouchableOpacity style={[styles.saveButton, saveDisabled && { opacity: 0.7 }]} onPress={handleSave} disabled={saveDisabled}>
          {isSaving ? <ActivityIndicator color="#FFFFFF" size="small" /> : <Check size={18} color="#FFFFFF" />}
          <Text style={styles.saveButtonText}>{isSaving ? 'Salvando...' : config.saveLabel}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}
