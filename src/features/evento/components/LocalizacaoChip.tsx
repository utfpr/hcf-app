import { ActivityIndicator, Text, TouchableOpacity } from 'react-native'
import { MapPin, RefreshCw } from 'lucide-react-native'

import { styles } from '@/features/evidenceForm/styles'
import { formatarCoordenadas, type useLocalizacao } from '@/libraries/location/useLocalizacao'
import { colors } from '@/theme/colors'

type Localizacao = ReturnType<typeof useLocalizacao>

/** Chip da posição nos formulários: toca para ler o GPS de novo */
export function LocalizacaoChip({ localizacao }: { localizacao: Localizacao }) {
  const { coords, carregando, erro, atualizar } = localizacao

  let texto = 'Obtendo localização…'
  if (!carregando && coords) {
    texto = formatarCoordenadas(coords) + (coords.precisao ? ` (±${Math.round(coords.precisao)} m)` : '')
  } else if (!carregando) {
    texto = erro ? 'Sem GPS — toque para tentar' : 'Toque para obter a localização'
  }

  return (
    <TouchableOpacity style={styles.metaChip} onPress={atualizar} disabled={carregando}>
      {carregando
        ? <ActivityIndicator size="small" color={colors.textSecondary} />
        : <MapPin size={14} color={coords ? colors.textSecondary : colors.danger} />}
      <Text style={styles.metaText}>{texto}</Text>
      {!carregando ? <RefreshCw size={12} color={colors.textSecondary} /> : null}
    </TouchableOpacity>
  )
}
