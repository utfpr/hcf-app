import { useCallback, useEffect, useRef, useState } from 'react'

import { useOffline } from './OfflineContext'

const ESPERA_MS = 500

/**
 * Rascunho do formulário salvo no aparelho enquanto o usuário digita. Se o app
 * fechar no meio (bateria, sistema), o que foi preenchido volta ao reabrir.
 *
 * - `restaurado`: o valor salvo, entregue uma vez ao abrir (null se não havia);
 * - `salvar(valor)`: grava depois de ESPERA_MS sem mudanças;
 * - `descartar()`: apaga (ao salvar o registro ou quando o usuário pede).
 */
export function useRascunho<T>(chave: string | null) {
  const { store } = useOffline()
  const [restaurado, setRestaurado] = useState<T | null>(null)
  const [pronto, setPronto] = useState(false)
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Último valor ainda não gravado (gravado na hora se a tela fechar antes da espera)
  const pendente = useRef<{ chave: string; valor: T } | null>(null)

  useEffect(() => {
    if (!chave) {
      setPronto(true)
      return
    }
    let ativo = true
    store.lerRascunho<T>(chave).then(valor => {
      if (!ativo) return
      setRestaurado(valor)
      setPronto(true)
    })
    return () => {
      ativo = false
    }
  }, [chave, store])

  const gravarPendente = useCallback(() => {
    if (temporizador.current) clearTimeout(temporizador.current)
    temporizador.current = null
    const atual = pendente.current
    pendente.current = null
    if (atual) store.gravarRascunho(atual.chave, atual.valor).catch(() => undefined)
  }, [store])

  const salvar = useCallback((valor: T) => {
    // Antes de ler o que havia salvo, não grava: apagaria o rascunho com o formulário vazio
    if (!chave || !pronto) return
    pendente.current = { chave, valor }
    if (temporizador.current) clearTimeout(temporizador.current)
    temporizador.current = setTimeout(gravarPendente, ESPERA_MS)
  }, [chave, pronto, gravarPendente])

  const descartar = useCallback(async () => {
    if (temporizador.current) clearTimeout(temporizador.current)
    temporizador.current = null
    pendente.current = null
    setRestaurado(null)
    if (chave) await store.removerRascunho(chave).catch(() => undefined)
  }, [chave, store])

  // Saiu da tela no meio da espera: grava na hora o que faltava
  useEffect(() => gravarPendente, [gravarPendente])

  return { restaurado, pronto, salvar, descartar }
}
