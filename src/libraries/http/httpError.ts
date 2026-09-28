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

interface ApiErrorBody {
  error?: {
    code?: number
    message?: string
  }
}

function getApiError(error: unknown) {
  if (!axios.isAxiosError(error)) {
    return undefined
  }

  const data = error.response?.data as ApiErrorBody | undefined
  return data?.error
}

export function getHttpErrorCode(error: unknown): number | undefined {
  return getApiError(error)?.code
}

export function getHttpErrorMessage(error: unknown): string | undefined {
  return getApiError(error)?.message
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
