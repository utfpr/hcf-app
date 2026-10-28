// UUID v4. Serve de id local e de chave de idempotência (client_uuid) na API:
// não precisa ser criptográfico, só não colidir entre os registros do aparelho.
export function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, char => {
    const random = (Math.random() * 16) | 0
    const value = char === 'x' ? random : (random & 0x3) | 0x8
    return value.toString(16)
  })
}
