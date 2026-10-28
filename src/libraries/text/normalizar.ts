/** Para buscas: sem acentos e em minúsculas ("Cerrádo" e "cerrado" batem) */
export function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

/** O texto contém o termo, sem diferenciar maiúsculas nem acentos */
export function contemTermo(texto: string | null | undefined, termo: string): boolean {
  if (!texto) return false
  return normalizar(texto).includes(normalizar(termo.trim()))
}
