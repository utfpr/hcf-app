import { createContext, useContext } from 'react'

export type TipoToast = 'sucesso' | 'erro' | 'info'

export interface ToastInput {
  tipo?: TipoToast
  titulo: string
  mensagem?: string
}

export interface AcaoDialogo {
  texto: string
  // 'cancelar' também é o que o botão "voltar" do Android faz
  estilo?: 'padrao' | 'cancelar' | 'destrutivo'
  aoPressionar?: () => void
}

export interface DialogoInput {
  titulo: string
  mensagem?: string
  acoes: AcaoDialogo[]
}

export interface FeedbackContextValue {
  /** Aviso no topo que some sozinho; um novo substitui o anterior */
  toast(input: ToastInput): void
  /** Pergunta com botões, no lugar do Alert.alert com opções */
  dialogo(input: DialogoInput): void
}

export const FeedbackContext = createContext<FeedbackContextValue | undefined>(undefined)

export function useFeedback(): FeedbackContextValue {
  const context = useContext(FeedbackContext)
  if (!context) throw new Error('useFeedback precisa estar dentro de <FeedbackProvider>')
  return context
}
