import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    height: 52,
    paddingHorizontal: 14,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  input: {
    flex: 1,
    color: '#111827',
    fontSize: 15,
    paddingVertical: 0,
  },
  eyeButton: {
    paddingLeft: 8,
  },
  eyeIcon: {
    fontSize: 18,
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 12,
    marginTop: 4,
  },
});
