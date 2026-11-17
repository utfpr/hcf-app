import { ActivityIndicator, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Check } from 'lucide-react-native'

import { useTeclado } from '@/hooks/useTeclado'
import { colors } from '@/theme/colors'

import type { MultimidiaState } from '../hooks/useMultimidia'

import { BotoesMidia, ValidadorVideos } from './Multimidia'

interface RodapeAcoesProps {
  multimidia: MultimidiaState
  // Lembrete: só Foto e Galeria
  apenasFotos?: boolean
  saveLabel: string
  salvando: boolean
  saveDisabled: boolean
  onSalvar: () => void
  erro?: string | null
}

/**
 * Rodapé fixo dos formulários: os botões de mídia e o salvar ficam sempre à mão,
 * sem rolar até o começo do formulário. Os anexos ficam no card "Mídias associadas",
 * no fim do formulário, para o rodapé não cobrir os campos.
 * Some com o teclado aberto, a não ser durante uma gravação (o tempo continua à vista).
 */
export function RodapeAcoes({
  multimidia, apenasFotos = false, saveLabel, salvando, saveDisabled, onSalvar, erro,
}: RodapeAcoesProps) {
  const teclado = useTeclado()
  // A lista fica no fim do formulário; sem isto, o salvar travado não teria explicação à vista
  const verificandoVideo = multimidia.pendentes.some(item => item.validandoDuracao)
  const ocupado = salvando || verificandoVideo
  const textoSalvar = salvando ? 'Salvando...' : verificandoVideo ? 'Verificando vídeo...' : saveLabel

  const visivel = !teclado.visivel || multimidia.isRecording
  // Gravando com o teclado aberto: no Android a tela encolhe sozinha (adjustResize),
  // mas no iOS o teclado cobriria o rodapé e o tempo da gravação. Sobe por cima dele.
  const acimaDoTeclado = Platform.OS === 'ios' && teclado.visivel ? { marginBottom: teclado.altura } : null
  const mensagemErro = erro ?? multimidia.error

  return (
    <>
      <ValidadorVideos state={multimidia} />

      {visivel ? (
        <View testID="rodape-acoes" style={[styles.rodape, acimaDoTeclado]}>
          {mensagemErro ? <Text style={styles.erro}>{mensagemErro}</Text> : null}

          <BotoesMidia state={multimidia} disabled={salvando} apenasFotos={apenasFotos} compacto />

          <TouchableOpacity
            style={[styles.salvar, saveDisabled && styles.salvarDesabilitado]}
            onPress={onSalvar}
            disabled={saveDisabled}
          >
            {ocupado ? <ActivityIndicator color={colors.onAccent} size="small" /> : <Check size={18} color={colors.onAccent} />}
            <Text style={styles.salvarTexto}>{textoSalvar}</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </>
  )
}

const styles = StyleSheet.create({
  rodape: {
    borderTopWidth: 1,
    borderTopColor: colors.borderAlt,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
  },
  erro: { color: colors.danger, fontSize: 12, marginBottom: 8, textAlign: 'center' },
  salvar: {
    backgroundColor: colors.accent,
    paddingVertical: 14,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  salvarDesabilitado: { opacity: 0.6 },
  salvarTexto: { color: colors.onAccent, fontSize: 15, fontWeight: '500' },
})
