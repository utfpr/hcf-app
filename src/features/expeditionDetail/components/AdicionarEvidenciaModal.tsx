import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Check, X } from 'lucide-react-native'

import { Multimidia } from '@/features/evento/components/Multimidia'
import { useAdicionarEvidencias } from '@/features/evento/hooks/useAdicionarEvidencias'
import { useMultimidia } from '@/features/evento/hooks/useMultimidia'
import type { RegistroExpedicao } from '@/features/evento/types'
import { getUserFacingHttpError } from '@/libraries/http/httpError'
import { colors } from '@/theme/colors'

interface AdicionarEvidenciaModalProps {
  registro: RegistroExpedicao | null
  expedicaoId: number
  onClose: () => void
}

export function AdicionarEvidenciaModal({ registro, expedicaoId, onClose }: AdicionarEvidenciaModalProps) {
  return (
    <Modal visible={!!registro} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {/* key remonta o conteúdo a cada abertura, zerando a lista de pendentes */}
        {registro ? (
          <Conteudo key={registro.id} registro={registro} expedicaoId={expedicaoId} onClose={onClose} />
        ) : null}
      </SafeAreaView>
    </Modal>
  )
}

interface ConteudoProps {
  registro: RegistroExpedicao
  expedicaoId: number
  onClose: () => void
}

function Conteudo({ registro, expedicaoId, onClose }: ConteudoProps) {
  const multimidia = useMultimidia()
  const { pendentes, setPendentes, setError } = multimidia

  const { trigger: adicionar, loading: isSaving } = useAdicionarEvidencias(expedicaoId)
  const saveDisabled = pendentes.length === 0 || isSaving || multimidia.busy

  async function handleSave() {
    if (saveDisabled) return
    setError(null)

    const lote = pendentes
    let enviadas = 0
    try {
      await adicionar(
        registro.id,
        lote.map(p => p.payload),
        indice => {
          enviadas += 1
          setPendentes(prev => prev.filter(p => p.id !== lote[indice].id))
        },
      )
    } catch (e) {
      const mensagem = getUserFacingHttpError(e, 'Não foi possível salvar as evidências. Tente novamente.')
      setError(enviadas > 0 ? `${mensagem} Parte das evidências já foi enviada; as restantes continuam na lista.` : mensagem)
      return
    }
    onClose()
  }

  const titulo = registro.tipo === 'COLETA'
    ? registro.coleta?.nome_cientifico ?? 'Coleta'
    : 'Diário'

  return (
    <>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Adicionar evidência</Text>
          <Text style={styles.subtitle} numberOfLines={1}>{titulo}</Text>
        </View>
        <TouchableOpacity onPress={onClose} disabled={isSaving} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <X size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Multimidia state={multimidia} disabled={isSaving} />

        {pendentes.length === 0 ? (
          <Text style={styles.hint}>Tire uma foto, grave um vídeo ou áudio, ou faça upload de arquivos. Você pode adicionar mais de um antes de salvar.</Text>
        ) : null}
      </ScrollView>

      <TouchableOpacity
        style={[styles.saveButton, saveDisabled && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={saveDisabled}
      >
        {isSaving ? <ActivityIndicator color={colors.onAccent} /> : <Check size={18} color={colors.onAccent} />}
        <Text style={styles.saveButtonText}>
          {isSaving ? 'Salvando...' : `Salvar evidências${pendentes.length ? ` (${pendentes.length})` : ''}`}
        </Text>
      </TouchableOpacity>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderAlt,
  },
  headerText: { flex: 1 },
  title: { color: colors.textPrimary, fontSize: 17, fontWeight: '600' },
  subtitle: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
  content: { padding: 16, flexGrow: 1 },
  hint: { color: colors.textSecondary, fontSize: 13, textAlign: 'center', marginTop: 24 },
  saveButton: {
    backgroundColor: colors.accent,
    marginHorizontal: 16,
    marginBottom: 20,
    paddingVertical: 15,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  saveButtonDisabled: { opacity: 0.5 },
  saveButtonText: { color: colors.onAccent, fontSize: 15, fontWeight: '500' },
})