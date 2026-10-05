import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ArrowLeft, Bell, Calendar, Check, ChevronDown, Crosshair, MapPin } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCriarLembrete } from '@/features/lembrete/hooks/useCriarLembrete';
import type { CriarLembretePayload } from '@/features/lembrete/types';
import { dataBrParaIso, hojeIso, maskDataBr } from '@/features/lembrete/utils';
import { getUserFacingHttpError } from '@/libraries/http/httpError';
import { RootStackParamList } from '@/navigation/types';
import { colors } from '../../theme/colors';
import { styles } from '../evidenceForm/styles';
import { reminderStyles } from './styles';

export interface LembreteFormProps {
  // Expedição de onde o lembrete foi aberto; usada só para voltar a ela depois de salvar.
  expedicaoId?: number;
  latitude: number;
  longitude: number;
}

const FAMILY_OPTIONS = ['Acanthaceae', 'Asteraceae', 'Bromeliaceae', 'Fabaceae', 'Myrtaceae', 'Orchidaceae', 'Rubiaceae'];

export function LembreteForm({ expedicaoId, latitude, longitude }: LembreteFormProps) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Lembrete'>>();

  const [family, setFamily] = useState<string | null>(null);
  const [isFamilyListVisible, setIsFamilyListVisible] = useState(false);
  const [scientificName, setScientificName] = useState('');
  const [localColeta, setLocalColeta] = useState('');
  const [dataColeta, setDataColeta] = useState('');

  const { trigger: criar, loading: isSaving } = useCriarLembrete();
  const [saveError, setSaveError] = useState<string | null>(null);

  const posicaoAtual = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

  function handleUsarPosicaoAtual() {
    setLocalColeta(current => (current.trim() ? `${current.trim()} (${posicaoAtual})` : posicaoAtual));
  }

  // Devolve a mensagem do primeiro problema, ou null se dá para salvar.
  function validar(): string | null {
    if (!localColeta.trim()) return 'Informe o local da coleta.';

    const iso = dataBrParaIso(dataColeta);
    if (!iso) return 'Informe uma data válida no formato DD/MM/AAAA.';
    if (iso < hojeIso()) return 'A data para voltar não pode estar no passado.';

    return null;
  }

  function buildPayload(): CriarLembretePayload {
    return {
      data_coleta: dataBrParaIso(dataColeta) as string,
      local_coleta: localColeta.trim(),
      familia: family,
      nome_cientifico: scientificName.trim() || null,
    };
  }

  async function handleSave() {
    if (isSaving) return;

    const problema = validar();
    if (problema) {
      setSaveError(problema);
      return;
    }

    setSaveError(null);
    try {
      await criar(buildPayload());
    } catch (error) {
      setSaveError(getUserFacingHttpError(error, 'Não foi possível salvar o lembrete. Tente novamente.'));
      return;
    }

    Alert.alert(
      'Lembrete salvo',
      `Vamos lembrar de voltar em ${dataColeta}.`,
      [{
        text: 'OK',
        onPress: () => (expedicaoId
          ? navigation.popTo('ExpeditionDetail', { expeditionId: String(expedicaoId) })
          : navigation.goBack()),
      }],
      { cancelable: false },
    );
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

        <View style={styles.metaRow}>
          <View style={styles.metaChip}>
            <Bell size={14} color={colors.textSecondary} />
            <Text style={styles.metaText}>Para uma próxima expedição</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.formCard}>
            <Text style={styles.labelFirst}>Família</Text>
            <TouchableOpacity
              style={styles.selectInput}
              onPress={() => setIsFamilyListVisible(v => !v)}
              accessibilityRole="button"
            >
              <Text style={family ? styles.selectValue : styles.selectPlaceholder}>
                {family ?? 'Selecione a família'}
              </Text>
              <ChevronDown color={colors.textSecondary} size={18} />
            </TouchableOpacity>
            {isFamilyListVisible && (
              <View style={styles.optionsList}>
                {FAMILY_OPTIONS.map(option => (
                  <TouchableOpacity
                    key={option}
                    style={styles.option}
                    onPress={() => {
                      setFamily(option);
                      setIsFamilyListVisible(false);
                    }}
                  >
                    <Text style={styles.optionText}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={styles.label}>Nome científico</Text>
            <TextInput
              style={styles.input}
              value={scientificName}
              onChangeText={setScientificName}
              placeholder="Ex.: Euterpe edulis"
              placeholderTextColor={colors.placeholder}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={reminderStyles.labelRow}>
              <MapPin size={14} color={colors.textSecondary} />
              <Text style={reminderStyles.labelInline}>Local da coleta *</Text>
            </View>
            <TextInput
              style={[styles.textArea, reminderStyles.localInput]}
              value={localColeta}
              onChangeText={setLocalColeta}
              placeholder="Ex.: Trilha da cachoeira, 300 m após a ponte"
              placeholderTextColor={colors.placeholder}
              multiline
              numberOfLines={3}
            />
            <TouchableOpacity style={reminderStyles.secondaryButton} onPress={handleUsarPosicaoAtual}>
              <Crosshair size={14} color={colors.accent} />
              <Text style={reminderStyles.secondaryButtonText}>Usar posição atual ({posicaoAtual})</Text>
            </TouchableOpacity>

            <View style={reminderStyles.labelRow}>
              <Calendar size={14} color={colors.textSecondary} />
              <Text style={reminderStyles.labelInline}>Data para voltar *</Text>
            </View>
            <TextInput
              style={styles.input}
              value={dataColeta}
              onChangeText={value => setDataColeta(maskDataBr(value))}
              placeholder="DD/MM/AAAA"
              placeholderTextColor={colors.placeholder}
              keyboardType="number-pad"
              maxLength={10}
            />
            <Text style={reminderStyles.hint}>
              Quando a planta deve estar pronta para coletar (floração, frutificação...).
            </Text>
          </View>
        </ScrollView>

        {saveError ? <Text style={styles.saveError}>{saveError}</Text> : null}

        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaving}
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
