export type ExpeditionStatus = 'Em andamento' | 'Planejada' | 'Finalizada'

// A API devolve datas ISO (ex.: "2026-02-15"), que o JS interpreta como UTC.
// Formatar em UTC evita mostrar um dia antes no fuso do Brasil.
export function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
}

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