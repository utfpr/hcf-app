import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigation, usePreventRemove } from '@react-navigation/native'

import { useFeedback } from '@/components/feedback/FeedbackContext'

interface OpcoesConfirmarSaida {
  // Há algo preenchido ou anexado que ainda não foi salvo
  pendente: boolean
  anexos: number
}

/** Texto do aviso ao sair: o rascunho guarda tudo, mas só o "Salvar" põe na fila de envio */
export function mensagemSaida(anexos: number): string {
  if (anexos === 0) {
    return 'O que você preencheu fica guardado neste aparelho como rascunho e volta quando você abrir o formulário de novo.'
  }
  const quem = anexos === 1 ? 'O anexo' : `Os ${anexos} anexos`
  return `${quem} e o que você preencheu ficam guardados neste aparelho como rascunho. `
    + 'Eles só entram na fila de envio depois de salvar.'
}

/**
 * Pergunta antes de sair de um formulário com algo não salvo (botão voltar, gesto
 * ou voltar do Android), para quem voltou sem querer não achar que perdeu os anexos.
 * `sair` é a saída depois de salvar, sem perguntar.
 */
export function useConfirmarSaida({ pendente, anexos }: OpcoesConfirmarSaida) {
  const navigation = useNavigation()
  const { dialogo } = useFeedback()
  const [liberado, setLiberado] = useState(false)
  const depoisDeLiberar = useRef<(() => void) | null>(null)

  usePreventRemove(pendente && !liberado, ({ data }) => {
    dialogo({
      titulo: 'Sair sem salvar?',
      mensagem: mensagemSaida(anexos),
      acoes: [
        { texto: 'Sair', estilo: 'destrutivo', aoPressionar: () => navigation.dispatch(data.action) },
        { texto: 'Continuar editando', estilo: 'cancelar' },
      ],
    })
  })

  // A navegação só pode sair depois que o bloqueio foi desligado (no render seguinte)
  useEffect(() => {
    if (!liberado || !depoisDeLiberar.current) return
    const acao = depoisDeLiberar.current
    depoisDeLiberar.current = null
    acao()
  }, [liberado])

  const sair = useCallback((acao: () => void) => {
    depoisDeLiberar.current = acao
    setLiberado(true)
  }, [])

  return { sair }
}
