import React from 'react'

import { ListaAnexos } from '@/features/evento/components/Multimidia'
import type { MultimidiaState } from '@/features/evento/hooks/useMultimidia'

import { CardFicha } from './CardFicha'

interface CardMidiasAssociadasProps {
  multimidia: MultimidiaState
  // Lembrete: só fotos, então o título diz "Fotos associadas"
  apenasFotos?: boolean
  disabled?: boolean
}

/**
 * Último card do formulário: as mídias que sobem na sincronização, para revisar
 * antes de salvar. Fica no fim da rolagem para não cobrir os campos; sem mídia, some.
 */
export function CardMidiasAssociadas({ multimidia, apenasFotos = false, disabled = false }: CardMidiasAssociadasProps) {
  const quantidade = multimidia.pendentes.length
  if (quantidade === 0) return null

  return (
    <CardFicha titulo={`${apenasFotos ? 'Fotos associadas' : 'Mídias associadas'} (${quantidade})`}>
      <ListaAnexos state={multimidia} disabled={disabled} />
    </CardFicha>
  )
}
