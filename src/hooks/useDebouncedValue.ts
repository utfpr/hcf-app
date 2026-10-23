import { useEffect, useState } from 'react'

/** Devolve o valor só depois de ele ficar `delayMs` sem mudar (ex.: busca enquanto digita) */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timeout)
  }, [value, delayMs])

  return debounced
}
