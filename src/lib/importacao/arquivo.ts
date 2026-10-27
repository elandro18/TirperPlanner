export const TAMANHO_MAXIMO_BYTES = 10 * 1024 * 1024

export const TIPOS_ARQUIVO = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
] as const

export type TipoDocumento = 'pdf' | 'imagem'

export function tipoDocumento(file: File): TipoDocumento | null {
  if (file.type === 'application/pdf') return 'pdf'
  if (TIPOS_ARQUIVO.includes(file.type as (typeof TIPOS_ARQUIVO)[number])) {
    return 'imagem'
  }
  return null
}

export function validarArquivo(file: File): string | undefined {
  if (!tipoDocumento(file)) {
    return 'Formato não suportado. Envie PDF, JPG, PNG ou WEBP.'
  }
  if (file.size <= 0) return 'O arquivo está vazio.'
  if (file.size > TAMANHO_MAXIMO_BYTES) {
    return 'O arquivo deve ter no máximo 10 MB.'
  }
  return undefined
}

export async function hashArquivo(file: File): Promise<string> {
  const conteudo = await file.arrayBuffer()

  if (globalThis.crypto?.subtle) {
    const digest = await globalThis.crypto.subtle.digest('SHA-256', conteudo)
    return Array.from(new Uint8Array(digest))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('')
  }

  return `simples-${file.size}-${file.name}-${file.lastModified}`
}
