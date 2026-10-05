import React, { useState } from 'react';
import { ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View, ActivityIndicator, Alert } from 'react-native';
import { ArrowLeft, Check, ChevronDown, Clock, MapPin } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EvidenceMode } from '@/navigation/types';
import { colors } from '../../theme/colors';
import { styles } from './styles';
import { useRegistrarEvento } from '@/features/evento/hooks/useRegistrarEvento';
import { useMultimidia } from '@/features/evento/hooks/useMultimidia';
import { Multimidia } from '@/features/evento/components/Multimidia';
import type { CriarEventoPayload } from '@/features/evento/types';
import { getUserFacingHttpError } from '@/libraries/http/httpError';

export interface FormularioProps {
  expedicaoId?: number; // Necessário para a API saber onde salvar
  mode: EvidenceMode;
  latitude: number;
  longitude: number;
}

interface ModeConfig {
  title: string;
  notesLabel: string;
  notesPlaceholder: string;
  saveLabel: string;
}

const MODE_CONFIG: Record<EvidenceMode, ModeConfig> = {
  collection: {
    title: 'Registro de Coleta',
    notesLabel: 'Observações',
    notesPlaceholder: 'Detalhes adicionais da coleta...',
    saveLabel: 'Salvar Coleta',
  },
  diary: {
    title: 'Registro de Diário',
    notesLabel: 'Anotação',
    notesPlaceholder: 'Descreva o que foi observado em campo...',
    saveLabel: 'Salvar Diário',
  },
};

const FAMILY_OPTIONS = ['Acanthaceae', 'Asteraceae', 'Bromeliaceae', 'Fabaceae', 'Myrtaceae', 'Orchidaceae', 'Rubiaceae'];

export function Formulario({ expedicaoId, mode, latitude, longitude }: FormularioProps) {
  const navigation = useNavigation();
  const config = MODE_CONFIG[mode];
  const isCollection = mode === 'collection';

  const [agora] = useState(() => new Date());
  const dataHora = `${agora.toLocaleDateString('pt-BR')} ${agora.toLocaleTimeString('pt-BR')}`;

  const [family, setFamily] = useState<string | null>(null);
  const [isFamilyListVisible, setIsFamilyListVisible] = useState(false);
  const [scientificName, setScientificName] = useState('');
  const [notes, setNotes] = useState('');

  const multimidia = useMultimidia();

  // Hooks da API
  const { trigger: registrar, loading: isSaving } = useRegistrarEvento(expedicaoId);
  const [saveError, setSaveError] = useState<string | null>(null);
  const saveDisabled = !expedicaoId || isSaving || multimidia.busy;

  async function handleSave() {
    if (saveDisabled) return;
    setSaveError(null);

    const base = { capturado_em: agora.toISOString(), latitude, longitude, observacoes: notes.trim() || null };
    const eventoPayload: CriarEventoPayload = isCollection
      ? { ...base, tipo: 'COLETA', coleta: { familia: family, nome_cientifico: scientificName.trim() || null } }
      : { ...base, tipo: 'DIARIO' };

    const evidencias = multimidia.pendentes.map(p => p.payload);

    try {
      await registrar(eventoPayload, evidencias);
      Alert.alert('Sucesso', isCollection ? 'Coleta salva!' : 'Diário salvo!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      setSaveError(getUserFacingHttpError(error, 'Erro ao salvar o registro.'));
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
            {isCollection && (
              <>
                <Text style={styles.labelFirst}>Família</Text>
                <TouchableOpacity
                  style={styles.selectInput}
                  onPress={() => setIsFamilyListVisible(v => !v)}
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
                        onPress={() => { setFamily(option); setIsFamilyListVisible(false); }}
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
              </>
            )}

            <Text style={isCollection ? styles.label : styles.labelFirst}>{config.notesLabel}</Text>
            <TextInput
              style={styles.textArea}
              value={notes}
              onChangeText={setNotes}
              placeholder={config.notesPlaceholder}
              placeholderTextColor={colors.placeholder}
              multiline
              numberOfLines={5}
            />

            <Text style={styles.label}>Multimídia</Text>

            <Multimidia state={multimidia} disabled={isSaving} />

            {saveError ? <Text style={styles.mediaError}>{saveError}</Text> : null}
          </View>
        </ScrollView>

        <TouchableOpacity
          style={[styles.saveButton, saveDisabled && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={saveDisabled}
        >
          {isSaving ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Check size={18} color="#FFFFFF" />
          )}
          <Text style={styles.saveButtonText}>
            {isSaving ? 'Salvando...' : config.saveLabel}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}