import { describe, expect, it } from 'vitest'
import {
  conflitoAoAdicionar,
  conflitosDoDia,
  encontrarConflito,
  horarioDaEntrada,
  intervalosDoDia,
  type EntradaResolvida,
} from '../derive'
import type {
  TripLocal,
  TripPassagem,
  TripRoteiro,
  TripState,
} from '../../types'

function local(id: string, nome: string, duracaoMin?: number): TripLocal {
  return { id, viagemId: 'v1', nome, categoria: 'museu', duracaoMin }
}

function entrada(
  id: string,
  item: TripLocal,
  inicio?: string,
  fim?: string,
): EntradaResolvida {
  const roteiro: TripRoteiro = {
    id,
    viagemId: 'v1',
    diaId: 'd1',
    tipoItem: 'LOCAL',
    itemId: item.id,
    ordem: 0,
    inicio,
    fim,
  }
  return { entrada: roteiro, item: { tipo: 'LOCAL', local: item } }
}

describe('encontrarConflito', () => {
  it('não considera a própria atividade como conflito', () => {
    const entradas = [entrada('r1', local('l1', 'Museu'), '09:00', '11:00')]
    expect(
      encontrarConflito(entradas, { id: 'r1', inicio: 540, fim: 660 }),
    ).toBeNull()
  })

  it('detecta sobreposição e informa qual atividade ocupa o intervalo', () => {
    const entradas = [
      entrada('r1', local('l1', 'Museu'), '09:00', '11:00'),
      entrada('r2', local('l2', 'Almoço'), '10:00', '12:00'),
    ]
    const conflito = encontrarConflito(entradas, {
      id: 'r2',
      inicio: 10 * 60,
      fim: 12 * 60,
    })
    expect(conflito?.id).toBe('r1')
    expect(conflito?.titulo).toBe('Museu')
  })

  it('permite atividades consecutivas', () => {
    const entradas = [entrada('r1', local('l1', 'Museu'), '09:00', '11:00')]
    expect(
      encontrarConflito(entradas, { inicio: 11 * 60, fim: 12 * 60 }),
    ).toBeNull()
  })

  it('ignora atividade sem horário definido no roteiro', () => {
    const entradas = [entrada('r1', local('l1', 'Museu', 120))]
    expect(
      encontrarConflito(entradas, { inicio: 10 * 60, fim: 11 * 60 }),
    ).toBeNull()
  })

  it('usa a duração estimada para fechar o intervalo de quem tem início', () => {
    const entradas = [entrada('r1', local('l1', 'Museu', 120), '09:00')]
    expect(
      encontrarConflito(entradas, { inicio: 10 * 60, fim: 10 * 60 + 30 })?.id,
    ).toBe('r1')
  })
})

describe('conflitosDoDia', () => {
  it('devolve os pares que se sobrepõem', () => {
    const entradas = [
      entrada('r1', local('l1', 'Museu'), '09:00', '11:00'),
      entrada('r2', local('l2', 'Almoço'), '10:00', '12:00'),
    ]
    const pares = conflitosDoDia(entradas)
    expect(pares).toHaveLength(1)
    expect(pares[0].a.titulo).toBe('Museu')
    expect(pares[0].b.titulo).toBe('Almoço')
  })

  it('não considera atividades consecutivas', () => {
    const entradas = [
      entrada('r1', local('l1', 'Museu'), '09:00', '11:00'),
      entrada('r2', local('l2', 'Almoço'), '11:00', '12:00'),
    ]
    expect(conflitosDoDia(entradas)).toEqual([])
  })
})

describe('intervalosDoDia — horário efetivo', () => {
  it('usa o horário final do local quando o roteiro não define fim', () => {
    const museu = { ...local('l1', 'Museu'), horarioFim: '10:30' }
    const intervalos = intervalosDoDia([entrada('r1', museu, '09:00')])
    expect(intervalos[0]).toMatchObject({ inicio: 540, fim: 630 })
  })

  it('trata passagem que atravessa a meia-noite como ocupando até o fim do dia', () => {
    const passagem: TripPassagem = {
      id: 'p1',
      viagemId: 'v1',
      tipo: 'aviao',
      origem: 'A',
      destino: 'B',
      partida: '2026-05-12T23:00:00',
      chegada: '2026-05-13T01:00:00',
    }
    const entradas: EntradaResolvida[] = [
      {
        entrada: {
          id: 'r1',
          viagemId: 'v1',
          diaId: 'd1',
          tipoItem: 'PASSAGEM',
          itemId: 'p1',
          ordem: 0,
          inicio: '23:00',
        },
        item: { tipo: 'PASSAGEM', passagem },
      },
    ]
    expect(intervalosDoDia(entradas)[0].fim).toBe(1440)
  })

  it('não inventa horário para item sem horário atribuído no roteiro', () => {
    const museu = { ...local('l1', 'Museu', 120), horarioPrevisto: '09:00' }
    const e = entrada('r1', museu)
    expect(horarioDaEntrada(e.entrada, e.item)).toEqual({
      inicio: undefined,
      fim: undefined,
    })
  })
})

describe('conflitoAoAdicionar', () => {
  function estadoBase(): TripState {
    return {
      usuario: { id: 'u1', nome: 'Ana', email: 'ana@exemplo.com', ativo: true },
      viagens: [],
      destinos: [],
      dias: [{ id: 'd1', viagemId: 'v1', numero: 1, data: '2026-05-12' }],
      locais: [local('l1', 'Museu', 120)],
      passagens: [],
      hoteis: [],
      roteiro: [],
      listas: [],
      listaItens: [],
    }
  }

  it('detecta conflito de passagem pelo horário natural do bilhete', () => {
    const state = estadoBase()
    state.passagens = [
      {
        id: 'p1',
        viagemId: 'v1',
        tipo: 'aviao',
        origem: 'A',
        destino: 'B',
        partida: '2026-05-12T10:00:00',
        chegada: '2026-05-12T11:00:00',
      },
    ]
    state.roteiro = [
      {
        id: 'r1',
        viagemId: 'v1',
        diaId: 'd1',
        tipoItem: 'LOCAL',
        itemId: 'l1',
        ordem: 0,
        inicio: '09:00',
        fim: '11:00',
      },
    ]

    const conflito = conflitoAoAdicionar(state, {
      diaId: 'd1',
      tipoItem: 'PASSAGEM',
      itemId: 'p1',
    })
    expect(conflito?.id).toBe('r1')
  })

  it('ignora o próprio item ao editar o horário', () => {
    const state = estadoBase()
    state.roteiro = [
      {
        id: 'r1',
        viagemId: 'v1',
        diaId: 'd1',
        tipoItem: 'LOCAL',
        itemId: 'l1',
        ordem: 0,
        inicio: '09:00',
        fim: '11:00',
      },
    ]
    expect(
      conflitoAoAdicionar(state, {
        id: 'r1',
        diaId: 'd1',
        tipoItem: 'LOCAL',
        itemId: 'l1',
        inicio: '10:00',
        fim: '12:00',
      }),
    ).toBeNull()
  })
})
