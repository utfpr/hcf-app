import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  button: {
    backgroundColor: '#00B14F',
    borderRadius: 8,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#00B14F',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  textSecondary: {
    color: '#00B14F',
  },
});
