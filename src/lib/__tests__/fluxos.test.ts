import { describe, expect, it } from 'vitest'
import { reducer } from '../../store/reducer'
import { sugerirRoteiro } from '../sugestaoRoteiro'
import { conflitosDoDia, roteiroDoDia } from '../derive'
import { resumoFinanceiroLista } from '../listas'
import type { TripLocal, TripState } from '../../types'

function local(
  id: string,
  nome: string,
  overrides: Partial<TripLocal> = {},
): TripLocal {
  return {
    id,
    viagemId: 'v1',
    nome,
    categoria: 'passeio',
    cidade: 'Gramado',
    duracaoMin: 60,
    ...overrides,
  }
}

function estado(): TripState {
  return {
    usuario: { id: 'u1', nome: 'Ana', email: 'ana@exemplo.com', ativo: true },
    viagens: [
      {
        id: 'v1',
        usuarioId: 'u1',
        nome: 'Gramado',
        destino: 'Gramado',
        comDatas: true,
        dataInicio: '2026-05-12',
        dataFim: '2026-05-13',
        moeda: 'BRL',
        ativa: true,
        capaUrl: '',
        criadaEm: '2026-01-01T00:00:00',
      },
    ],
    destinos: [
      {
        id: 'dest1',
        viagemId: 'v1',
        nome: 'Gramado',
        cidade: 'Gramado',
        ordem: 0,
        dataInicio: '2026-05-12',
        dataFim: '2026-05-13',
        lat: -29.3785,
        lng: -50.8727,
      },
    ],
    dias: [
      { id: 'd1', viagemId: 'v1', numero: 1, data: '2026-05-12', destinoId: 'dest1' },
      { id: 'd2', viagemId: 'v1', numero: 2, data: '2026-05-13', destinoId: 'dest1' },
    ],
    locais: [
      local('l1', 'Lago Negro', { lat: -29.3792, lng: -50.8769, duracaoMin: 120 }),
      local('l2', 'Café Colonial', { lat: -29.3741, lng: -50.8747 }),
    ],
    passagens: [],
    hoteis: [],
    roteiro: [],
    listas: [
      {
        id: 'ls1',
        usuarioId: 'u1',
        viagemId: 'v1',
        nome: 'Compras',
        categoria: 'Compras',
        criadaEm: '2026-01-01T00:00:00',
      },
    ],
    listaItens: [],
  }
}

function add(
  state: TripState,
  entrada: {
    id: string
    diaId: string
    itemId: string
    inicio?: string
    fim?: string
  },
): TripState {
  return reducer(state, {
    type: 'ADD_ROTEIRO',
    entrada: {
      ...entrada,
      viagemId: 'v1',
      tipoItem: 'LOCAL',
    },
  })
}

describe('Fluxo integrado — planejamento, conflito e ordenação', () => {
  it('adiciona, bloqueia conflito, corrige e aceita atividades consecutivas', () => {
    let state = add(estado(), {
      id: 'r1',
      diaId: 'd1',
      itemId: 'l1',
      inicio: '09:00',
      fim: '11:00',
    })

    state = add(state, {
      id: 'r2',
      diaId: 'd1',
      itemId: 'l2',
      inicio: '10:00',
      fim: '11:00',
    })
    expect(state.roteiro).toHaveLength(1)

    state = reducer(state, {
      type: 'UPDATE_ROTEIRO',
      id: 'r1',
      patch: { inicio: '08:00', fim: '10:00' },
    })
    expect(state.roteiro.find((r) => r.id === 'r1')?.inicio).toBe('08:00')

    state = add(state, {
      id: 'r2',
      diaId: 'd1',
      itemId: 'l2',
      inicio: '10:00',
      fim: '11:00',
    })
    expect(state.roteiro).toHaveLength(2)
    expect(conflitosDoDia(roteiroDoDia(state, 'd1'))).toEqual([])

    const ordenado = [...state.roteiro]
      .filter((r) => r.diaId === 'd1')
      .sort((a, b) => a.ordem - b.ordem)
    expect(ordenado.map((r) => r.id)).toEqual(['r1', 'r2'])
  })

  it('permite reutilizar o mesmo item em outro dia e bloqueia duplicidade no mesmo dia', () => {
    let state = add(estado(), {
      id: 'r1',
      diaId: 'd1',
      itemId: 'l1',
      inicio: '09:00',
      fim: '10:30',
    })

    state = add(state, {
      id: 'r2',
      diaId: 'd2',
      itemId: 'l1',
      inicio: '09:00',
      fim: '10:30',
    })
    expect(state.roteiro).toHaveLength(2)

    state = add(state, {
      id: 'r3',
      diaId: 'd1',
      itemId: 'l1',
      inicio: '14:00',
      fim: '15:00',
    })
    expect(state.roteiro).toHaveLength(2)
  })

  it('aplica a sugestão sem criar conflitos e preserva os itens fixos', () => {
    let state = estado()
    state.roteiro = [
      {
        id: 'fixo',
        viagemId: 'v1',
        diaId: 'd1',
        tipoItem: 'LOCAL',
        itemId: 'l1',
        ordem: 0,
        inicio: '09:00',
        fim: '11:00',
      },
    ]

    const sugestao = sugerirRoteiro(state, 'v1')
    const itens = sugestao.dias.flatMap((dia) =>
      dia.itens.map((item) => ({ ...item, diaId: dia.diaId })),
    )
    expect(itens.length).toBeGreaterThan(0)

    for (const item of itens) {
      state = add(state, {
        id: `r-${item.localId}-${item.diaId}`,
        diaId: item.diaId,
        itemId: item.localId,
        inicio: item.inicio,
        fim: item.fim,
      })
    }

    expect(state.roteiro.find((r) => r.id === 'fixo')?.inicio).toBe('09:00')
    for (const dia of state.dias) {
      expect(conflitosDoDia(roteiroDoDia(state, dia.id))).toEqual([])
    }
  })
})

describe('Fluxo integrado — conclusão de compra com valor pago', () => {
  it('registra o valor pago e reflete no resumo financeiro', () => {
    let state = estado()
    state.listaItens = [
      {
        id: 'li1',
        listaId: 'ls1',
        nome: 'Cartão postal',
        valorPrevisto: 30,
        concluido: false,
        ordem: 0,
        criadaEm: '2026-01-01T00:00:00',
      },
    ]

    state = reducer(state, {
      type: 'CONCLUIR_LISTA_ITEM',
      id: 'li1',
      valorPago: 25,
      em: '2026-05-12T18:00:00',
    })

    expect(state.listaItens[0].concluido).toBe(true)
    expect(state.listaItens[0].valorPago).toBe(25)
    expect(resumoFinanceiroLista(state.listaItens)).toMatchObject({
      previsto: 30,
      pago: 25,
      diferenca: -5,
    })
  })
})
