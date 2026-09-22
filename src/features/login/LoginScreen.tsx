import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native'

import { Button } from '@/components/forms/Button'
import { Form, FormField, useFormSubmit } from '@/components/forms/Form'
import { PasswordInput } from '@/components/forms/PasswordInput'
import { TextInput } from '@/components/forms/TextInput'
import { useAuth } from '@/contexts/Auth/useAuth'
import { TipoUsuario } from '@/types/usuario'
import { colors } from '@/theme/colors'

import logo from '@/assets/images/logo-hcf.png'
import { LoginFormValues, useLoginScreen } from './hooks/useLoginScreen'

export function LoginScreen() {
  const login = useLoginScreen()
  const { logIn } = useAuth() // TODO: remover - só pra testar navegação sem backend

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.logoContainer}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
          <Text style={styles.title}>Diário de Campo</Text>
        </View>

        <View style={styles.form}>
          <Form
            schema={login.schema}
            defaultValues={login.defaultValues}
            onSubmit={login.submit}>
            <FormField<LoginFormValues> name="email">
              {({ value, onChange, onBlur, error }) => (
                <TextInput
                  label="E-mail"
                  placeholder="pesquisador@utfpr.edu.br"
                  keyboardType="email-address"
                  autoComplete="email"
                  textContentType="emailAddress"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={error}
                />
              )}
            </FormField>

            <FormField<LoginFormValues> name="senha">
              {({ value, onChange, onBlur, error }) => (
                <PasswordInput
                  label="Senha"
                  placeholder="••••••••••"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={error}
                />
              )}
            </FormField>

            {login.error ? (
              <Text style={styles.requestError}>{login.error}</Text>
            ) : null}

            <View style={styles.button}>
              <LoginSubmitButton loading={login.loading} />
            </View>
          </Form>

          {/* BOTÃO TEMPORÁRIO — remover */}
          <View style={styles.button}>
            <Button
              title="Entrar (mock - dev)"
              onPress={() => logIn({
                token: 'fake-token',
                user: {
                  id: 1,
                  nome: 'Usuário Dev',
                  email: 'dev@utfpr.edu.br',
                  tipo_usuario_id: TipoUsuario.Operador,
                },
              })}
            />
          </View>
        </View>

        <Text style={styles.offlineNote}>
          Modo offline — dados serão sincronizados quando houver conexão.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

function LoginSubmitButton({ loading }: { loading: boolean }) {
  const submit = useFormSubmit()

  return (
    <Button title="Entrar" loading={loading} onPress={submit} />
  )
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
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
    backgroundColor: colors.onAccent,
  },
  title: {
    color: colors.textPrimary,
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
  requestError: {
    color: colors.danger,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 12,
  },
  offlineNote: {
    color: colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 32,
    lineHeight: 18,
    paddingHorizontal: 16,
  },
})