import type { RotaExpedicao } from '@/features/expedition/types'
import type { FichaColeta, FichaComum } from './types'

// Campos de texto da ficha, com rótulo e exemplo. Família fica de fora: tem campo
// próprio com busca (FamiliaInput). Usado no lembrete; a coleta usa FICHA_COLETA_FIELDS.
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
  ['flores', 'Flores', 'Observações sobre as flores'],
  ['luminosidade', 'Luminosidade', 'Ex.: Meia-sombra'],
] as const satisfies ReadonlyArray<readonly [keyof FichaComum, string, string]>

export type FichaFieldName = (typeof FICHA_FIELDS)[number][0]

type CampoSoDaColeta = Exclude<keyof FichaColeta, keyof FichaComum>
type DefinicaoCampo = readonly [FichaFieldName | CampoSoDaColeta, string, string]

// Campos que só a ficha de coleta tem, encaixados na ordem da ficha impressa:
// altura e exsudado no bloco Hábito; as cores do cálice e da corola antes da
// observação das flores.
const CAMPOS_DEPOIS_DE: Partial<Record<FichaFieldName, readonly DefinicaoCampo[]>> = {
  habito: [
    ['altura', 'Altura', 'Ex.: 8 m'],
    ['exsudado', 'Exsudado (presença/cor)', 'Ex.: Látex branco'],
  ],
  frutos: [
    ['flores_cor_calice', 'Cor do cálice', 'Ex.: Verde'],
    ['flores_cor_corola', 'Cor da corola', 'Ex.: Lilás'],
  ],
}

export const FICHA_COLETA_FIELDS: readonly DefinicaoCampo[] = FICHA_FIELDS.flatMap(campo => [
  campo,
  ...(CAMPOS_DEPOIS_DE[campo[0]] ?? []),
])

export type FichaColetaFieldName = DefinicaoCampo[0]

export type FichaValues = Record<FichaColetaFieldName | 'referencia_local', string>

export const EMPTY_FICHA: FichaValues = {
  ...Object.fromEntries(FICHA_COLETA_FIELDS.map(([key]) => [key, ''])),
  referencia_local: '',
} as FichaValues

// Opções da ficha impressa. Elas existem apenas no aplicativo: a API recebe o
// texto escolhido, separado por vírgula quando houver mais de uma opção.
export const FICHA_MULTIPLA_ESCOLHA = {
  substrato: ['Rupícola', 'Ripária', 'Palustre', 'Psamófila', 'Reófila', 'Hidrófila', 'Terrícola'],
  tronco_com_casca: ['Lisa', 'Escamosa', 'Esfoliante', 'Estriada', 'Fissurada', 'Gretada', 'Suberosa', 'Verrucosa'],
  associacoes: ['Epífita', 'Parasita', 'Hemi-parasita', 'Micoheterotrófica'],
  folhas: ['Cartáceas', 'Coriáceas', 'Crassas', 'Membranáceas'],
  habito: [
    'Árvore', 'Arvoreta', 'Arbusto', 'Subarbusto', 'Erva', 'Ereta', 'Liana',
    'Decumbente', 'Escandente', 'Cespitosa', 'Prostrada/reptante',
    'Trepadeira com gavinhas', 'Trepadeira volúvel',
  ],
  frutos: ['Carnoso', 'Seco', 'Deiscentes', 'Indeiscentes'],
  luminosidade: ['Heliófita', 'Semi-ciófita', 'Ciófita'],
} as const satisfies Partial<Record<FichaFieldName, readonly string[]>>

export type CampoMultiplaEscolha = keyof typeof FICHA_MULTIPLA_ESCOLHA

// Só estes campos aceitam mais de uma opção; nos demais a escolha é única.
const CAMPOS_MULTIPLA_SELECAO: ReadonlySet<CampoMultiplaEscolha> = new Set(['folhas', 'frutos', 'habito'])

export function aceitaVariasOpcoes(campo: CampoMultiplaEscolha): boolean {
  return CAMPOS_MULTIPLA_SELECAO.has(campo)
}

export function opcoesSelecionadas(valor: string): string[] {
  return valor ? valor.split(', ').filter(Boolean) : []
}

/** Novo valor do campo depois de tocar numa opção */
export function escolherOpcao(campo: CampoMultiplaEscolha, valorAtual: string, opcao: string): string {
  const selecionadas = opcoesSelecionadas(valorAtual)
  if (!aceitaVariasOpcoes(campo)) {
    return selecionadas.length === 1 && selecionadas[0] === opcao ? '' : opcao
  }
  const proximo = selecionadas.includes(opcao)
    ? selecionadas.filter(item => item !== opcao)
    : [...selecionadas, opcao]
  return proximo.join(', ')
}

export interface OpcaoLocalColeta {
  id: number
  descricao: string
  municipio: string
  estado: string
}

/** Locais de coleta de todas as cidades da rota, na ordem da rota */
export function locaisColetaDaExpedicao(rotas: readonly RotaExpedicao[] | undefined): OpcaoLocalColeta[] {
  if (!rotas) return []
  return [...rotas]
    .sort((a, b) => a.ordem - b.ordem)
    .flatMap(rota => (rota.locais_coleta ?? []).flatMap(local => {
      const descricao = local.descricao?.trim()
      if (!descricao) return []
      return [{
        id: local.id,
        descricao,
        municipio: rota.nome_cidade,
        estado: rota.estado_nome ?? rota.estado_sigla ?? '',
      }]
    }))
}

function semAcento(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

/** Locais da expedição cujo nome ou cidade contém o termo; termo vazio devolve todos */
export function buscarLocaisColeta(locais: OpcaoLocalColeta[], termo: string): OpcaoLocalColeta[] {
  const procurado = semAcento(termo.trim())
  if (!procurado) return locais
  return locais.filter(local => semAcento(`${local.descricao} ${local.municipio}`).includes(procurado))
}

/** Escolher um local sugerido preenche também a cidade e o estado */
export function escolherLocalColeta(ficha: FichaValues, local: OpcaoLocalColeta): FichaValues {
  return { ...ficha, referencia_local: local.descricao, municipio: local.municipio, estado: local.estado }
}

// A ficha física prevê uma anotação complementar nestes campos. O texto é
// enviado junto do valor do próprio campo, mesmo sem uma opção selecionada.
export const ROTULO_OBSERVACAO_MULTIPLA: Partial<Record<CampoMultiplaEscolha, string>> = {
  associacoes: 'Observações',
  folhas: 'Cor',
  habito: 'Observações',
  frutos: 'Cor',
}

export type ObservacoesMultiplas = Partial<Record<CampoMultiplaEscolha, string>>

export function fichaComObservacoesMultiplas(
  ficha: FichaValues,
  observacoes: ObservacoesMultiplas,
): FichaValues {
  const atualizada = { ...ficha }

  for (const [campo, rotulo] of Object.entries(ROTULO_OBSERVACAO_MULTIPLA) as Array<[CampoMultiplaEscolha, string]>) {
    const anotacao = observacoes[campo]?.trim()
    if (anotacao) {
      const selecionadas = ficha[campo].trim()
      atualizada[campo] = selecionadas
        ? `${selecionadas}, ${rotulo}: ${anotacao}`
        : `${rotulo}: ${anotacao}`
    }
  }

  return atualizada
}

function paraPayload<K extends FichaColetaFieldName>(
  ficha: FichaValues,
  campos: ReadonlyArray<readonly [K, string, string]>,
): Record<K | 'referencia_local', string | null> {
  return Object.fromEntries(
    [...campos.map(([key]) => [key, ficha[key].trim() || null]), ['referencia_local', ficha.referencia_local.trim() || null]],
  ) as Record<K | 'referencia_local', string | null>
}

/** Ficha do lembrete; texto vazio vira null, como a API espera */
export function fichaParaPayload(ficha: FichaValues): Record<FichaFieldName | 'referencia_local', string | null> {
  return paraPayload(ficha, FICHA_FIELDS)
}

/** Ficha da coleta, com altura, exsudado e as cores das flores */
export function fichaColetaParaPayload(ficha: FichaValues): Record<FichaColetaFieldName | 'referencia_local', string | null> {
  return paraPayload(ficha, FICHA_COLETA_FIELDS)
}
