import { useState } from 'react'
import {
  ActivityIndicator, Modal, Pressable, StyleSheet, Text, TextInput, View,
} from 'react-native'

import { useAuth } from '@/contexts/Auth/useAuth'
import { colors } from '@/theme/colors'

interface ReautenticarModalProps {
  visible: boolean
  onSucesso: () => void
  onCancelar: () => void
}

/** Sessão vencida com dados para enviar: só a senha, com o e-mail do usuário travado */
export function ReautenticarModal({ visible, onSucesso, onCancelar }: ReautenticarModalProps) {
  const { user, reautenticar } = useAuth()
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  function fechar() {
    setSenha('')
    setErro(null)
    onCancelar()
  }

  async function handleEntrar() {
    if (!senha || enviando) return
    setEnviando(true)
    setErro(null)
    const resultado = await reautenticar(senha)
    setEnviando(false)
    if (!resultado.ok) {
      setErro(resultado.message ?? 'Não foi possível entrar.')
      return
    }
    setSenha('')
    onSucesso()
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={fechar}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Sessão expirada</Text>
          <Text style={styles.text}>
            Digite sua senha para continuar. Os registros salvos no aparelho estão seguros e
            serão enviados assim que você entrar.
          </Text>

          <Text style={styles.label}>E-mail</Text>
          <TextInput style={[styles.input, styles.inputTravado]} value={user?.email} editable={false} />

          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={styles.input}
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
            autoFocus
            placeholder="••••••••••"
            placeholderTextColor={colors.placeholder}
            onSubmitEditing={handleEntrar}
          />

          {erro ? <Text style={styles.erro}>{erro}</Text> : null}

          <View style={styles.actions}>
            <Pressable style={styles.secondary} onPress={fechar} disabled={enviando}>
              <Text style={styles.secondaryText}>Cancelar</Text>
            </Pressable>
            <Pressable
              style={[styles.primary, (!senha || enviando) && styles.disabled]}
              onPress={handleEntrar}
              disabled={!senha || enviando}
            >
              {enviando
                ? <ActivityIndicator color={colors.onAccent} />
                : <Text style={styles.primaryText}>Entrar e sincronizar</Text>}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
  },
  title: { color: colors.textPrimary, fontSize: 18, fontWeight: '700', marginBottom: 8 },
  text: { color: colors.textSecondary, fontSize: 14, lineHeight: 20, marginBottom: 16 },
  label: { color: colors.textSecondary, fontSize: 13, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: colors.borderAlt,
    borderRadius: 10,
    color: colors.textPrimary,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  inputTravado: { opacity: 0.6 },
  erro: { color: colors.danger, fontSize: 13, marginBottom: 12 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  secondary: { paddingVertical: 12, paddingHorizontal: 16 },
  secondaryText: { color: colors.textSecondary, fontSize: 15 },
  primary: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minWidth: 150,
    alignItems: 'center',
  },
  primaryText: { color: colors.onAccent, fontSize: 15, fontWeight: '600' },
  disabled: { opacity: 0.5 },
})
