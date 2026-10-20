import type { FichaColeta } from './types'

// Campos de texto da ficha, com rótulo e exemplo. Família fica de fora: tem campo
// próprio com busca (FamiliaInput). Usado na coleta e no lembrete.
export const FICHA_FIELDS = [
  ['nome_popular', 'Nome popular', 'Ex.: Palmito-juçara'],
  ['nome_cientifico', 'Nome científico', 'Ex.: Euterpe edulis'],
  ['municipio', 'Município', 'Ex.: Campo Mourão'],
  ['estado', 'Estado', 'Ex.: Paraná'],
  ['tipo_vegetacao', 'Tipo de vegetação', 'Ex.: Floresta estacional'],
  ['solo', 'Solo', 'Ex.: Argiloso'],
  ['relevo', 'Relevo', 'Ex.: Plano'],
  ['substrato', 'Substrato', 'Ex.: Solo úmido'],
  ['tronco_com_casca', 'Tronco com casca', 'Descreva o tronco'],
  ['associacoes', 'Associações', 'Espécies associadas'],
  ['folhas', 'Folhas', 'Descreva as folhas'],
  ['habito', 'Hábito', 'Ex.: Arbóreo'],
  ['frutos', 'Frutos', 'Descreva os frutos'],
  ['flores', 'Flores', 'Descreva as flores'],
  ['luminosidade', 'Luminosidade', 'Ex.: Meia-sombra'],
] as const satisfies ReadonlyArray<readonly [keyof FichaColeta, string, string]>

export type FichaFieldName = (typeof FICHA_FIELDS)[number][0]

export type FichaValues = Record<FichaFieldName, string>

export const EMPTY_FICHA: FichaValues = Object.fromEntries(
  FICHA_FIELDS.map(([key]) => [key, '']),
) as FichaValues

/** Texto vazio vira null, como a API espera */
export function fichaParaPayload(ficha: FichaValues): Record<FichaFieldName, string | null> {
  return Object.fromEntries(
    FICHA_FIELDS.map(([key]) => [key, ficha[key].trim() || null]),
  ) as Record<FichaFieldName, string | null>
}
