import useSWR from 'swr'

export interface UseQueryReturn<F extends (...args: any) => any> {
  data?: Awaited<ReturnType<F>> | undefined
  error?: Error | undefined
  loading: boolean
  validating: boolean
}

export interface UseQueryOptions {

}

export function useQuery<Fetcher extends(...args: any) => any>(
  fetcher: Fetcher,
  deps: readonly any[] | null,
  options?: UseQueryOptions
): UseQueryReturn<Fetcher> {
  const {
    data, error, isLoading, isValidating,
  } = useSWR<Awaited<ReturnType<Fetcher>>, Error>(deps, fetcher, options)

  return {
    data,
    error,
    loading: isLoading,
    validating: isValidating
  }
}
