import {
  DocumentDirectoryPath,
  exists,
  mkdir,
  moveFile,
  readFile,
  unlink,
  writeFile,
} from '@dr.pogodin/react-native-fs'

export const STORAGE_ROOT = `${DocumentDirectoryPath}/hcf`

function diretorioDe(caminho: string): string {
  return caminho.slice(0, caminho.lastIndexOf('/'))
}

/**
 * Arquivos JSON em `<documentos do app>/hcf/<base>/`.
 *
 * Cada arquivo tem a sua fila: leituras e gravações do mesmo arquivo rodam em
 * ordem, então duas gravações seguidas não se atropelam. A gravação é atômica
 * (escreve num .tmp e renomeia); se o app morrer no meio, a leitura recupera o .tmp.
 */
export class JsonFileStore {
  private readonly filas = new Map<string, Promise<unknown>>()

  private readonly ouvintes = new Set<() => void>()

  constructor(private readonly base: string) {}

  get diretorio(): string {
    return `${STORAGE_ROOT}/${this.base}`
  }

  caminho(nome: string): string {
    return `${this.diretorio}/${nome}`
  }

  ler<T>(nome: string, padrao: T): Promise<T> {
    return this.enfileirar(nome, () => this.lerArquivo(nome, padrao))
  }

  // `silencioso`: não avisa os ouvintes (ex.: rascunho gravado a cada tecla não
  // deve fazer as outras telas relerem tudo)
  async gravar<T>(nome: string, valor: T, opcoes: { silencioso?: boolean } = {}): Promise<void> {
    await this.enfileirar(nome, () => this.gravarArquivo(nome, valor))
    if (!opcoes.silencioso) this.avisar()
  }

  /** Lê, aplica `alterar` e grava, sem outra operação do mesmo arquivo no meio */
  async atualizar<T>(nome: string, padrao: T, alterar: (atual: T) => T): Promise<T> {
    const novo = await this.enfileirar(nome, async () => {
      const atual = await this.lerArquivo(nome, padrao)
      const proximo = alterar(atual)
      await this.gravarArquivo(nome, proximo)
      return proximo
    })
    this.avisar()
    return novo
  }

  async remover(nome: string, opcoes: { silencioso?: boolean } = {}): Promise<void> {
    await this.enfileirar(nome, async () => {
      const caminho = this.caminho(nome)
      if (await exists(caminho)) await unlink(caminho)
    })
    if (!opcoes.silencioso) this.avisar()
  }

  /** Apaga a pasta inteira (logout) */
  async removerTudo(): Promise<void> {
    await Promise.all([...this.filas.values()].map(fila => fila.catch(() => undefined)))
    if (await exists(this.diretorio)) await unlink(this.diretorio)
    this.avisar()
  }

  /** Avisado depois de cada gravação; devolve a função que cancela a inscrição */
  aoMudar(ouvinte: () => void): () => void {
    this.ouvintes.add(ouvinte)
    return () => {
      this.ouvintes.delete(ouvinte)
    }
  }

  private avisar() {
    this.ouvintes.forEach(ouvinte => ouvinte())
  }

  private enfileirar<T>(nome: string, operacao: () => Promise<T>): Promise<T> {
    const anterior = this.filas.get(nome) ?? Promise.resolve()
    const proxima = anterior.catch(() => undefined).then(operacao)
    this.filas.set(nome, proxima)
    return proxima
  }

  private async lerArquivo<T>(nome: string, padrao: T): Promise<T> {
    const caminho = this.caminho(nome)
    const temporario = `${caminho}.tmp`

    let alvo: string | null = null
    if (await exists(caminho)) alvo = caminho
    else if (await exists(temporario)) alvo = temporario
    if (!alvo) return padrao

    try {
      return JSON.parse(await readFile(alvo, 'utf8')) as T
    } catch {
      return padrao
    }
  }

  private async gravarArquivo<T>(nome: string, valor: T): Promise<void> {
    const caminho = this.caminho(nome)
    const temporario = `${caminho}.tmp`

    await mkdir(diretorioDe(caminho))
    await writeFile(temporario, JSON.stringify(valor), 'utf8')
    if (await exists(caminho)) await unlink(caminho)
    await moveFile(temporario, caminho)
  }
}
