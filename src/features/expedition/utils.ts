export type ExpeditionStatus = 'Em andamento' | 'Planejada' | 'Finalizada'

/**
 * Formata uma data ISO da API (ex.: "2026-02-15") como dd/mm/aaaa.
 * O JS interpreta essas datas como UTC; formatar em UTC evita mostrar um dia
 * antes no fuso do Brasil.
 */
export function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
}

/**
 * Calcula o status da expedição comparando hoje com o período dela:
 * antes do início = 'Planejada'; depois do fim = 'Finalizada';
 * entre as datas (incluindo o último dia inteiro) = 'Em andamento'.
 */
export function getStatus(dataInicio: string, dataFim: string): ExpeditionStatus {
  const hoje = new Date()
  const inicio = new Date(dataInicio)
  const fim = new Date(dataFim)

  // Considera o último dia inteiro como "em andamento"
  fim.setUTCHours(23, 59, 59, 999)

  if (hoje < inicio) return 'Planejada'
  if (hoje > fim) return 'Finalizada'
  return 'Em andamento'
}