import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Animated,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { CircleAlert, CircleCheck, Info } from 'lucide-react-native'

import { colors } from '@/theme/colors'

import {
  type AcaoDialogo,
  type DialogoInput,
  FeedbackContext,
  type FeedbackContextValue,
  type TipoToast,
  type ToastInput,
} from './FeedbackContext'

// Erro fica mais tempo: costuma ter uma instrução para ler
const DURACAO_MS: Record<TipoToast, number> = { sucesso: 3500, info: 3500, erro: 5000 }

const COR: Record<TipoToast, string> = {
  sucesso: colors.accent,
  info: colors.diary,
  erro: colors.danger,
}

const ICONE: Record<TipoToast, typeof Info> = {
  sucesso: CircleCheck,
  info: Info,
  erro: CircleAlert,
}

interface ToastAtual extends ToastInput {
  // Muda a cada aviso, mesmo com o mesmo texto: reinicia o tempo e a animação
  id: number
}

/**
 * Avisos e perguntas no visual do app, no lugar dos diálogos nativos do
 * Android/iOS (Alert.alert). Fica acima de Auth e Offline, que também avisam.
 */
export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [toastAtual, setToastAtual] = useState<ToastAtual | null>(null)
  const [dialogoAtual, setDialogoAtual] = useState<DialogoInput | null>(null)
  const proximoId = useRef(1)

  const toast = useCallback((input: ToastInput) => {
    setToastAtual({ ...input, id: proximoId.current++ })
  }, [])

  const dialogo = useCallback((input: DialogoInput) => {
    setDialogoAtual(input)
  }, [])

  const value = useMemo<FeedbackContextValue>(() => ({ toast, dialogo }), [toast, dialogo])

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      {toastAtual ? <Toast key={toastAtual.id} toast={toastAtual} aoFechar={() => setToastAtual(null)} /> : null}
      <Dialogo dialogo={dialogoAtual} aoFechar={() => setDialogoAtual(null)} />
    </FeedbackContext.Provider>
  )
}

function Toast({ toast, aoFechar }: { toast: ToastAtual; aoFechar: () => void }) {
  const insets = useSafeAreaInsets()
  const tipo = toast.tipo ?? 'info'
  const Icone = ICONE[tipo]
  const visibilidade = useRef(new Animated.Value(0)).current

  const fechar = useCallback(() => {
    Animated.timing(visibilidade, { toValue: 0, duration: 180, useNativeDriver: true }).start(aoFechar)
  }, [visibilidade, aoFechar])

  useEffect(() => {
    Animated.timing(visibilidade, { toValue: 1, duration: 200, useNativeDriver: true }).start()
    const timer = setTimeout(fechar, DURACAO_MS[tipo])
    return () => clearTimeout(timer)
  }, [visibilidade, fechar, tipo])

  const translateY = visibilidade.interpolate({ inputRange: [0, 1], outputRange: [-16, 0] })

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[styles.toastArea, { top: insets.top + 8, opacity: visibilidade, transform: [{ translateY }] }]}
    >
      <Pressable
        style={[styles.toast, { borderLeftColor: COR[tipo] }]}
        onPress={fechar}
        accessibilityRole="alert"
        accessibilityLabel={toast.mensagem ? `${toast.titulo}. ${toast.mensagem}` : toast.titulo}
        accessibilityHint="Toque para fechar"
      >
        <Icone size={20} color={COR[tipo]} />
        <View style={styles.toastTextos}>
          <Text style={styles.toastTitulo}>{toast.titulo}</Text>
          {toast.mensagem ? <Text style={styles.toastMensagem}>{toast.mensagem}</Text> : null}
        </View>
      </Pressable>
    </Animated.View>
  )
}

function Dialogo({ dialogo, aoFechar }: { dialogo: DialogoInput | null; aoFechar: () => void }) {
  const cancelar = dialogo?.acoes.find(acao => acao.estilo === 'cancelar')
  const pendente = useRef<AcaoDialogo | undefined>(undefined)

  function executarPendente() {
    const acao = pendente.current
    pendente.current = undefined
    acao?.aoPressionar?.()
  }

  // No iOS, abrir outra tela (ex.: a câmera) com o Modal ainda fechando falha:
  // a ação espera o onDismiss. O Android não tem onDismiss e não tem o problema.
  function escolher(acao: AcaoDialogo | undefined) {
    pendente.current = acao
    aoFechar()
    if (Platform.OS !== 'ios') executarPendente()
  }

  return (
    <Modal
      visible={dialogo !== null}
      transparent
      statusBarTranslucent
      animationType="fade"
      onDismiss={executarPendente}
      // Voltar do Android: só fecha quando há uma opção de cancelar
      onRequestClose={() => { if (cancelar) escolher(cancelar) }}
    >
      <View style={styles.fundo}>
        {dialogo ? (
          <View style={styles.dialogo} accessibilityRole="alert">
            <Text style={styles.dialogoTitulo}>{dialogo.titulo}</Text>
            {dialogo.mensagem ? <Text style={styles.dialogoMensagem}>{dialogo.mensagem}</Text> : null}

            <View style={styles.acoes}>
              {dialogo.acoes.map(acao => (
                <TouchableOpacity
                  key={acao.texto}
                  style={[
                    styles.acao,
                    acao.estilo === 'cancelar' && styles.acaoCancelar,
                    acao.estilo === 'destrutivo' && styles.acaoDestrutiva,
                  ]}
                  onPress={() => escolher(acao)}
                  accessibilityRole="button"
                >
                  <Text
                    style={[
                      styles.acaoTexto,
                      acao.estilo === 'cancelar' && styles.acaoTextoCancelar,
                      acao.estilo === 'destrutivo' && styles.acaoTextoDestrutiva,
                    ]}
                  >
                    {acao.texto}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : null}
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  toastArea: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 1000,
    elevation: 10,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: colors.cardBackground,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderAlt,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  toastTextos: {
    flex: 1,
    gap: 2,
  },
  toastTitulo: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  toastMensagem: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  fundo: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  dialogo: {
    width: '100%',
    maxWidth: 360,
    padding: 20,
    backgroundColor: colors.cardBackground,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderAlt,
  },
  dialogoTitulo: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '600',
  },
  dialogoMensagem: {
    marginTop: 8,
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  acoes: {
    marginTop: 20,
    gap: 8,
  },
  acao: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: colors.accent,
  },
  acaoCancelar: {
    backgroundColor: colors.surfaceAlt,
  },
  acaoDestrutiva: {
    backgroundColor: 'rgba(252, 165, 165, 0.15)',
  },
  acaoTexto: {
    color: colors.onAccent,
    fontSize: 15,
    fontWeight: '500',
  },
  acaoTextoCancelar: {
    color: colors.textPrimary,
  },
  acaoTextoDestrutiva: {
    color: colors.danger,
  },
})
