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

  const data = error.response?.data as { mensagem?: string } | undefined
  return data?.mensagem
}
