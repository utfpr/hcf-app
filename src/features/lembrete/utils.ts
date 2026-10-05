// Máscara DD/MM/AAAA enquanto o usuário digita (só dígitos, barras automáticas).
export function maskDataBr(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
}

// Converte DD/MM/AAAA para o YYYY-MM-DD da API. Devolve null se a data não
// existir (ex.: 30/02/2026).
export function dataBrParaIso(value: string): string | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value)
  if (!match) return null

  const [, dia, mes, ano] = match
  const iso = `${ano}-${mes}-${dia}`
  const date = new Date(`${iso}T00:00:00.000Z`)
  if (Number.isNaN(date.getTime()) || !date.toISOString().startsWith(iso)) return null

  return iso
}

// Hoje no fuso do aparelho, em YYYY-MM-DD.
export function hojeIso(now: Date = new Date()): string {
  const mes = String(now.getMonth() + 1).padStart(2, '0')
  const dia = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${mes}-${dia}`
}
