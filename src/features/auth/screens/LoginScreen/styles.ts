import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: '#082113',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 48,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFFFFF',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '400',
    marginTop: 14,
    letterSpacing: 0.2,
  },
  form: {
    width: '100%',
  },
  button: {
    marginTop: 8,
  },
  offlineNote: {
    color: 'rgba(255, 255, 255, 0.55)',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 32,
    lineHeight: 18,
    paddingHorizontal: 16,
  },
});
