// Espelha GET /familias do hcf-api (rota legada, por isso o formato metadados/resultado
// em vez do itens/total das rotas /v2)

export interface Familia {
  id: number
  nome: string
}

export interface ListagemFamilias {
  metadados: {
    total: number
    pagina: number
    limite: number
  }
  resultado: Familia[]
}
