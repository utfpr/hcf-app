import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { TextInputField } from '../../component/form/TextInputField';
import { colors } from '../../theme/colors';

export interface FormularioProps {
  latitude: number;
  longitude: number;
}

export function Formulario({ latitude, longitude }: FormularioProps) {
  const dataHora = new Date().toLocaleString('pt-BR');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* header */}
      <View style={styles.header}>
        <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cadastro de Evidência</Text>
        <View style={styles.backIcon} />
      </View>

      {/* localização e data/hora */}
      <View style={styles.metaRow}>
        <Text style={styles.metaText}>
          {latitude.toFixed(4)}, {longitude.toFixed(4)}
        </Text>
        <Text style={styles.metaText}>{dataHora}</Text>
      </View>

      <View style={styles.content}>

        {/* campo em branco pra digitar */}
        <TextInputField
          label="Observações"
          style={styles.textArea}
          placeholder="Detalhes adicionais da evidência..."
          placeholderTextColor={colors.placeholder}
          multiline
          numberOfLines={5}
        />

        {/* foto e audio */}
        <Text style={styles.label}>Multimídia</Text>
        <View style={styles.mediaRow}>
          <TouchableOpacity style={styles.mediaButton}>
            <Text style={styles.mediaButtonText}>Foto</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.mediaButton}>
            <Text style={styles.mediaButtonText}>Áudio</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* botão de salvar */}
      <TouchableOpacity style={styles.saveButton}>
        <Text style={styles.saveButtonText}>Salvar Evidência</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backIcon: {
    color: colors.textPrimary,
    fontSize: 20,
    width: 24,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 16,
  },
  metaText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: 8,
    marginTop: 16,
  },
  textArea: {
    backgroundColor: colors.inputBackground,
    borderRadius: 10,
    padding: 14,
    minHeight: 110,
    fontSize: 14,
    color: colors.inputText,
    textAlignVertical: 'top',
  },
  mediaRow: {
    flexDirection: 'row',
    gap: 12,
  },
  mediaButton: {
    flex: 1,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  mediaButtonText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: colors.accent,
    marginHorizontal: 16,
    marginBottom: 20,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});