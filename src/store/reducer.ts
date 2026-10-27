import type { ID, TripDestino, TripDia, TripRoteiro, TripState } from '../types'
import { addDias, diasEntre, hhmmToMin, horaDe, minToHhmm } from '../lib/format'
import { ordenarPorHorario } from '../lib/roteiro'
import {
  conflitoAoAdicionar,
  encontrarConflito,
  roteiroDoDia,
} from '../lib/derive'
import { periodoValido } from '../lib/validacao'
import { uid, type Action } from './tripModel'

function proximaOrdem(roteiro: TripRoteiro[], diaId: ID): number {
  const ordens = roteiro.filter((r) => r.diaId === diaId).map((r) => r.ordem)
  return ordens.length ? Math.max(...ordens) + 1 : 0
}

function jaVinculado(
  roteiro: TripRoteiro[],
  diaId: ID,
  tipoItem: TripRoteiro['tipoItem'],
  itemId: ID,
): boolean {
  return roteiro.some(
    (r) => r.diaId === diaId && r.tipoItem === tipoItem && r.itemId === itemId,
  )
}

/**
 * Horário sugerido ao vincular um item a um dia, a partir das estimativas do
 * próprio registro. Só sugere quando NÃO há conflito no dia — nunca grava um
 * horário que sobreponha outra atividade (Task 6).
 */
function horarioSugerido(
  state: TripState,
  entrada: { diaId: ID; tipoItem: TripRoteiro['tipoItem']; itemId: ID },
): { inicio: string; fim?: string } | null {
  const doDia = roteiroDoDia(state, entrada.diaId)

  if (entrada.tipoItem === 'LOCAL') {
    const local = state.locais.find((l) => l.id === entrada.itemId)
    const inicio = hhmmToMin(local?.horarioPrevisto)
    if (inicio == null) return null

    const fimNatural = hhmmToMin(local?.horarioFim)
    const fim =
      fimNatural != null && fimNatural > inicio
        ? fimNatural
        : local?.duracaoMin
          ? inicio + local.duracaoMin
          : null

    if (fim == null) return { inicio: local!.horarioPrevisto! }
    if (encontrarConflito(doDia, { inicio, fim })) return null
    return { inicio: local!.horarioPrevisto!, fim: minToHhmm(fim) }
  }

  if (entrada.tipoItem === 'PASSAGEM') {
    const passagem = state.passagens.find((p) => p.id === entrada.itemId)
    if (!passagem) return null
    const dia = state.dias.find((d) => d.id === entrada.diaId)
    if (dia?.data && passagem.partida.slice(0, 10) !== dia.data) return null
    const inicio = hhmmToMin(horaDe(passagem.partida))
    if (inicio == null) return null
    const horaChegada = passagem.chegada ? hhmmToMin(horaDe(passagem.chegada)) : null
    const fim = horaChegada != null && horaChegada > inicio ? horaChegada : null
    if (fim != null) {
      if (encontrarConflito(doDia, { inicio, fim })) return null
      return { inicio: horaDe(passagem.partida)!, fim: minToHhmm(fim) }
    }
    return { inicio: horaDe(passagem.partida)! }
  }

  return null
}

export function reducer(state: TripState, action: Action): TripState {
  switch (action.type) {
    case 'SET_ATIVA':
      return {
        ...state,
        viagens: state.viagens.map((v) => ({
          ...v,
          ativa: v.id === action.viagemId,
        })),
      }

    case 'ADD_VIAGEM': {
      if (
        action.viagem.comDatas &&
        !periodoValido(action.viagem.dataInicio, action.viagem.dataFim)
      ) {
        return state
      }
      return {
        ...state,
        viagens: [
          ...state.viagens.map((v) => ({ ...v, ativa: false })),
          { ...action.viagem, ativa: true },
        ],
        destinos: [...state.destinos, ...(action.destinos ?? [])],
        dias: [...state.dias, ...action.dias],
      }
    }

    case 'UPDATE_VIAGEM': {
      const atual = state.viagens.find((v) => v.id === action.id)
      if (!atual) return state

      const proxima = { ...atual, ...action.patch }
      const alteraPeriodo =
        'comDatas' in action.patch ||
        'dataInicio' in action.patch ||
        'dataFim' in action.patch

      if (
        alteraPeriodo &&
        proxima.comDatas &&
        !periodoValido(proxima.dataInicio, proxima.dataFim)
      ) {
        return state
      }

      return {
        ...state,
        viagens: state.viagens.map((v) =>
          v.id === action.id ? proxima : v,
        ),
      }
    }

    case 'DELETE_VIAGEM':
      return {
        ...state,
        viagens: state.viagens.filter((v) => v.id !== action.id),
        destinos: state.destinos.filter((d) => d.viagemId !== action.id),
        dias: state.dias.filter((d) => d.viagemId !== action.id),
        locais: state.locais.filter((l) => l.viagemId !== action.id),
        passagens: state.passagens.filter((p) => p.viagemId !== action.id),
        hoteis: state.hoteis.filter((h) => h.viagemId !== action.id),
        roteiro: state.roteiro.filter((r) => r.viagemId !== action.id),
        listas: state.listas.map((l) =>
          l.viagemId === action.id ? { ...l, viagemId: undefined } : l,
        ),
      }

    case 'ADD_DESTINO':
      return { ...state, destinos: [...state.destinos, action.destino] }

    case 'UPDATE_DESTINO':
      return {
        ...state,
        destinos: state.destinos.map((d) =>
          d.id === action.id ? { ...d, ...action.patch } : d,
        ),
      }

    case 'DELETE_DESTINO':
      return {
        ...state,
        destinos: state.destinos.filter((d) => d.id !== action.id),
        dias: state.dias.map((d) =>
          d.destinoId === action.id ? { ...d, destinoId: undefined } : d,
        ),
      }

    case 'REORDENAR_DESTINOS': {
      const posicao = new Map(action.ids.map((id, i) => [id, i] as const))
      return {
        ...state,
        destinos: state.destinos.map((d) =>
          d.viagemId === action.viagemId
            ? { ...d, ordem: posicao.get(d.id) ?? d.ordem }
            : d,
        ),
      }
    }

    /* Define/altera as datas preservando dias e atividades já cadastrados. */
    case 'SET_DATAS': {
      if (action.comDatas && !periodoValido(action.dataInicio, action.dataFim)) {
        return state
      }
      const comDatas = action.comDatas
      return {
        ...state,
        viagens: state.viagens.map((v) =>
          v.id === action.viagemId
            ? {
                ...v,
                comDatas,
                dataInicio: comDatas ? action.dataInicio : undefined,
                dataFim: comDatas ? action.dataFim : undefined,
              }
            : v,
        ),
        dias: state.dias.map((d) => {
          if (d.viagemId !== action.viagemId) return d

          const data =
            comDatas && action.dataInicio
              ? addDias(action.dataInicio, d.numero - 1)
              : undefined
          const destino = state.destinos.find(
            (destino) =>
              destino.viagemId === action.viagemId &&
              !!data &&
              !!destino.dataInicio &&
              !!destino.dataFim &&
              data >= destino.dataInicio &&
              data <= destino.dataFim,
          )

          return {
            ...d,
            data,
            destinoId: destino?.id ?? d.destinoId,
          }
        }),
      }
    }

    case 'UPDATE_DIA':
      return {
        ...state,
        dias: state.dias.map((d) =>
          d.id === action.id ? { ...d, ...action.patch } : d,
        ),
      }

    case 'ADD_DIA': {
      const viagem = state.viagens.find((v) => v.id === action.viagemId)
      if (!viagem) return state
      const doDia = state.dias
        .filter((d) => d.viagemId === action.viagemId)
        .sort((a, b) => a.numero - b.numero)
      const numero = doDia.length
        ? Math.max(...doDia.map((d) => d.numero)) + 1
        : 1
      const ultimo = doDia[doDia.length - 1]
      let data: string | undefined
      if (viagem.comDatas) {
        if (ultimo?.data) data = addDias(ultimo.data, 1)
        else if (viagem.dataInicio) data = addDias(viagem.dataInicio, numero - 1)
      }
      const destinos = state.destinos
        .filter((destino) => destino.viagemId === action.viagemId)
        .sort((a, b) => a.ordem - b.ordem)
      const destinoDaData = data
        ? destinos.find(
            (destino) =>
              !!destino.dataInicio &&
              !!destino.dataFim &&
              data! >= destino.dataInicio &&
              data! <= destino.dataFim,
          )
        : undefined

      const novo: TripDia = {
        id: uid('d'),
        viagemId: action.viagemId,
        numero,
        data,
        destinoId: destinoDaData?.id ?? ultimo?.destinoId ?? destinos[0]?.id,
      }

      /* Hospedagem já organizada acompanha os novos dias dentro do período. */
      let roteiro = state.roteiro
      if (novo.data) {
        const hoteisOrganizados = state.hoteis.filter(
          (h) =>
            h.viagemId === action.viagemId &&
            state.roteiro.some(
              (r) => r.tipoItem === 'HOTEL' && r.itemId === h.id,
            ),
        )
        for (const hotel of hoteisOrganizados) {
          const inicio = hotel.checkin.slice(0, 10)
          const fim = hotel.checkout.slice(0, 10)
          if (
            novo.data! >= inicio &&
            novo.data! < fim &&
            !jaVinculado(roteiro, novo.id, 'HOTEL', hotel.id)
          ) {
            roteiro = [
              ...roteiro,
              {
                id: uid('r'),
                viagemId: action.viagemId,
                diaId: novo.id,
                tipoItem: 'HOTEL',
                itemId: hotel.id,
                ordem: proximaOrdem(roteiro, novo.id),
              },
            ]
          }
        }
      }

      return { ...state, dias: [...state.dias, novo], roteiro }
    }

    case 'DELETE_DIA': {
      const dia = state.dias.find((d) => d.id === action.id)
      if (!dia) return state
      const viagem = state.viagens.find((v) => v.id === dia.viagemId)
      const restantes = state.dias
        .filter((d) => d.viagemId === dia.viagemId && d.id !== action.id)
        .sort((a, b) => a.numero - b.numero)
        .map((d, i) => ({
          ...d,
          numero: i + 1,
          data:
            viagem?.comDatas && viagem.dataInicio
              ? addDias(viagem.dataInicio, i)
              : d.data,
        }))
      return {
        ...state,
        dias: [
          ...state.dias.filter((d) => d.viagemId !== dia.viagemId),
          ...restantes,
        ],
        roteiro: state.roteiro.filter((r) => r.diaId !== action.id),
      }
    }

    case 'ADD_LOCAL':
      return { ...state, locais: [...state.locais, action.local] }
    case 'UPDATE_LOCAL':
      return {
        ...state,
        locais: state.locais.map((l) =>
          l.id === action.id ? { ...l, ...action.patch } : l,
        ),
      }
    case 'DELETE_LOCAL':
      return {
        ...state,
        locais: state.locais.filter((l) => l.id !== action.id),
        roteiro: state.roteiro.filter(
          (r) => !(r.tipoItem === 'LOCAL' && r.itemId === action.id),
        ),
      }

    case 'ADD_PASSAGEM':
      return { ...state, passagens: [...state.passagens, action.passagem] }
    case 'UPDATE_PASSAGEM':
      return {
        ...state,
        passagens: state.passagens.map((p) =>
          p.id === action.id ? { ...p, ...action.patch } : p,
        ),
      }
    case 'DELETE_PASSAGEM':
      return {
        ...state,
        passagens: state.passagens.filter((p) => p.id !== action.id),
        roteiro: state.roteiro.filter(
          (r) => !(r.tipoItem === 'PASSAGEM' && r.itemId === action.id),
        ),
      }

    case 'ADD_HOTEL':
      return { ...state, hoteis: [...state.hoteis, action.hotel] }
    case 'UPDATE_HOTEL':
      return {
        ...state,
        hoteis: state.hoteis.map((h) =>
          h.id === action.id ? { ...h, ...action.patch } : h,
        ),
      }
    case 'DELETE_HOTEL':
      return {
        ...state,
        hoteis: state.hoteis.filter((h) => h.id !== action.id),
        roteiro: state.roteiro.filter(
          (r) => !(r.tipoItem === 'HOTEL' && r.itemId === action.id),
        ),
      }

    case 'ADD_ROTEIRO': {
      const { entrada } = action
      if (
        jaVinculado(
          state.roteiro,
          entrada.diaId,
          entrada.tipoItem,
          entrada.itemId,
        )
      ) {
        return state
      }
      const nova: TripRoteiro = {
        ...entrada,
        ordem: proximaOrdem(state.roteiro, entrada.diaId),
      }
      const tinhaHorario = !!entrada.inicio
      if (!nova.inicio) {
        const sugerido = horarioSugerido(state, nova)
        if (sugerido) {
          nova.inicio = sugerido.inicio
          nova.fim = sugerido.fim
        }
      }
      if (tinhaHorario || nova.tipoItem === 'PASSAGEM') {
        if (conflitoAoAdicionar(state, nova)) return state
      }
      return {
        ...state,
        roteiro: ordenarPorHorario([...state.roteiro, nova], nova.diaId),
      }
    }

    /* Hospedagem vigora em todos os dias do período (checkin → checkout-1),
       como cards independentes vinculados ao MESMO registro de hotel. */
    case 'ADD_HOTEL_AOS_DIAS': {
      const hotel = state.hoteis.find((h) => h.id === action.hotelId)
      if (!hotel) return state
      const inicio = hotel.checkin.slice(0, 10)
      const fim = addDias(hotel.checkout.slice(0, 10), -1)
      const totalNoites = Math.max(0, diasEntre(inicio, fim))
      const diasAlvo = state.dias
        .filter((d) => d.viagemId === hotel.viagemId)
        .filter((d) => d.data && d.data >= inicio && d.data <= fim)
        .slice(0, totalNoites + 1)

      let roteiro = [...state.roteiro]
      const diasTocados: ID[] = []
      for (const dia of diasAlvo) {
        if (!jaVinculado(roteiro, dia.id, 'HOTEL', hotel.id)) {
          roteiro = [
            ...roteiro,
            {
              id: uid('r'),
              viagemId: hotel.viagemId,
              diaId: dia.id,
              tipoItem: 'HOTEL',
              itemId: hotel.id,
              ordem: proximaOrdem(roteiro, dia.id),
            },
          ]
          diasTocados.push(dia.id)
        }
      }
      for (const diaId of diasTocados) roteiro = ordenarPorHorario(roteiro, diaId)
      return { ...state, roteiro }
    }

    case 'UPDATE_ROTEIRO': {
      const atual = state.roteiro.find((r) => r.id === action.id)
      if (!atual) return state

      const proxima = { ...atual, ...action.patch }
      const alteraHorario =
        'inicio' in action.patch || 'fim' in action.patch

      if (alteraHorario && proxima.inicio) {
        if (conflitoAoAdicionar(state, proxima)) return state
      }

      const roteiro = state.roteiro.map((r) =>
        r.id === action.id ? proxima : r,
      )
      return {
        ...state,
        roteiro: ordenarPorHorario(roteiro, proxima.diaId),
      }
    }

    case 'REMOVE_ROTEIRO':
      return {
        ...state,
        roteiro: state.roteiro.filter((r) => r.id !== action.id),
      }

    case 'MOVER_ROTEIRO': {
      const alvo = state.roteiro.find((r) => r.id === action.id)
      if (!alvo) return state
      if (
        jaVinculado(state.roteiro, action.paraDiaId, alvo.tipoItem, alvo.itemId)
      ) {
        return state
      }
      if (
        alvo.inicio &&
        conflitoAoAdicionar(state, {
          id: alvo.id,
          diaId: action.paraDiaId,
          tipoItem: alvo.tipoItem,
          itemId: alvo.itemId,
          inicio: alvo.inicio,
          fim: alvo.fim,
        })
      ) {
        return state
      }
      const roteiro = ordenarPorHorario(
        state.roteiro.map((r) =>
          r.id === action.id
            ? {
                ...r,
                diaId: action.paraDiaId,
                ordem: proximaOrdem(state.roteiro, action.paraDiaId),
              }
            : r,
        ),
        action.paraDiaId,
      )
      return { ...state, roteiro }
    }

    case 'REORDENAR_DIA': {
      const roteiro = state.roteiro.map((r) =>
        r.diaId === action.diaId
          ? { ...r, ordem: action.ids.indexOf(r.id) }
          : r,
      )
      /* mantém a consistência: itens com horário voltam à ordem cronológica */
      return { ...state, roteiro: ordenarPorHorario(roteiro, action.diaId) }
    }

    /* --- Listas personalizadas -------------------------------------- */
    case 'ADD_LISTA':
      return { ...state, listas: [...state.listas, action.lista] }

    case 'UPDATE_LISTA':
      return {
        ...state,
        listas: state.listas.map((l) =>
          l.id === action.id ? { ...l, ...action.patch } : l,
        ),
      }

    /* Excluir a lista exclui os itens — nunca deixa itens órfãos. */
    case 'DELETE_LISTA':
      return {
        ...state,
        listas: state.listas.filter((l) => l.id !== action.id),
        listaItens: state.listaItens.filter((i) => i.listaId !== action.id),
      }

    case 'ADD_LISTA_ITEM':
      return { ...state, listaItens: [...state.listaItens, action.item] }

    case 'UPDATE_LISTA_ITEM':
      return {
        ...state,
        listaItens: state.listaItens.map((i) =>
          i.id === action.id ? { ...i, ...action.patch } : i,
        ),
      }

    case 'DELETE_LISTA_ITEM':
      return {
        ...state,
        listaItens: state.listaItens.filter((i) => i.id !== action.id),
      }

    case 'TOGGLE_LISTA_ITEM':
      return {
        ...state,
        listaItens: state.listaItens.map((i) =>
          i.id === action.id
            ? {
                ...i,
                concluido: action.concluido,
                concluidoEm: action.concluido ? action.em : undefined,
              }
            : i,
        ),
      }

    case 'CONCLUIR_LISTA_ITEM':
      return {
        ...state,
        listaItens: state.listaItens.map((i) =>
          i.id === action.id
            ? {
                ...i,
                concluido: true,
                concluidoEm: action.em,
                valorPago: action.valorPago,
                pagoEm:
                  action.valorPago != null ? action.em : undefined,
              }
            : i,
        ),
      }

    case 'RESET':
      return action.state

    default:
      return state
  }
}

/** Compatibiliza estados antigos (sem comDatas/destinos/listas) sem perder dados. */
export function migrar(state: TripState): TripState {
  const viagens = (state.viagens ?? []).map((v) => ({
    ...v,
    comDatas: v.comDatas ?? !!v.dataInicio,
  }))

  const destinos: TripDestino[] = [...(state.destinos ?? [])]
  for (const viagem of viagens) {
    if (!destinos.some((d) => d.viagemId === viagem.id)) {
      destinos.push({
        id: `${viagem.id}-destino-1`,
        viagemId: viagem.id,
        nome: viagem.destino,
        cidade: viagem.destino,
        ordem: 0,
        dataInicio: viagem.dataInicio,
        dataFim: viagem.dataFim,
      })
    }
  }

  const dias = (state.dias ?? []).map((dia) => {
    if (dia.destinoId) return dia
    const primeiro = destinos.find((d) => d.viagemId === dia.viagemId)
    return primeiro ? { ...dia, destinoId: primeiro.id } : dia
  })

  return {
    ...state,
    viagens,
    destinos,
    dias,
    locais: state.locais ?? [],
    passagens: state.passagens ?? [],
    hoteis: state.hoteis ?? [],
    roteiro: state.roteiro ?? [],
    listas: state.listas ?? [],
    listaItens: (state.listaItens ?? []).map((item) => ({
      ...item,
      valorPrevisto: item.valorPrevisto ?? item.valor,
    })),
  }
}
