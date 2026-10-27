import type { TripListaItem } from '../types'

/**
 * Ordem de exibição do checklist: pendentes primeiro (pela ordem definida),
 * depois os concluídos (pela ordem de conclusão — o último marcado fica por
 * último). Assim, desmarcar devolve o item à posição que ele tinha entre os
 * pendentes e a ordenação permanece consistente.
 */
export function ordenarItensLista(itens: TripListaItem[]): TripListaItem[] {
  const pendentes = itens
    .filter((i) => !i.concluido)
    .sort((a, b) => a.ordem - b.ordem)
  const concluidos = itens
    .filter((i) => i.concluido)
    .sort((a, b) => {
      const ca = a.concluidoEm ?? ''
      const cb = b.concluidoEm ?? ''
      return ca === cb ? a.ordem - b.ordem : ca.localeCompare(cb)
    })
  return [...pendentes, ...concluidos]
}

export interface ProgressoLista {
  total: number
  concluidos: number
  pendentes: number
  pct: number
}

export function progressoLista(itens: TripListaItem[]): ProgressoLista {
  const total = itens.length
  const concluidos = itens.filter((i) => i.concluido).length
  return {
    total,
    concluidos,
    pendentes: total - concluidos,
    pct: total ? Math.round((concluidos / total) * 100) : 0,
  }
}

/** Próxima posição livre entre os itens pendentes. */
export function proximaOrdemItem(itens: TripListaItem[]): number {
  const ordens = itens.map((i) => i.ordem)
  return ordens.length ? Math.max(...ordens) + 1 : 0
}

export function valorPrevistoItem(item: TripListaItem): number {
  return item.valorPrevisto ?? item.valor ?? 0
}

export interface ResumoFinanceiroLista {
  previsto: number
  pago: number
  previstoConcluidos: number
  diferenca: number
  itensPagos: number
  itensSemValor: number
}

export function resumoFinanceiroLista(
  itens: TripListaItem[],
): ResumoFinanceiroLista {
  let previsto = 0
  let previstoConcluidos = 0
  let pago = 0
  let itensPagos = 0
  let itensSemValor = 0

  for (const item of itens) {
    const estimado = valorPrevistoItem(item)
    previsto += estimado

    if (!item.concluido) continue
    previstoConcluidos += estimado

    if (item.valorPago != null) {
      pago += item.valorPago
      itensPagos += 1
    } else {
      itensSemValor += 1
    }
  }

  return {
    previsto,
    pago,
    previstoConcluidos,
    diferenca: pago - previstoConcluidos,
    itensPagos,
    itensSemValor,
  }
}
