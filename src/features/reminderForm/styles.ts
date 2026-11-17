import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

// Só o que o lembrete tem a mais; o resto vem de evidenceForm/styles.
export const reminderStyles = StyleSheet.create({
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
    marginBottom: 8,
  },
  labelInline: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  localInput: {
    minHeight: 72,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderAlt,
  },
  secondaryButtonText: {
    color: colors.accent,
    fontSize: 12,
  },
  hint: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 6,
  },
});
