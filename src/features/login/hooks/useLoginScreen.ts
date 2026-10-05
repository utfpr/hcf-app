import { useCallback, useState } from 'react'
import { z } from 'zod'

import { useAuth } from '@/contexts/Auth/useAuth'
import { useContainer } from '@/contexts/Container/useContainer'
import { useMutation } from '@/hooks/query/useMutation'
import {
  getHttpErrorCode,
  getHttpErrorMessage,
  isNetworkError,
} from '@/libraries/http/httpError'

import type { LoginResponse } from '../types'

// Código de erro da API (HTTP 400) para e-mail ou senha inválidos
const INVALID_CREDENTIALS_CODE = 100

// algo@dominio.ext — sem espaços, um único @ e extensão com 2+ caracteres
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Informe seu e-mail')
    .regex(EMAIL_REGEX, 'Formato de e-mail inválido (ex.: nome@utfpr.edu.br)'),
  senha: z
    .string()
    .min(1, 'Informe sua senha')
    .min(6, 'Senha deve ter pelo menos 6 caracteres'),
})

export type LoginFormValues = z.infer<typeof loginSchema>

export function useLoginScreen() {
  const { httpClient } = useContainer()
  const { logIn } = useAuth()
  const [error, setError] = useState<string | undefined>()

  const { trigger: login, loading } = useMutation(
    (credentials: LoginFormValues) => httpClient.post<LoginResponse>('/login', credentials),
    ['/login'],
  )

  const defaultValues: LoginFormValues = {
    email: '',
    senha: '',
  }

  const submit = useCallback(async (data: LoginFormValues) => {
    setError(undefined)

    try {
      const response = await login(data)
      if (!response) {
        return
      }

      logIn({ token: response.data.token, user: response.data.usuario })
    } catch (err) {
      if (isNetworkError(err)) {
        setError('Verifique sua internet e tente novamente.')
        return
      }

      if (getHttpErrorCode(err) === INVALID_CREDENTIALS_CODE) {
        setError('E-mail ou senha incorretos.')
        return
      }

      setError(getHttpErrorMessage(err) ?? 'Ocorreu um erro. Tente novamente.')
    }
  }, [login, logIn])

  return {
    schema: loginSchema,
    defaultValues,
    submit,
    loading,
    error,
  }
}
