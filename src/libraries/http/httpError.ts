import axios from 'axios'

export function isNetworkError(error: unknown): boolean {
  return axios.isAxiosError(error) && !error.response
}

export function getHttpStatus(error: unknown): number | undefined {
  if (!axios.isAxiosError(error)) {
    return undefined
  }

  return error.response?.status
}

export function getHttpErrorMessage(error: unknown): string | undefined {
  if (!axios.isAxiosError(error)) {
    return undefined
  }

  const data = error.response?.data as {
    mensagem?: string
    message?: string
    error?: { message?: string }
  } | undefined

  return data?.mensagem ?? data?.message ?? data?.error?.message
}

export function getUserFacingHttpError(
  error: unknown,
  fallback = 'Não foi possível concluir a solicitação. Tente novamente.',
): string {
  if (isNetworkError(error)) {
    return 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.'
  }

  return getHttpErrorMessage(error) ?? fallback
}
