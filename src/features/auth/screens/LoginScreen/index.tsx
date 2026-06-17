import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  View,
} from 'react-native';
import { z } from 'zod';

import { AppButton } from '@/components/common/AppButton';
import { AppInput } from '@/components/common/AppInput';
import { authService } from '@/features/auth/services/auth.service';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { Images } from '@/assets/images';

import { styles } from './styles';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'E-mail obrigatório')
    .email('E-mail inválido'),
  senha: z
    .string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginScreen() {
  const { login } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', senha: '' },
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      const response = await authService.login(data);
      login(response.token, response.usuario);
    } catch (err) {
      const axiosErr = err as AxiosError<{ mensagem?: string }>;

      if (!axiosErr.response) {
        Alert.alert(
          'Sem conexão',
          'Verifique sua internet e tente novamente.',
        );
        return;
      }

      if (axiosErr.response.status === 401) {
        Alert.alert('Acesso negado', 'E-mail ou senha incorretos.');
        return;
      }

      Alert.alert(
        'Erro',
        axiosErr.response.data?.mensagem ?? 'Ocorreu um erro. Tente novamente.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="light-content" backgroundColor="#082113" />
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.logoContainer}>
          <Image source={Images.logoHcf} style={styles.logo} resizeMode="contain" />
          <Text style={styles.title}>Diário de Campo</Text>
        </View>

        <View style={styles.form}>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value, onBlur } }) => (
              <AppInput
                label="E-mail"
                placeholder="pesquisador@utfpr.edu.br"
                keyboardType="email-address"
                autoComplete="email"
                textContentType="emailAddress"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.email?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="senha"
            render={({ field: { onChange, value, onBlur } }) => (
              <AppInput
                label="Senha"
                placeholder="••••••••••"
                secureTextEntry
                showPasswordToggle
                textContentType="password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.senha?.message}
              />
            )}
          />

          <AppButton
            title="Entrar"
            loading={loading}
            onPress={handleSubmit(onSubmit)}
            style={styles.button}
          />
        </View>

        <Text style={styles.offlineNote}>
          Modo offline — dados serão sincronizados quando houver conexão.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
