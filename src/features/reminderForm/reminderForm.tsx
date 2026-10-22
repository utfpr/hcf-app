import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ArrowLeft, Bell, Calendar, Check, ChevronDown, ChevronUp, Crosshair, MapPin } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CampoData } from '@/components/CampoData';
import { OfflineBanner } from '@/components/OfflineBanner';
import { LocalizacaoChip } from '@/features/evento/components/LocalizacaoChip';
import { EMPTY_FICHA, FICHA_FIELDS, fichaParaPayload, type FichaFieldName, type FichaValues } from '@/features/evento/fichaCampos';
import { useExpedition } from '@/features/expedition/hooks/useExpedition';
import { useCriarLembrete } from '@/features/lembrete/hooks/useCriarLembrete';
import { useFeedback } from '@/components/feedback/FeedbackContext';
import { RascunhoBanner } from '@/features/offline/RascunhoBanner';
import { useRascunho } from '@/features/offline/useRascunho';
import { FamiliaInput } from '@/features/taxonomia/components/FamiliaInput';
import type { CriarLembretePayload } from '@/features/lembrete/types';
import { dataBrParaIso, hojeIso } from '@/features/lembrete/utils';
import { getUserFacingHttpError } from '@/libraries/http/httpError';
import { formatarCoordenadas, useLocalizacao, type Coordenadas } from '@/libraries/location/useLocalizacao';
import { RootStackParamList } from '@/navigation/types';
import { colors } from '../../theme/colors';
import { styles } from '../evidenceForm/styles';
import { reminderStyles } from './styles';
import { Multimidia } from '@/features/evento/components/Multimidia';
import { type EvidenciaPendente, useMultimidia } from '@/features/evento/hooks/useMultimidia';

export interface LembreteFormProps {
  // Expedição de onde o lembrete foi aberto: vai junto no lembrete (a aba da expedição
  // filtra por ela) e é para onde o app volta depois de salvar.
  expedicaoId?: number;
}

// Nome científico tem campo próprio no topo; o resto da ficha fica em "Mais detalhes"
const CAMPOS_DETALHE = FICHA_FIELDS.filter(([campo]) => campo !== 'nome_cientifico');

interface Rascunho {
  familia: string;
  local: string;
  // Ausentes em rascunhos salvos antes de a lista de locais e a descrição existirem
  localId?: number | null;
  descricao?: string;
  posicao?: { latitude: number; longitude: number } | null;
  data: string;
  ficha: FichaValues;
  midias: EvidenciaPendente[];
}

function rascunhoVazio(rascunho: Rascunho): boolean {
  return !rascunho.familia && !rascunho.local && !rascunho.data && rascunho.midias.length === 0
    && Object.values(rascunho.ficha).every(valor => !valor);
}

export function LembreteForm({ expedicaoId }: LembreteFormProps) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Reminders'>>();
  const { toast } = useFeedback();

  const [family, setFamily] = useState('');
  const [ficha, setFicha] = useState<FichaValues>(EMPTY_FICHA);
  const [localColeta, setLocalColeta] = useState('');
  const [selectedLocalId, setSelectedLocalId] = useState<number | null>(null);
  const [isLocalListVisible, setIsLocalListVisible] = useState(false);
  const [descricao, setDescricao] = useState('');
  const [posicao, setPosicao] = useState<{ latitude: number; longitude: number } | null>(null);
  const [dataColeta, setDataColeta] = useState('');
  const [detalhesAbertos, setDetalhesAbertos] = useState(false);
  const multimidia = useMultimidia({ apenasFotos: true });
  const { pendentes, setPendentes } = multimidia;
  const localizacao = useLocalizacao();

  // Locais de coleta definidos nas rotas da expedição, como no formulário de coleta
  const expedition = useExpedition(expedicaoId);
  const locaisColeta = expedition.data?.rotas.flatMap(rota => rota.locais_coleta ?? []) ?? [];
  const usaListaDeLocais = !!expedicaoId;

  const { trigger: criar, loading: isSaving } = useCriarLembrete();
  const [saveError, setSaveError] = useState<string | null>(null);

  const isSaveDisabled = isSaving || multimidia.busy;

  const rascunho = useRascunho<Rascunho>('lembrete');
  const [recuperado, setRecuperado] = useState(false);
  const restaurou = useRef(false);

  // Abriu com um rascunho salvo: devolve o formulário como estava
  useEffect(() => {
    if (restaurou.current || !rascunho.pronto) return;
    restaurou.current = true;
    const salvo = rascunho.restaurado;
    if (!salvo || rascunhoVazio(salvo)) return;

    setFamily(salvo.familia);
    setLocalColeta(salvo.local);
    setSelectedLocalId(salvo.localId ?? null);
    setDescricao(salvo.descricao ?? '');
    setPosicao(salvo.posicao ?? null);
    setDataColeta(salvo.data);
    setFicha({ ...EMPTY_FICHA, ...salvo.ficha });
    // Lembrete só tem foto: descarta vídeo/áudio de rascunhos antigos
    setPendentes(salvo.midias.filter(midia => midia.tipo === 'imagem'));
    setRecuperado(true);
  }, [rascunho.pronto, rascunho.restaurado, setPendentes]);

  const { salvar: salvarRascunho } = rascunho;
  useEffect(() => {
    if (!restaurou.current) return;
    const atual: Rascunho = {
      familia: family, local: localColeta, localId: selectedLocalId, descricao, posicao, data: dataColeta, ficha, midias: pendentes,
    };
    if (!rascunhoVazio(atual)) salvarRascunho(atual);
  }, [family, localColeta, selectedLocalId, descricao, posicao, dataColeta, ficha, pendentes, salvarRascunho]);

  async function handleDescartarRascunho() {
    await rascunho.descartar();
    setFamily('');
    setLocalColeta('');
    setSelectedLocalId(null);
    setDescricao('');
    setPosicao(null);
    setDataColeta('');
    setFicha(EMPTY_FICHA);
    setPendentes([]);
    setRecuperado(false);
  }

  function updateFicha(field: FichaFieldName, value: string) {
    setFicha(current => ({ ...current, [field]: value }));
  }

  function handleUsarPosicaoAtual() {
    if (!localizacao.coords) {
      localizacao.atualizar();
      return;
    }
    const { latitude, longitude }: Coordenadas = localizacao.coords;
    setPosicao({ latitude, longitude });
  }

  function handleSelectLocal(localId: number, nome: string) {
    setSelectedLocalId(localId);
    setLocalColeta(nome);
    setIsLocalListVisible(false);
  }

  // Devolve a mensagem do primeiro problema, ou null se dá para salvar.
  function validar(): string | null {
    if (!localColeta.trim()) return usaListaDeLocais ? 'Selecione o local da coleta.' : 'Informe o local da coleta.';

    const iso = dataBrParaIso(dataColeta);
    if (!iso) return 'Informe uma data válida no formato DD/MM/AAAA.';
    if (iso < hojeIso()) return 'A data para voltar não pode estar no passado.';

    return null;
  }

  function buildPayload(): CriarLembretePayload {
    return {
      ...fichaParaPayload(ficha),
      data_coleta: dataBrParaIso(dataColeta) as string,
      local_coleta: localColeta.trim(),
      descricao: descricao.trim() || null,
      latitude: posicao?.latitude ?? null,
      longitude: posicao?.longitude ?? null,
      familia: family.trim() || null,
      ...(expedicaoId ? { expedicao_id: expedicaoId } : {}),
    };
  }

  async function handleSave() {
    if (isSaveDisabled) return;

    const problema = validar();
    if (problema) {
      setSaveError(problema);
      return;
    }

    setSaveError(null);
    try {
      await criar(buildPayload(), pendentes.map(p => p.payload));
      await rascunho.descartar();
    } catch (error) {
      setSaveError(getUserFacingHttpError(error, 'Não foi possível salvar o lembrete. Tente novamente.'));
      return;
    }

    toast({
      tipo: 'sucesso',
      titulo: 'Lembrete salvo',
      mensagem: `Vamos lembrar de voltar em ${dataColeta}. Ele fica no aparelho até o próximo "Sincronizar".`,
    });
    if (expedicaoId) {
      navigation.popTo('ExpeditionDetail', { expeditionId: String(expedicaoId) });
    } else {
      navigation.goBack();
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
          <Text style={styles.headerTitle}>Lembrete de Coleta</Text>
          <View style={{ width: 22 }} />
        </View>

        <OfflineBanner />

        <View style={styles.metaRow}>
          <View style={styles.metaChip}>
            <Bell size={14} color={colors.textSecondary} />
            <Text style={styles.metaText}>Para uma próxima expedição</Text>
          </View>
          <LocalizacaoChip localizacao={localizacao} />
        </View>

        {recuperado ? <RascunhoBanner onDescartar={handleDescartarRascunho} /> : null}

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.formCard}>
            <Text style={styles.labelFirst}>Família</Text>
            <FamiliaInput value={family} onChangeText={setFamily} disabled={isSaving} />

            <Text style={styles.label}>Nome científico</Text>
            <TextInput
              style={styles.input}
              value={ficha.nome_cientifico}
              onChangeText={value => updateFicha('nome_cientifico', value)}
              placeholder="Ex.: Euterpe edulis"
              placeholderTextColor={colors.placeholder}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={reminderStyles.labelRow}>
              <MapPin size={14} color={colors.textSecondary} />
              <Text style={reminderStyles.labelInline}>Local da coleta *</Text>
            </View>
            {usaListaDeLocais ? (
              <>
                <TouchableOpacity
                  style={styles.selectInput}
                  onPress={() => setIsLocalListVisible(current => !current)}
                  disabled={expedition.loading}
                >
                  <Text style={localColeta ? styles.selectValue : styles.selectPlaceholder}>
                    {expedition.loading ? 'Carregando locais...' : localColeta || 'Selecione o local'}
                  </Text>
                  <ChevronDown color={colors.textSecondary} size={18} />
                </TouchableOpacity>
                {expedition.error ? (
                  <Text style={styles.mediaError}>Não foi possível carregar os locais da expedição.</Text>
                ) : null}
                {isLocalListVisible && (
                  <View style={styles.optionsList}>
                    {locaisColeta.length ? locaisColeta.map(local => (
                      <TouchableOpacity
                        key={local.id}
                        style={styles.option}
                        onPress={() => handleSelectLocal(local.id, local.descricao ?? `Local #${local.id}`)}
                      >
                        <Text style={styles.optionText}>{local.descricao ?? `Local #${local.id}`}</Text>
                      </TouchableOpacity>
                    )) : <Text style={styles.emptyOption}>Nenhum local vinculado às rotas desta expedição.</Text>}
                  </View>
                )}
              </>
            ) : (
              <TextInput
                style={[styles.textArea, reminderStyles.localInput]}
                value={localColeta}
                onChangeText={setLocalColeta}
                placeholder="Ex.: Trilha da cachoeira, 300 m após a ponte"
                placeholderTextColor={colors.placeholder}
                multiline
                numberOfLines={3}
              />
            )}

            <Text style={styles.label}>Descrição</Text>
            <TextInput
              style={[styles.textArea, reminderStyles.localInput]}
              value={descricao}
              onChangeText={setDescricao}
              placeholder="Ex.: Voltar na floração, 300 m após a ponte"
              placeholderTextColor={colors.placeholder}
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity
              style={reminderStyles.secondaryButton}
              onPress={handleUsarPosicaoAtual}
              disabled={localizacao.carregando}
            >
              <Crosshair size={14} color={colors.accent} />
              <Text style={reminderStyles.secondaryButtonText}>
                {posicao
                  ? `Coordenadas: ${formatarCoordenadas(posicao as Coordenadas)} (toque para atualizar)`
                  : localizacao.coords
                    ? `Registrar coordenadas atuais (${formatarCoordenadas(localizacao.coords)})`
                    : localizacao.carregando ? 'Obtendo posição…' : 'Sem GPS — toque para tentar'}
              </Text>
            </TouchableOpacity>

            <View style={reminderStyles.labelRow}>
              <Calendar size={14} color={colors.textSecondary} />
              <Text style={reminderStyles.labelInline}>Data para voltar *</Text>
            </View>
            <CampoData value={dataColeta} onChange={setDataColeta} minimumDate={new Date()} />
            <Text style={reminderStyles.hint}>
              Quando a planta deve estar pronta para coletar (floração, frutificação...).
            </Text>

            <Text style={styles.label}>Fotos</Text>
            <Multimidia state={multimidia} disabled={isSaving} apenasFotos />

            <TouchableOpacity
              style={reminderStyles.detalhesToggle}
              onPress={() => setDetalhesAbertos(aberto => !aberto)}
            >
              <Text style={reminderStyles.detalhesToggleText}>Mais detalhes da planta</Text>
              {detalhesAbertos
                ? <ChevronUp size={18} color={colors.accent} />
                : <ChevronDown size={18} color={colors.accent} />}
            </TouchableOpacity>

            {detalhesAbertos ? CAMPOS_DETALHE.map(([field, label, placeholder]) => (
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
            )) : null}
          </View>
        </ScrollView>

        {saveError ? <Text style={styles.saveError}>{saveError}</Text> : null}

        <TouchableOpacity
          style={[styles.saveButton, isSaveDisabled && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaveDisabled}
        >
          {isSaving ? (
            <ActivityIndicator color={colors.onAccent} />
          ) : (
            <Check size={18} color={colors.onAccent} />
          )}
          <Text style={styles.saveButtonText}>{isSaving ? 'Salvando...' : 'Salvar Lembrete'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
