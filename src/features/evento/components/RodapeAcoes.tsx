import { useEffect, useRef } from 'react'
import { ActivityIndicator, Animated, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Check, Paperclip } from 'lucide-react-native'

import { useTeclado } from '@/hooks/useTeclado'
import { colors } from '@/theme/colors'

import type { MultimidiaState } from '../hooks/useMultimidia'

import { BotoesMidia, ListaAnexos, ValidadorVideos } from './Multimidia'

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

function textoFila(quantidade: number): string {
  return `${quantidade} ${quantidade === 1 ? 'anexo' : 'anexos'} na fila · enviados ao sincronizar`
}

/**
 * Rodapé fixo dos formulários: a fila de anexos sempre visível, os botões de
 * mídia e o salvar ficam sempre à mão, sem rolar até o começo do formulário.
 * Some com o teclado aberto, a não ser durante uma gravação (o tempo continua à vista);
 * nesse caso a lista de anexos fica escondida e só a contagem aparece.
 */
export function RodapeAcoes({
  multimidia, apenasFotos = false, saveLabel, salvando, saveDisabled, onSalvar, erro,
}: RodapeAcoesProps) {
  const teclado = useTeclado()
  const quantidade = multimidia.pendentes.length

  // A faixa pisca uma vez quando entra um anexo, para o olho achar onde ele foi parar
  const destaque = useRef(new Animated.Value(0)).current
  const anterior = useRef(quantidade)
  useEffect(() => {
    if (quantidade > anterior.current) {
      Animated.sequence([
        Animated.timing(destaque, { toValue: 1, duration: 150, useNativeDriver: false }),
        Animated.timing(destaque, { toValue: 0, duration: 450, useNativeDriver: false }),
      ]).start()
    }
    anterior.current = quantidade
  }, [quantidade, destaque])

  const fundoFaixa = destaque.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(242, 201, 76, 0.12)', 'rgba(242, 201, 76, 0.45)'],
  })

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
          {quantidade > 0 ? (
            <View style={styles.filaContainer}>
              <Animated.View style={[styles.faixa, { backgroundColor: fundoFaixa }]}>
                <Paperclip size={14} color={colors.bell} />
                <Text style={styles.faixaTexto} numberOfLines={1}>{textoFila(quantidade)}</Text>
              </Animated.View>

              {/* Com o teclado aberto (só acontece gravando) a lista cobriria o campo digitado */}
              {teclado.visivel ? null : (
                <ScrollView style={styles.listaAnexos} nestedScrollEnabled>
                  <ListaAnexos state={multimidia} disabled={salvando} />
                </ScrollView>
              )}
            </View>
          ) : null}

          {mensagemErro ? <Text style={styles.erro}>{mensagemErro}</Text> : null}

          <BotoesMidia state={multimidia} disabled={salvando} apenasFotos={apenasFotos} compacto />

          <TouchableOpacity
            style={[styles.salvar, saveDisabled && styles.salvarDesabilitado]}
            onPress={onSalvar}
            disabled={saveDisabled}
          >
            {salvando ? <ActivityIndicator color={colors.onAccent} size="small" /> : <Check size={18} color={colors.onAccent} />}
            <Text style={styles.salvarTexto}>{salvando ? 'Salvando...' : saveLabel}</Text>
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
  filaContainer: {
    marginBottom: 8,
  },
  faixa: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  faixaTexto: { flex: 1, color: colors.bell, fontSize: 13, fontWeight: '600' },
  listaAnexos: {
    maxHeight: 165,
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
