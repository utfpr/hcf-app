import React, { useEffect, useMemo, useRef, useState } from 'react'
import { ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { ArrowLeft, Clock } from 'lucide-react-native'
import { useNavigation } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { OfflineBanner } from '@/components/OfflineBanner'
import { LocalizacaoChip } from '@/features/evento/components/LocalizacaoChip'
import { RodapeAcoes } from '@/features/evento/components/RodapeAcoes'
import { useFeedback } from '@/components/feedback/FeedbackContext'
import {
  CAMPOS_IDENTIFICACAO,
  CAMPOS_LOCAL,
  cidadeUnicaDaExpedicao,
  dicaDeEscolha,
  EMPTY_FICHA,
  FICHA_COLETA_FIELDS,
  fichaColetaParaPayload,
  fichaComObservacoesMultiplas,
  locaisColetaDaExpedicao,
  ROTULO_NO_CARD,
  ROTULO_OBSERVACAO_MULTIPLA,
  SECOES_COLETA,
  type FichaColetaFieldName,
  type FichaValues,
  type ObservacoesMultiplas,
} from '@/features/evento/fichaCampos'
import { type EvidenciaPendente, useMultimidia } from '@/features/evento/hooks/useMultimidia'
import { useRegistrosExpedicao } from '@/features/evento/hooks/useRegistrosExpedicao'
import type { CriarEventoPayload } from '@/features/evento/types'
import { useRegistrarEvento } from '@/features/evento/hooks/useRegistrarEvento'
import { useExpedition } from '@/features/expedition/hooks/useExpedition'
import { existeColetaComNumero, proximoNumeroColeta } from '@/features/offline/mesclagem'
import { RascunhoBanner } from '@/features/offline/RascunhoBanner'
import { useConfirmarSaida } from '@/features/offline/useConfirmarSaida'
import { useRascunho } from '@/features/offline/useRascunho'
import { FamiliaInput } from '@/features/taxonomia/components/FamiliaInput'
import { getUserFacingHttpError } from '@/libraries/http/httpError'
import { useLocalizacao } from '@/libraries/location/useLocalizacao'
import { EvidenceMode } from '@/navigation/types'
import { colors } from '@/theme/colors'
import { CardFicha } from './CardFicha'
import { CardMidiasAssociadas } from './CardMidiasAssociadas'
import { LocalColetaInput } from './LocalColetaInput'
import { OpcoesChips } from './OpcoesChips'
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

// Rótulo e exemplo de cada campo de texto da ficha
const DEFINICAO_CAMPO = new Map(FICHA_COLETA_FIELDS.map(([campo, rotulo, exemplo]) => [campo, { rotulo, exemplo }]))

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

  // null = número automático (o próximo da expedição); texto = o que o usuário digitou
  const [numeroDigitado, setNumeroDigitado] = useState<string | null>(null)
  const [family, setFamily] = useState('')
  const [ficha, setFicha] = useState<FichaValues>(EMPTY_FICHA)
  const [observacoesMultiplas, setObservacoesMultiplas] = useState<ObservacoesMultiplas>({})
  const [notes, setNotes] = useState('')
  const [saveError, setSaveError] = useState<string | null>(null)

  const localizacao = useLocalizacao()
  const registros = useRegistrosExpedicao(isCollection ? expedicaoId : undefined)
  const expedicao = useExpedition(isCollection ? expedicaoId : undefined)
  const locaisColeta = useMemo(() => locaisColetaDaExpedicao(expedicao.data?.rotas), [expedicao.data])
  const cidadeUnica = useMemo(() => cidadeUnicaDaExpedicao(expedicao.data?.rotas), [expedicao.data])
  const multimidia = useMultimidia()
  const { pendentes, setPendentes } = multimidia

  const { trigger: registrar, loading: isSaving } = useRegistrarEvento(expedicaoId)
  const saveDisabled = !expedicaoId || isSaving || multimidia.busy

  // A contagem é por expedição: 1 na primeira coleta, 2 na seguinte...
  const numeroSugerido = registros.data ? proximoNumeroColeta(registros.data) : ''
  const collectionIdentifier = numeroDigitado ?? numeroSugerido

  // Mesmo número de uma coleta que já existe = mesma coleta: a API junta as duas
  const numero = collectionIdentifier.trim()
  const juntaComExistente = isCollection && !!registros.data && existeColetaComNumero(registros.data, numero)

  const rascunho = useRascunho<Rascunho>(expedicaoId ? `${isCollection ? 'coleta' : 'diario'}-${expedicaoId}` : null)

  // Voltar com algo não salvo pergunta antes: os anexos ficam no rascunho, mas só
  // entram na fila de envio com o "Salvar"
  const naoSalvo = multimidia.isRecording || !rascunhoVazio({
    iniciado_em: '',
    numero: numeroDigitado ?? '',
    familia: family,
    ficha,
    observacoes_multiplas: observacoesMultiplas,
    observacoes: notes,
    midias: pendentes,
  })
  const { sair } = useConfirmarSaida({ pendente: naoSalvo, anexos: pendentes.length })
  const [recuperado, setRecuperado] = useState(false)
  const restaurou = useRef(false)

  // Abriu com um rascunho salvo: devolve o formulário como estava
  useEffect(() => {
    if (restaurou.current || !rascunho.pronto) return
    restaurou.current = true
    const salvo = rascunho.restaurado
    if (!salvo || rascunhoVazio(salvo)) return

    setAgora(new Date(salvo.iniciado_em))
    setNumeroDigitado(salvo.numero || null)
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
      // Só o número digitado: o automático é recalculado ao reabrir
      numero: numeroDigitado ?? '',
      familia: family,
      ficha,
      observacoes_multiplas: observacoesMultiplas,
      observacoes: notes,
      midias: pendentes,
    }
    if (!rascunhoVazio(atual)) salvarRascunho(atual)
  }, [agora, numeroDigitado, family, ficha, observacoesMultiplas, notes, pendentes, salvarRascunho])

  async function handleDescartarRascunho() {
    await rascunho.descartar()
    setAgora(new Date())
    setNumeroDigitado(null)
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

  // `primeiro`: campo que abre o card, sem o espaço acima do rótulo
  function renderCampoTexto(campo: FichaColetaFieldName, primeiro = false) {
    const definicao = DEFINICAO_CAMPO.get(campo)
    return (
      <View key={campo}>
        <Text style={primeiro ? styles.labelFirst : styles.label}>{ROTULO_NO_CARD[campo] ?? definicao?.rotulo}</Text>
        <TextInput
          style={styles.input}
          value={ficha[campo]}
          onChangeText={value => updateFicha(campo, value)}
          placeholder={definicao?.exemplo}
          placeholderTextColor={colors.placeholder}
        />
      </View>
    )
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
            ...fichaColetaParaPayload(fichaComObservacoesMultiplas(ficha, observacoesMultiplas)),
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
      sair(() => navigation.goBack())
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

        <ScrollView contentContainerStyle={[styles.content, styles.cards]} keyboardShouldPersistTaps="handled">
          {isCollection ? (
            <>
              <CardFicha titulo="Identificação">
                <Text style={styles.labelFirst}>Nº da coleta</Text>
                <TextInput
                  style={styles.input}
                  value={collectionIdentifier}
                  onChangeText={value => setNumeroDigitado(value.replace(/\D/g, ''))}
                  keyboardType="number-pad"
                />
                {juntaComExistente ? (
                  <Text style={styles.fieldHint}>
                    Já existe a coleta Nº {numero} nesta expedição: este registro e as evidências serão juntados a ela.
                  </Text>
                ) : null}

                <Text style={styles.label}>Família</Text>
                <FamiliaInput value={family} onChangeText={setFamily} disabled={isSaving} />

                {CAMPOS_IDENTIFICACAO.map(campo => renderCampoTexto(campo))}
              </CardFicha>

              <CardFicha titulo="Local">
                <Text style={styles.labelFirst}>Local da coleta</Text>
                <LocalColetaInput ficha={ficha} locais={locaisColeta} onChange={setFicha} cidadeUnica={cidadeUnica} />
                {CAMPOS_LOCAL.map(campo => renderCampoTexto(campo))}
              </CardFicha>

              {SECOES_COLETA.map(secao => {
                const campoOpcoes = secao.opcoes
                const rotuloObservacao = campoOpcoes ? ROTULO_OBSERVACAO_MULTIPLA[campoOpcoes] : undefined
                return (
                  <CardFicha
                    key={secao.titulo}
                    titulo={secao.titulo}
                    dica={campoOpcoes ? dicaDeEscolha(campoOpcoes) : undefined}
                  >
                    {campoOpcoes ? (
                      <OpcoesChips
                        campo={campoOpcoes}
                        valor={ficha[campoOpcoes]}
                        onChange={valor => updateFicha(campoOpcoes, valor)}
                        disabled={isSaving}
                      />
                    ) : null}
                    {secao.campos.map((campo, indice) => renderCampoTexto(campo, !campoOpcoes && indice === 0))}
                    {campoOpcoes && rotuloObservacao ? (
                      <>
                        <Text style={styles.label}>{rotuloObservacao}</Text>
                        <TextInput
                          style={styles.input}
                          value={observacoesMultiplas[campoOpcoes] ?? ''}
                          onChangeText={value => setObservacoesMultiplas(atual => ({ ...atual, [campoOpcoes]: value }))}
                          placeholderTextColor={colors.placeholder}
                        />
                      </>
                    ) : null}
                  </CardFicha>
                )
              })}
            </>
          ) : null}

          <CardFicha titulo={isCollection ? 'Observações' : 'Descrição'}>
            <TextInput
              style={[styles.textArea, !isCollection && styles.diaryTextArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder={config.descriptionPlaceholder}
              placeholderTextColor={colors.placeholder}
              multiline
              numberOfLines={isCollection ? 5 : 10}
            />
          </CardFicha>

          <CardMidiasAssociadas multimidia={multimidia} disabled={isSaving} />
        </ScrollView>

        <RodapeAcoes
          multimidia={multimidia}
          saveLabel={config.saveLabel}
          salvando={isSaving}
          saveDisabled={saveDisabled}
          onSalvar={handleSave}
          erro={saveError}
        />
      </View>
    </SafeAreaView>
  )
}
