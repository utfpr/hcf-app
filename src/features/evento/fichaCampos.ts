import type { RotaExpedicao } from '@/features/expedition/types'
import type { FichaColeta, FichaComum } from './types'

// Campos de texto da ficha, com rótulo e exemplo. Família fica de fora: tem campo
// próprio com busca (FamiliaInput). Usado no lembrete; a coleta usa FICHA_COLETA_FIELDS.
// A ordem é a dos cards da coleta (SECOES_COLETA), para as duas telas baterem.
export const FICHA_FIELDS = [
  ['nome_popular', 'Nome popular', 'Ex.: Palmito-juçara'],
  ['nome_cientifico', 'Nome científico', 'Ex.: Euterpe edulis'],
  ['municipio', 'Município', 'Ex.: Campo Mourão'],
  ['estado', 'Estado', 'Ex.: Paraná'],
  ['tipo_vegetacao', 'Tipo de vegetação', 'Ex.: Floresta estacional'],
  ['solo', 'Solo', 'Ex.: Argiloso'],
  ['relevo', 'Relevo', 'Ex.: Plano'],
  ['habito', 'Hábito', 'Ex.: Arbóreo'],
  ['luminosidade', 'Luminosidade', 'Ex.: Meia-sombra'],
  ['substrato', 'Substrato', 'Ex.: Solo úmido'],
  ['associacoes', 'Associações', 'Espécies associadas'],
  ['flores', 'Flores', 'Observações sobre as flores'],
  ['frutos', 'Frutos', 'Descreva os frutos'],
  ['folhas', 'Folhas', 'Descreva as folhas'],
  ['tronco_com_casca', 'Tronco com casca', 'Descreva o tronco'],
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
}
const CAMPOS_ANTES_DE: Partial<Record<FichaFieldName, readonly DefinicaoCampo[]>> = {
  flores: [
    ['flores_cor_calice', 'Cor do cálice', 'Ex.: Verde'],
    ['flores_cor_corola', 'Cor da corola', 'Ex.: Lilás'],
  ],
}

export const FICHA_COLETA_FIELDS: readonly DefinicaoCampo[] = FICHA_FIELDS.flatMap(campo => [
  ...(CAMPOS_ANTES_DE[campo[0]] ?? []),
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

export function dicaDeEscolha(campo: CampoMultiplaEscolha): 'Uma ou mais' | 'Escolha uma' {
  return aceitaVariasOpcoes(campo) ? 'Uma ou mais' : 'Escolha uma'
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

/** Local da expedição com exatamente este nome (sem diferenciar maiúsculas e acentos) */
export function localDaExpedicao(locais: OpcaoLocalColeta[], texto: string): OpcaoLocalColeta | undefined {
  const procurado = semAcento(texto.trim())
  if (!procurado) return undefined
  return locais.find(local => semAcento(local.descricao) === procurado)
}

/**
 * Município e Estado só aparecem para um local digitado à mão: um local da lista
 * já os preenche por trás, e mostrá-los de novo seria repetir a informação.
 */
export function precisaCidadeEstado(ficha: FichaValues, locais: OpcaoLocalColeta[]): boolean {
  return ficha.referencia_local.trim().length > 0 && !localDaExpedicao(locais, ficha.referencia_local)
}

export interface CidadeEstado {
  municipio: string
  estado: string
}

/** A cidade da rota, quando a expedição passa por uma só; senão null */
export function cidadeUnicaDaExpedicao(rotas: readonly RotaExpedicao[] | undefined): CidadeEstado | null {
  if (!rotas?.length) return null
  const cidades = new Map(rotas.map(rota => [rota.nome_cidade, rota]))
  if (cidades.size !== 1) return null
  const [rota] = cidades.values()
  return { municipio: rota.nome_cidade, estado: rota.estado_nome ?? rota.estado_sigla ?? '' }
}

/**
 * Texto digitado no local. Igual a um local da lista (sem tocar na sugestão): leva
 * a cidade dele, como se tivesse escolhido, já que os campos ficam ocultos. Fora da
 * lista: sugere a cidade única da rota, sem apagar o que já foi preenchido.
 */
export function digitarLocal(
  ficha: FichaValues,
  texto: string,
  locais: OpcaoLocalColeta[],
  cidadeUnica: CidadeEstado | null,
): FichaValues {
  const atualizada = { ...ficha, referencia_local: texto }
  const daLista = localDaExpedicao(locais, texto)
  // Mantém o texto como foi digitado: trocar pelo nome cadastrado atrapalharia a digitação
  if (daLista) return { ...atualizada, municipio: daLista.municipio, estado: daLista.estado }

  const foraDaLista = precisaCidadeEstado(atualizada, locais)
  if (foraDaLista && cidadeUnica && !ficha.municipio && !ficha.estado) {
    return { ...atualizada, municipio: cidadeUnica.municipio, estado: cidadeUnica.estado }
  }
  return atualizada
}

/** Escolher um local sugerido preenche também a cidade e o estado */
export function escolherLocalColeta(ficha: FichaValues, local: OpcaoLocalColeta): FichaValues {
  return { ...ficha, referencia_local: local.descricao, municipio: local.municipio, estado: local.estado }
}

// Cards da coleta, na ordem pedida pelos coletores. `opcoes` vira os chips do
// card; `campos` são os textos que vêm depois, na ordem. Identificação e Local
// abrem a tela (CAMPOS_IDENTIFICACAO, CAMPOS_LOCAL); Município e Estado ficam no
// LocalColetaInput, só para local digitado.
export interface SecaoFicha {
  titulo: string
  opcoes?: CampoMultiplaEscolha
  campos: readonly FichaColetaFieldName[]
}

export const CAMPOS_IDENTIFICACAO = ['nome_cientifico', 'nome_popular'] as const satisfies readonly FichaColetaFieldName[]
export const CAMPOS_LOCAL = ['tipo_vegetacao', 'solo', 'relevo'] as const satisfies readonly FichaColetaFieldName[]

export const SECOES_COLETA: readonly SecaoFicha[] = [
  { titulo: 'Hábito', opcoes: 'habito', campos: ['altura', 'exsudado'] },
  { titulo: 'Luminosidade', opcoes: 'luminosidade', campos: [] },
  { titulo: 'Substrato', opcoes: 'substrato', campos: [] },
  { titulo: 'Associações', opcoes: 'associacoes', campos: [] },
  { titulo: 'Flores', campos: ['flores_cor_calice', 'flores_cor_corola', 'flores'] },
  { titulo: 'Frutos', opcoes: 'frutos', campos: [] },
  { titulo: 'Folhas', opcoes: 'folhas', campos: [] },
  { titulo: 'Tronco com casca', opcoes: 'tronco_com_casca', campos: [] },
]

// Dentro do card "Flores", o texto livre não precisa repetir o nome do card
export const ROTULO_NO_CARD: Partial<Record<FichaColetaFieldName, string>> = {
  flores: 'Observações',
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
