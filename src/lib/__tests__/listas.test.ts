import { describe, expect, it } from 'vitest'
import {
  ordenarItensLista,
  progressoLista,
  proximaOrdemItem,
  resumoFinanceiroLista,
  valorPrevistoItem,
} from '../listas'
import type { TripListaItem } from '../../types'

function item(
  id: string,
  concluido: boolean,
  ordem: number,
  concluidoEm?: string,
): TripListaItem {
  return {
    id,
    listaId: 'l1',
    nome: id,
    concluido,
    concluidoEm,
    ordem,
    criadaEm: '2026-01-01T00:00:00',
  }
}

describe('ordenarItensLista', () => {
  const base: TripListaItem[] = [
    item('passaporte', false, 0),
    item('carregador', false, 1),
    item('roupa', false, 2),
    item('adaptador', true, 3, '2026-01-01T10:00:00'),
  ]

  it('coloca pendentes antes dos concluídos', () => {
    expect(ordenarItensLista(base).map((i) => i.id)).toEqual([
      'passaporte',
      'carregador',
      'roupa',
      'adaptador',
    ])
  })

  it('ao concluir, move o item para o fim (exemplo da Task 3.5)', () => {
    const marcado = base.map((i) =>
      i.id === 'passaporte'
        ? { ...i, concluido: true, concluidoEm: '2026-01-02T10:00:00' }
        : i,
    )
    expect(ordenarItensLista(marcado).map((i) => i.id)).toEqual([
      'carregador',
      'roupa',
      'adaptador',
      'passaporte',
    ])
  })

  it('ao desmarcar, devolve o item à posição de pendente', () => {
    const marcado = base.map((i) =>
      i.id === 'passaporte'
        ? { ...i, concluido: true, concluidoEm: '2026-01-02T10:00:00' }
        : i,
    )
    const desmarcado = marcado.map((i) =>
      i.id === 'passaporte'
        ? { ...i, concluido: false, concluidoEm: undefined }
        : i,
    )
    expect(ordenarItensLista(desmarcado).map((i) => i.id)).toEqual([
      'passaporte',
      'carregador',
      'roupa',
      'adaptador',
    ])
  })
})

describe('progressoLista', () => {
  it('calcula total, concluídos, pendentes e percentual', () => {
    const itens = [item('a', true, 0, 'x'), item('b', false, 1), item('c', false, 2)]
    expect(progressoLista(itens)).toEqual({
      total: 3,
      concluidos: 1,
      pendentes: 2,
      pct: 33,
    })
  })

  it('lida com lista vazia', () => {
    expect(progressoLista([])).toEqual({
      total: 0,
      concluidos: 0,
      pendentes: 0,
      pct: 0,
    })
  })
})

describe('proximaOrdemItem', () => {
  it('retorna 0 para lista vazia e max+1 caso contrário', () => {
    expect(proximaOrdemItem([])).toBe(0)
    expect(proximaOrdemItem([item('a', false, 0), item('b', true, 4)])).toBe(5)
  })
})

describe('resumoFinanceiroLista', () => {
  it('separa previsto de pago e conta apenas concluídos no pago', () => {
    const itens: TripListaItem[] = [
      { ...item('a', true, 0), valorPrevisto: 100, valorPago: 90 },
      { ...item('b', false, 1), valorPrevisto: 50 },
      {
        ...item('c', true, 2),
        valor: 30,
      },
    ]

    expect(resumoFinanceiroLista(itens)).toEqual({
      previsto: 180,
      pago: 90,
      previstoConcluidos: 130,
      diferenca: -40,
      itensPagos: 1,
      itensSemValor: 1,
    })
  })

  it('usa o valor legado como previsto quando não há valorPrevisto', () => {
    expect(valorPrevistoItem({ ...item('a', false, 0), valor: 25 })).toBe(25)
    expect(
      valorPrevistoItem({ ...item('a', false, 0), valor: 25, valorPrevisto: 40 }),
    ).toBe(40)
  })

  it('trata lista vazia', () => {
    expect(resumoFinanceiroLista([])).toEqual({
      previsto: 0,
      pago: 0,
      previstoConcluidos: 0,
      diferenca: 0,
      itensPagos: 0,
      itensSemValor: 0,
    })
  })
})
