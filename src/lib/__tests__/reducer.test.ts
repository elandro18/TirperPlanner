import { describe, expect, it } from 'vitest'
import { migrar, reducer } from '../../store/reducer'
import { novaViagem } from '../../store/tripModel'
import type {
  TripLista,
  TripListaItem,
  TripState,
  TripViagem,
} from '../../types'

function estado(): TripState {
  return {
    usuario: { id: 'u1', nome: 'Ana', email: 'ana@exemplo.com', ativo: true },
    viagens: [
      {
        id: 'v1',
        usuarioId: 'u1',
        nome: 'Com datas',
        destino: 'Gramado',
        comDatas: true,
        dataInicio: '2026-05-12',
        dataFim: '2026-05-13',
        moeda: 'BRL',
        ativa: true,
        capaUrl: '',
        criadaEm: '2026-01-01T00:00:00',
      },
      {
        id: 'v2',
        usuarioId: 'u1',
        nome: 'Sem datas',
        destino: 'Floripa',
        comDatas: false,
        moeda: 'BRL',
        ativa: false,
        capaUrl: '',
        criadaEm: '2026-01-01T00:00:00',
      },
    ],
    destinos: [],
    dias: [
      { id: 'd1', viagemId: 'v1', numero: 1, data: '2026-05-12' },
      { id: 'd2', viagemId: 'v1', numero: 2, data: '2026-05-13' },
      { id: 'd3', viagemId: 'v2', numero: 1 },
    ],
    locais: [
      {
        id: 'l1',
        viagemId: 'v1',
        nome: 'Existente',
        categoria: 'museu',
        horarioPrevisto: '09:00',
        duracaoMin: 120,
      },
      {
        id: 'l2',
        viagemId: 'v1',
        nome: 'Conflitante',
        categoria: 'passeio',
        horarioPrevisto: '10:00',
        duracaoMin: 120,
      },
      {
        id: 'l3',
        viagemId: 'v1',
        nome: 'Livre',
        categoria: 'natureza',
        horarioPrevisto: '14:00',
        duracaoMin: 60,
      },
    ],
    passagens: [],
    hoteis: [],
    roteiro: [
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
    ],
    listas: [],
    listaItens: [],
  }
}

function lista(id: string): TripLista {
  return {
    id,
    usuarioId: 'u1',
    nome: 'Documentos',
    categoria: 'Documentos',
    criadaEm: '2026-01-01T00:00:00',
  }
}

function itemLista(id: string, listaId: string, ordem: number): TripListaItem {
  return {
    id,
    listaId,
    nome: id,
    concluido: false,
    ordem,
    criadaEm: '2026-01-01T00:00:00',
  }
}

describe('Task 5 — dias e datas', () => {
  it('cria a viagem com apenas um dia, mesmo com datas definidas', () => {
    const { viagem, dias } = novaViagem('u1', {
      nome: 'Gramado',
      destino: 'Gramado, RS',
      comDatas: true,
      dataInicio: '2026-05-12',
      dataFim: '2026-05-16',
    })
    expect(viagem.comDatas).toBe(true)
    expect(dias).toHaveLength(1)
    expect(dias[0]).toMatchObject({ numero: 1, data: '2026-05-12' })
  })

  it('cria a viagem sem datas com um dia sem data', () => {
    const { viagem, dias } = novaViagem('u1', {
      nome: 'Floripa',
      destino: 'Florianópolis, SC',
      comDatas: false,
    })
    expect(viagem.comDatas).toBe(false)
    expect(dias).toHaveLength(1)
    expect(dias[0]).toMatchObject({ numero: 1 })
    expect(dias[0].data).toBeUndefined()
  })

  it('adiciona dia com data sequencial quando a viagem tem datas', () => {
    const s = reducer(estado(), { type: 'ADD_DIA', viagemId: 'v1' })
    const dias = s.dias
      .filter((d) => d.viagemId === 'v1')
      .sort((a, b) => a.numero - b.numero)
    const novo = dias[dias.length - 1]
    expect(novo.numero).toBe(3)
    expect(novo.data).toBe('2026-05-14')
  })

  it('adiciona dia sem data quando a viagem não tem datas', () => {
    const s = reducer(estado(), { type: 'ADD_DIA', viagemId: 'v2' })
    const dias = s.dias.filter((d) => d.viagemId === 'v2')
    expect(dias).toHaveLength(2)
    expect(dias[1].numero).toBe(2)
    expect(dias[1].data).toBeUndefined()
  })

  it('altera as datas preservando dias e atividades', () => {
    const s = reducer(estado(), {
      type: 'SET_DATAS',
      viagemId: 'v1',
      comDatas: true,
      dataInicio: '2026-06-01',
      dataFim: '2026-06-05',
    })
    expect(s.dias.find((d) => d.id === 'd1')?.data).toBe('2026-06-01')
    expect(s.dias.find((d) => d.id === 'd2')?.data).toBe('2026-06-02')
    expect(s.roteiro).toHaveLength(1)
    expect(s.roteiro[0].id).toBe('r1')
  })

  it('remover datas preserva dias e atividades', () => {
    const s = reducer(estado(), {
      type: 'SET_DATAS',
      viagemId: 'v1',
      comDatas: false,
    })
    expect(s.viagens.find((v) => v.id === 'v1')?.comDatas).toBe(false)
    expect(s.dias.filter((d) => d.viagemId === 'v1')).toHaveLength(2)
    expect(s.dias.find((d) => d.id === 'd1')?.data).toBeUndefined()
    expect(s.roteiro).toHaveLength(1)
  })

  it('excluir um dia remove só as atividades daquele dia e renumera', () => {
    const s = reducer(estado(), { type: 'DELETE_DIA', id: 'd1' })
    expect(s.dias.filter((d) => d.viagemId === 'v1')).toHaveLength(1)
    expect(s.roteiro).toHaveLength(0)
    expect(s.dias.find((d) => d.id === 'd2')?.numero).toBe(1)
    expect(s.dias.find((d) => d.id === 'd2')?.data).toBe('2026-05-12')
  })
})

describe('TP-012/TP-014 — valores e vínculo das listas', () => {
  it('conclui o item registrando valor pago e data', () => {
    const base = estado()
    base.listas = [{ ...lista('ls1'), viagemId: 'v1' }]
    base.listaItens = [itemLista('i1', 'ls1', 0)]

    const s = reducer(base, {
      type: 'CONCLUIR_LISTA_ITEM',
      id: 'i1',
      valorPago: 42,
      em: '2026-02-01T10:00:00',
    })

    expect(s.listaItens[0]).toMatchObject({
      concluido: true,
      valorPago: 42,
      pagoEm: '2026-02-01T10:00:00',
    })
  })

  it('permite concluir sem informar valor', () => {
    const base = estado()
    base.listas = [{ ...lista('ls1'), viagemId: 'v1' }]
    base.listaItens = [itemLista('i1', 'ls1', 0)]

    const s = reducer(base, {
      type: 'CONCLUIR_LISTA_ITEM',
      id: 'i1',
      em: '2026-02-01T10:00:00',
    })

    expect(s.listaItens[0].concluido).toBe(true)
    expect(s.listaItens[0].valorPago).toBeUndefined()
    expect(s.listaItens[0].pagoEm).toBeUndefined()
  })

  it('reabrir preserva o valor pago registrado', () => {
    const base = estado()
    base.listas = [{ ...lista('ls1'), viagemId: 'v1' }]
    base.listaItens = [
      { ...itemLista('i1', 'ls1', 0), concluido: true, valorPago: 42 },
    ]

    const s = reducer(base, {
      type: 'TOGGLE_LISTA_ITEM',
      id: 'i1',
      concluido: false,
      em: '2026-02-02T10:00:00',
    })

    expect(s.listaItens[0].concluido).toBe(false)
    expect(s.listaItens[0].valorPago).toBe(42)
  })

  it('excluir a viagem preserva a lista e remove o vínculo', () => {
    const base = estado()
    base.listas = [{ ...lista('ls1'), viagemId: 'v1' }]
    base.listaItens = [itemLista('i1', 'ls1', 0)]

    const s = reducer(base, { type: 'DELETE_VIAGEM', id: 'v1' })
    expect(s.listas).toHaveLength(1)
    expect(s.listas[0].viagemId).toBeUndefined()
    expect(s.listaItens).toHaveLength(1)
  })
})

describe('TP-008 — múltiplos destinos', () => {
  it('novaViagem cria destinos ordenados e associa o primeiro dia', () => {
    const { viagem, dias, destinos } = novaViagem('u1', {
      nome: 'Europa',
      destino: 'Lisboa · Madri',
      comDatas: true,
      dataInicio: '2026-06-01',
      dataFim: '2026-06-10',
      destinos: [
        {
          nome: 'Lisboa',
          cidade: 'Lisboa',
          dataInicio: '2026-06-01',
          dataFim: '2026-06-05',
        },
        {
          nome: 'Madri',
          cidade: 'Madri',
          dataInicio: '2026-06-06',
          dataFim: '2026-06-10',
        },
      ],
    })

    expect(destinos).toHaveLength(2)
    expect(destinos[0]).toMatchObject({ nome: 'Lisboa', ordem: 0 })
    expect(destinos[1]).toMatchObject({ nome: 'Madri', ordem: 1 })
    expect(dias[0].destinoId).toBe(destinos[0].id)
    expect(viagem.destino).toBe('Lisboa · Madri')
  })

  it('remove destino e desassocia os dias sem apagar o roteiro', () => {
    const base = estado()
    base.destinos = [
      {
        id: 'dest1',
        viagemId: 'v1',
        nome: 'Gramado',
        ordem: 0,
      },
      {
        id: 'dest2',
        viagemId: 'v1',
        nome: 'Canela',
        ordem: 1,
      },
    ]
    base.dias[0].destinoId = 'dest1'
    base.dias[1].destinoId = 'dest2'

    const s = reducer(base, { type: 'DELETE_DESTINO', id: 'dest1' })
    expect(s.destinos.map((d) => d.id)).toEqual(['dest2'])
    expect(s.dias.find((d) => d.id === 'd1')?.destinoId).toBeUndefined()
    expect(s.roteiro).toHaveLength(1)
  })

  it('reordena destinos pela lista de ids', () => {
    const base = estado()
    base.destinos = [
      { id: 'dest1', viagemId: 'v1', nome: 'Gramado', ordem: 0 },
      { id: 'dest2', viagemId: 'v1', nome: 'Canela', ordem: 1 },
    ]

    const s = reducer(base, {
      type: 'REORDENAR_DESTINOS',
      viagemId: 'v1',
      ids: ['dest2', 'dest1'],
    })
    expect(s.destinos.find((d) => d.id === 'dest2')?.ordem).toBe(0)
    expect(s.destinos.find((d) => d.id === 'dest1')?.ordem).toBe(1)
  })

  it('novo dia herda o destino correspondente ao período', () => {
    const base = estado()
    base.destinos = [
      {
        id: 'dest1',
        viagemId: 'v1',
        nome: 'Gramado',
        ordem: 0,
        dataInicio: '2026-05-12',
        dataFim: '2026-05-13',
      },
      {
        id: 'dest2',
        viagemId: 'v1',
        nome: 'Canela',
        ordem: 1,
        dataInicio: '2026-05-14',
        dataFim: '2026-05-15',
      },
    ]

    const s = reducer(base, { type: 'ADD_DIA', viagemId: 'v1' })
    const novo = s.dias.find((d) => d.numero === 3)
    expect(novo?.data).toBe('2026-05-14')
    expect(novo?.destinoId).toBe('dest2')
  })

  it('recalcula o destino dos dias ao alterar as datas', () => {
    const base = estado()
    base.destinos = [
      {
        id: 'dest1',
        viagemId: 'v1',
        nome: 'Gramado',
        ordem: 0,
        dataInicio: '2026-06-01',
        dataFim: '2026-06-01',
      },
      {
        id: 'dest2',
        viagemId: 'v1',
        nome: 'Canela',
        ordem: 1,
        dataInicio: '2026-06-02',
        dataFim: '2026-06-02',
      },
    ]

    const s = reducer(base, {
      type: 'SET_DATAS',
      viagemId: 'v1',
      comDatas: true,
      dataInicio: '2026-06-01',
      dataFim: '2026-06-02',
    })

    expect(s.dias.find((d) => d.id === 'd1')?.destinoId).toBe('dest1')
    expect(s.dias.find((d) => d.id === 'd2')?.destinoId).toBe('dest2')
  })
})

describe('TP-009 — período da viagem', () => {
  function viagemNova(dataInicio?: string, dataFim?: string): TripViagem {
    return {
      id: 'v-nova',
      usuarioId: 'u1',
      nome: 'Nova viagem',
      destino: 'Lisboa',
      comDatas: true,
      dataInicio,
      dataFim,
      moeda: 'BRL',
      ativa: true,
      capaUrl: '',
      criadaEm: '2026-01-01T00:00:00',
    }
  }

  it('rejeita criar viagem com data final anterior à inicial', () => {
    const base = estado()
    const s = reducer(base, {
      type: 'ADD_VIAGEM',
      viagem: viagemNova('2026-05-15', '2026-05-12'),
      dias: [],
    })
    expect(s).toBe(base)
    expect(s.viagens).toHaveLength(2)
  })

  it('aceita criar viagem com período válido', () => {
    const base = estado()
    const s = reducer(base, {
      type: 'ADD_VIAGEM',
      viagem: viagemNova('2026-05-12', '2026-05-15'),
      dias: [],
    })
    expect(s.viagens).toHaveLength(3)
    expect(s.viagens.find((v) => v.id === 'v-nova')?.ativa).toBe(true)
  })

  it('rejeita edição que torne o período inválido', () => {
    const base = estado()
    const s = reducer(base, {
      type: 'UPDATE_VIAGEM',
      id: 'v1',
      patch: { dataInicio: '2026-05-20' },
    })
    expect(s).toBe(base)
    expect(s.viagens.find((v) => v.id === 'v1')?.dataInicio).toBe('2026-05-12')
  })

  it('aceita edição com período válido', () => {
    const base = estado()
    const s = reducer(base, {
      type: 'UPDATE_VIAGEM',
      id: 'v1',
      patch: { dataInicio: '2026-05-10', dataFim: '2026-05-20' },
    })
    expect(s.viagens.find((v) => v.id === 'v1')?.dataInicio).toBe('2026-05-10')
    expect(s.viagens.find((v) => v.id === 'v1')?.dataFim).toBe('2026-05-20')
  })

  it('não bloqueia alterações que não mexem no período', () => {
    const base = estado()
    base.viagens[0] = { ...base.viagens[0], dataFim: '2026-05-01' }

    const s = reducer(base, {
      type: 'UPDATE_VIAGEM',
      id: 'v1',
      patch: { ativa: true },
    })
    expect(s).not.toBe(base)
    expect(s.viagens.find((v) => v.id === 'v1')?.ativa).toBe(true)
  })

  it('rejeita definir datas com intervalo inválido sem perder o roteiro', () => {
    const base = estado()
    const s = reducer(base, {
      type: 'SET_DATAS',
      viagemId: 'v1',
      comDatas: true,
      dataInicio: '2026-06-10',
      dataFim: '2026-06-01',
    })
    expect(s).toBe(base)
    expect(s.dias.find((d) => d.id === 'd1')?.data).toBe('2026-05-12')
    expect(s.roteiro).toHaveLength(1)
  })

  it('rejeita definir datas sem a data final', () => {
    const base = estado()
    const s = reducer(base, {
      type: 'SET_DATAS',
      viagemId: 'v1',
      comDatas: true,
      dataInicio: '2026-06-01',
    })
    expect(s).toBe(base)
  })

  it('aplica período válido recalculando os dias', () => {
    const base = estado()
    const s = reducer(base, {
      type: 'SET_DATAS',
      viagemId: 'v1',
      comDatas: true,
      dataInicio: '2026-06-01',
      dataFim: '2026-06-05',
    })
    expect(s.dias.find((d) => d.id === 'd1')?.data).toBe('2026-06-01')
    expect(s.dias.find((d) => d.id === 'd2')?.data).toBe('2026-06-02')
    expect(s.viagens.find((v) => v.id === 'v1')?.dataFim).toBe('2026-06-05')
  })
})

describe('Task 6 — ordenação e conflitos', () => {
  it('pré-preenche horário do local quando não há conflito', () => {
    const s = reducer(estado(), {
      type: 'ADD_ROTEIRO',
      entrada: {
        id: 'r-l3',
        viagemId: 'v1',
        diaId: 'd1',
        tipoItem: 'LOCAL',
        itemId: 'l3',
      },
    })
    const entrada = s.roteiro.find((r) => r.id === 'r-l3')
    expect(entrada?.inicio).toBe('14:00')
    expect(entrada?.fim).toBe('15:00')
  })

  it('não pré-preenche horário quando haveria conflito', () => {
    const s = reducer(estado(), {
      type: 'ADD_ROTEIRO',
      entrada: {
        id: 'r-l2',
        viagemId: 'v1',
        diaId: 'd1',
        tipoItem: 'LOCAL',
        itemId: 'l2',
      },
    })
    const entrada = s.roteiro.find((r) => r.id === 'r-l2')
    expect(entrada?.inicio).toBeUndefined()
    expect(entrada?.fim).toBeUndefined()
  })

  it('ordena atividades após editar o horário', () => {
    const base = estado()
    base.roteiro = [
      { id: 'a', viagemId: 'v1', diaId: 'd1', tipoItem: 'LOCAL', itemId: 'l1', ordem: 0 },
      { id: 'b', viagemId: 'v1', diaId: 'd1', tipoItem: 'LOCAL', itemId: 'l3', ordem: 1 },
    ]
    const s = reducer(base, {
      type: 'UPDATE_ROTEIRO',
      id: 'b',
      patch: { inicio: '08:00', fim: '09:00' },
    })
    const porOrdem = [...s.roteiro].sort((x, y) => x.ordem - y.ordem)
    expect(porOrdem.map((r) => r.id)).toEqual(['b', 'a'])
  })

  it('permite atividades consecutivas e mantém a ordem cronológica', () => {
    const base = estado()
    base.roteiro = [
      { id: 'a', viagemId: 'v1', diaId: 'd1', tipoItem: 'LOCAL', itemId: 'l1', ordem: 0, inicio: '09:00', fim: '11:00' },
      { id: 'b', viagemId: 'v1', diaId: 'd1', tipoItem: 'LOCAL', itemId: 'l3', ordem: 1, inicio: '11:00', fim: '12:00' },
    ]
    const s = reducer(base, {
      type: 'UPDATE_ROTEIRO',
      id: 'b',
      patch: { inicio: '11:00', fim: '12:00' },
    })
    expect(s.roteiro).toHaveLength(2)
  })

  it('hospedagem com datas ocupa todos os dias do período', () => {
    const base = estado()
    base.hoteis = [
      {
        id: 'h1',
        viagemId: 'v1',
        nome: 'Hotel',
        checkin: '2026-05-12T14:00:00',
        checkout: '2026-05-14T12:00:00',
        valorTotal: 900,
      },
    ]
    const s = reducer(base, { type: 'ADD_HOTEL_AOS_DIAS', hotelId: 'h1' })
    const entradasHotel = s.roteiro.filter((r) => r.tipoItem === 'HOTEL')
    expect(entradasHotel).toHaveLength(2)
    expect(new Set(entradasHotel.map((r) => r.diaId))).toEqual(new Set(['d1', 'd2']))
  })

  it('novo dia dentro do período recebe a hospedagem já organizada', () => {
    const base = estado()
    base.hoteis = [
      {
        id: 'h1',
        viagemId: 'v1',
        nome: 'Hotel',
        checkin: '2026-05-12T14:00:00',
        checkout: '2026-05-15T12:00:00',
      },
    ]
    const comHotel = reducer(base, { type: 'ADD_HOTEL_AOS_DIAS', hotelId: 'h1' })
    const s = reducer(comHotel, { type: 'ADD_DIA', viagemId: 'v1' })
    const dias = s.dias
      .filter((d) => d.viagemId === 'v1')
      .sort((a, b) => a.numero - b.numero)
    const novoDia = dias[dias.length - 1]
    expect(novoDia.data).toBe('2026-05-14')
    expect(
      s.roteiro.filter((r) => r.tipoItem === 'HOTEL' && r.diaId === novoDia.id),
    ).toHaveLength(1)
  })

  it('hospedagem não organizada não aparece automaticamente em novos dias', () => {
    const base = estado()
    base.hoteis = [
      {
        id: 'h1',
        viagemId: 'v1',
        nome: 'Hotel',
        checkin: '2026-05-12T14:00:00',
        checkout: '2026-05-15T12:00:00',
      },
    ]
    const s = reducer(base, { type: 'ADD_DIA', viagemId: 'v1' })
    expect(s.roteiro.filter((r) => r.tipoItem === 'HOTEL')).toHaveLength(0)
    expect(s.roteiro).toHaveLength(1)
  })

  it('hospedagem em viagem sem datas não é distribuída', () => {
    const base = estado()
    base.hoteis = [
      {
        id: 'h1',
        viagemId: 'v2',
        nome: 'Hotel',
        checkin: '2026-05-12T14:00:00',
        checkout: '2026-05-14T12:00:00',
      },
    ]
    const s = reducer(base, { type: 'ADD_HOTEL_AOS_DIAS', hotelId: 'h1' })
    expect(s.roteiro.filter((r) => r.tipoItem === 'HOTEL')).toHaveLength(0)
  })
})

describe('TP-001 — bloqueio de conflitos', () => {
  it('rejeita adicionar passagem cujo horário natural conflita', () => {
    const base = estado()
    base.passagens = [
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

    const s = reducer(base, {
      type: 'ADD_ROTEIRO',
      entrada: {
        id: 'rp1',
        viagemId: 'v1',
        diaId: 'd1',
        tipoItem: 'PASSAGEM',
        itemId: 'p1',
      },
    })
    expect(s).toBe(base)
    expect(s.roteiro).toHaveLength(1)
  })

  it('rejeita editar horário para um intervalo conflitante', () => {
    const base = estado()
    base.roteiro = [
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
      {
        id: 'r2',
        viagemId: 'v1',
        diaId: 'd1',
        tipoItem: 'LOCAL',
        itemId: 'l3',
        ordem: 1,
        inicio: '13:00',
        fim: '14:00',
      },
    ]

    const s = reducer(base, {
      type: 'UPDATE_ROTEIRO',
      id: 'r1',
      patch: { inicio: '12:30', fim: '14:30' },
    })
    expect(s).toBe(base)
    expect(s.roteiro.find((r) => r.id === 'r1')?.inicio).toBe('09:00')
  })

  it('rejeita mover atividade com horário para dia onde conflita', () => {
    const base = estado()
    base.roteiro = [
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
      {
        id: 'r2',
        viagemId: 'v1',
        diaId: 'd2',
        tipoItem: 'LOCAL',
        itemId: 'l3',
        ordem: 0,
        inicio: '10:00',
        fim: '11:00',
      },
    ]

    const s = reducer(base, {
      type: 'MOVER_ROTEIRO',
      id: 'r1',
      paraDiaId: 'd2',
    })
    expect(s).toBe(base)
    expect(s.roteiro.find((r) => r.id === 'r1')?.diaId).toBe('d1')
  })

  it('permite mover quando não há sobreposição', () => {
    const base = estado()
    base.roteiro = [
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
      {
        id: 'r2',
        viagemId: 'v1',
        diaId: 'd2',
        tipoItem: 'LOCAL',
        itemId: 'l3',
        ordem: 0,
        inicio: '14:00',
        fim: '15:00',
      },
    ]

    const s = reducer(base, {
      type: 'MOVER_ROTEIRO',
      id: 'r1',
      paraDiaId: 'd2',
    })
    expect(s.roteiro.find((r) => r.id === 'r1')?.diaId).toBe('d2')
  })
})

describe('Task 4 — conclusão do roteiro', () => {
  it('marca e desmarca a conclusão preservando o registro', () => {
    const marcado = reducer(estado(), {
      type: 'UPDATE_ROTEIRO',
      id: 'r1',
      patch: { concluido: true },
    })
    expect(marcado.roteiro.find((r) => r.id === 'r1')?.concluido).toBe(true)

    const desmarcado = reducer(marcado, {
      type: 'UPDATE_ROTEIRO',
      id: 'r1',
      patch: { concluido: false },
    })
    expect(desmarcado.roteiro.find((r) => r.id === 'r1')?.concluido).toBe(false)
    expect(desmarcado.roteiro.find((r) => r.id === 'r1')?.inicio).toBe('09:00')
  })
})

describe('Persistência — compatibilidade de estados antigos', () => {
  it('infere comDatas e cria arrays ausentes sem perder dados', () => {
    const base = estado()
    const antigo = {
      ...base,
      viagens: [
        { ...base.viagens[0], comDatas: undefined },
        { ...base.viagens[1], comDatas: undefined },
      ],
      listas: undefined,
      listaItens: undefined,
    } as unknown as TripState

    const migrado = migrar(antigo)
    expect(migrado.viagens[0].comDatas).toBe(true)
    expect(migrado.viagens[1].comDatas).toBe(false)
    expect(migrado.destinos).toHaveLength(2)
    expect(migrado.dias.find((d) => d.id === 'd1')?.destinoId).toBe(
      'v1-destino-1',
    )
    expect(migrado.dias.find((d) => d.id === 'd3')?.destinoId).toBe(
      'v2-destino-1',
    )
    expect(migrado.listas).toEqual([])
    expect(migrado.listaItens).toEqual([])
    expect(migrado.roteiro).toHaveLength(1)
    expect(migrado.dias).toHaveLength(3)
  })
})

describe('Task 3 — listas', () => {
  it('marca conclusão com timestamp e limpa ao reabrir', () => {
    const base = estado()
    base.listas = [lista('ls1')]
    base.listaItens = [itemLista('i1', 'ls1', 0)]

    const marcado = reducer(base, {
      type: 'TOGGLE_LISTA_ITEM',
      id: 'i1',
      concluido: true,
      em: '2026-02-01T10:00:00',
    })
    expect(marcado.listaItens[0].concluido).toBe(true)
    expect(marcado.listaItens[0].concluidoEm).toBe('2026-02-01T10:00:00')

    const reaberto = reducer(marcado, {
      type: 'TOGGLE_LISTA_ITEM',
      id: 'i1',
      concluido: false,
      em: '2026-02-02T10:00:00',
    })
    expect(reaberto.listaItens[0].concluido).toBe(false)
    expect(reaberto.listaItens[0].concluidoEm).toBeUndefined()
  })

  it('excluir a lista exclui os itens (sem órfãos)', () => {
    const base = estado()
    base.listas = [lista('ls1'), lista('ls2')]
    base.listaItens = [
      itemLista('i1', 'ls1', 0),
      itemLista('i2', 'ls1', 1),
      itemLista('i3', 'ls2', 0),
    ]
    const s = reducer(base, { type: 'DELETE_LISTA', id: 'ls1' })
    expect(s.listas.map((l) => l.id)).toEqual(['ls2'])
    expect(s.listaItens.map((i) => i.id)).toEqual(['i3'])
  })
})
