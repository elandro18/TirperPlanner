import type { TripPassagem } from '../../types'

export function encontrarPassagemDuplicada(
  passagens: TripPassagem[],
  documentoHash: string,
  dados: Partial<TripPassagem>,
): TripPassagem | undefined {
  const porHash = passagens.find((p) => p.documentoHash === documentoHash)
  if (porHash) return porHash

  if (!dados.localizador || !dados.numeroBilhete) return undefined

  return passagens.find(
    (p) =>
      p.localizador === dados.localizador &&
      p.numeroBilhete === dados.numeroBilhete,
  )
}
