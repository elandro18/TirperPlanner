import { describe, expect, it } from 'vitest'
import { sugerirRoteiro } from '../sugestaoRoteiro'
import { distanciaKm, tempoDeslocamentoMin } from '../geo'
import { hhmmToMin } from '../format'
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
    lat: -29.3785,
    lng: -50.8727,
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
        lat: -29.3785,
        lng: -50.8727,
      },
    ],
    dias: [
      { id: 'd1', viagemId: 'v1', numero: 1, data: '2026-05-12', destinoId: 'dest1' },
      { id: 'd2', viagemId: 'v1', numero: 2, data: '2026-05-13', destinoId: 'dest1' },
    ],
    locais: [
      local('l1', 'Lago Negro', { lat: -29.3792, lng: -50.8769, duracaoMin: 90 }),
      local('l2', 'Café Colonial', { lat: -29.3741, lng: -50.8747 }),
      local('l3', 'Local sem coordenadas', { lat: undefined, lng: undefined }),
    ],
    passagens: [],
    hoteis: [],
    roteiro: [],
    listas: [],
    listaItens: [],
  }
}

describe('distanciaKm / tempoDeslocamentoMin', () => {
  it('devolve zero para o mesmo ponto', () => {
    const p = { lat: -29.3785, lng: -50.8727 }
    expect(distanciaKm(p, p)).toBe(0)
    expect(tempoDeslocamentoMin(0)).toBe(0)
  })

  it('estima distância entre São Paulo e Rio', () => {
    const sp = { lat: -23.5505, lng: -46.6333 }
    const rio = { lat: -22.9068, lng: -43.1729 }
    const km = distanciaKm(sp, rio)
    expect(km).toBeGreaterThan(340)
    expect(km).toBeLessThan(390)
  })

  it('converte distância em minutos com fator de desvio', () => {
    expect(tempoDeslocamentoMin(10, 30, 1.3)).toBe(26)
  })
})

describe('sugerirRoteiro', () => {
  it('distribui os locais pendentes e ignora quem não tem coordenadas', () => {
    const state = estado()
    const sugestao = sugerirRoteiro(state, 'v1')

    const itens = sugestao.dias.flatMap((d) => d.itens)
    expect(itens.map((i) => i.localId).sort()).toEqual(['l1', 'l2'])
    expect(sugestao.semCoordenadas).toEqual([
      { id: 'l3', nome: 'Local sem coordenadas' },
    ])
    expect(sugestao.naoAlocados).toEqual([])
  })

  it('respeita o intervalo do dia e não cria sobreposição', () => {
    const state = estado()
    const sugestao = sugerirRoteiro(state, 'v1', {
      inicioDia: '09:00',
      fimDia: '20:00',
    })

    for (const dia of sugestao.dias) {
      const intervalos = dia.itens
        .map((i) => ({
          inicio: hhmmToMin(i.inicio)!,
          fim: hhmmToMin(i.fim)!,
        }))
        .sort((a, b) => a.inicio - b.inicio)

      expect(intervalos[0].inicio).toBeGreaterThanOrEqual(540)
      expect(intervalos[intervalos.length - 1].fim).toBeLessThanOrEqual(1200)

      for (let i = 1; i < intervalos.length; i++) {
        expect(intervalos[i].inicio).toBeGreaterThanOrEqual(
          intervalos[i - 1].fim,
        )
      }
    }
  })

  it('preserva eventos fixos e agenda depois deles', () => {
    const state = estado()
    state.locais.push(
      local('l4', 'Museu fixo', {
        lat: -29.3656,
        lng: -50.8123,
        duracaoMin: 120,
      }),
    )
    state.roteiro = [
      {
        id: 'r1',
        viagemId: 'v1',
        diaId: 'd1',
        tipoItem: 'LOCAL',
        itemId: 'l4',
        ordem: 0,
        inicio: '09:00',
        fim: '11:00',
      },
    ]

    const sugestao = sugerirRoteiro(state, 'v1')
    const doPrimeiroDia = sugestao.dias.find((d) => d.diaId === 'd1')
    expect(doPrimeiroDia?.itens.length).toBeGreaterThan(0)
    for (const item of doPrimeiroDia!.itens) {
      expect(hhmmToMin(item.inicio)!).toBeGreaterThanOrEqual(11 * 60)
    }
    expect(state.roteiro).toHaveLength(1)
  })

  it('não agenda fora do horário de funcionamento', () => {
    const state = estado()
    state.locais = [
      local('l1', 'Jantar', {
        duracaoMin: 60,
        horarioAbertura: '18:00',
        horarioFechamento: '22:00',
      }),
    ]

    const sugestao = sugerirRoteiro(state, 'v1')
    const item = sugestao.dias.flatMap((d) => d.itens)[0]
    expect(item).toBeDefined()
    expect(hhmmToMin(item.inicio)!).toBeGreaterThanOrEqual(18 * 60)
  })

  it('informa locais que não couberam quando o dia está tomado', () => {
    const state = estado()
    state.dias = [state.dias[0]]
    state.locais.push(
      local('l4', 'Dia inteiro', {
        lat: -29.3656,
        lng: -50.8123,
        duracaoMin: 660,
      }),
    )
    state.roteiro = [
      {
        id: 'r1',
        viagemId: 'v1',
        diaId: 'd1',
        tipoItem: 'LOCAL',
        itemId: 'l4',
        ordem: 0,
        inicio: '09:00',
        fim: '20:00',
      },
    ]

    const sugestao = sugerirRoteiro(state, 'v1')
    expect(sugestao.dias.flatMap((d) => d.itens)).toEqual([])
    expect(sugestao.naoAlocados.map((l) => l.id).sort()).toEqual(['l1', 'l2'])
  })

  it('não sugere locais que já estão no roteiro', () => {
    const state = estado()
    state.roteiro = [
      {
        id: 'r1',
        viagemId: 'v1',
        diaId: 'd1',
        tipoItem: 'LOCAL',
        itemId: 'l1',
        ordem: 0,
        inicio: '09:00',
        fim: '10:30',
      },
    ]

    const sugestao = sugerirRoteiro(state, 'v1')
    expect(sugestao.dias.flatMap((d) => d.itens).map((i) => i.localId)).toEqual([
      'l2',
    ])
  })
})
