import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'space-between',
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
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 10,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  metaText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
    flexGrow: 1,
  },
  // Espaço entre os cards do formulário
  cards: {
    gap: 12,
  },
  formCard: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderAlt,
    borderRadius: 14,
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 12,
  },
  cardTitulo: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  cardDica: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderAlt,
    backgroundColor: colors.inputBackground,
  },
  chipSelecionado: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  chipTexto: {
    color: colors.textPrimary,
    fontSize: 14,
  },
  chipTextoSelecionado: {
    color: colors.onAccent,
    fontWeight: '600',
  },
  label: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: 8,
    marginTop: 16,
  },
  labelFirst: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderRadius: 10,
    paddingHorizontal: 12,
    minHeight: 48,
    fontSize: 14,
    color: colors.inputText,
  },
  selectInput: {
    backgroundColor: colors.inputBackground,
    borderRadius: 10,
    paddingHorizontal: 12,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectPlaceholder: {
    color: colors.placeholder,
    fontSize: 14,
  },
  selectValue: {
    color: colors.inputText,
    fontSize: 14,
  },
  optionsList: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 10,
    marginTop: 6,
    overflow: 'hidden',
  },
  option: {
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderAlt,
  },
  optionText: {
    color: colors.textPrimary,
    fontSize: 14,
  },
  emptyOption: {
    color: colors.textSecondary,
    fontSize: 13,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  textArea: {
    backgroundColor: colors.inputBackground,
    borderRadius: 10,
    padding: 12,
    minHeight: 110,
    fontSize: 14,
    color: colors.inputText,
    textAlignVertical: 'top',
  },
  diaryTextArea: {
    minHeight: 230,
  },
  localOptionCidade: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  fieldHint: {
    color: colors.bell,
    fontSize: 12,
    marginTop: 6,
  },
  mediaError: {
    color: colors.danger,
    fontSize: 12,
    marginBottom: 12,
  },
});
