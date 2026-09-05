import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export function Login() {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/images/logoherbario.png')}
          style={styles.logo}
        />
      </View>

      <Text style={styles.title}>Diário de Campo</Text>

      <View style={styles.form}>
        <Text style={styles.label}>E-mail</Text>

        <TextInput
          style={styles.input}
          placeholder="pesquisador@utfpr.edu.br"
          placeholderTextColor="#7A7A7A"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Senha</Text>

        <TextInput
          style={styles.input}
          placeholder="Digite sua senha"
          placeholderTextColor="#7A7A7A"
          secureTextEntry
        />

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>

        <Text style={styles.offlineText}>
          Modo offline — os dados serão sincronizados quando houver conexão
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#032a1f',
    paddingHorizontal: 24,
  },

  logoContainer: {
    width: 122,
    height: 122,
    borderRadius: 61,
    backgroundColor: '#E8F1ED',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 70,
    overflow: 'hidden',
  },

  logo: {
    width: 108,
    height: 108,
    resizeMode: 'contain',
    borderRadius: 54,
  },

  title: {
    color: '#94A59E',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 35,
  },

  form: {
    width: '100%',
  },

  label: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 8,
    marginTop: 12,
  },

  input: {
    backgroundColor: '#F2F2F2',
    borderRadius: 6,
    height: 48,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#222222',
  },

  button: {
    backgroundColor: '#13b236',
    borderRadius: 6,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  offlineText: {
    color: '#AAB7B1',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 18,
    paddingHorizontal: 20,
  },
});