import type {
  ID,
  TripDestino,
  TripDia,
  TripHotel,
  TripLista,
  TripListaItem,
  TripLocal,
  TripPassagem,
  TripRoteiro,
  TripState,
  TripViagem,
} from '../types'
import { estadoInicial, estadoVazio } from '../data/seed'

/* ------------------------------------------------------------------ */
/* Identificadores                                                     */
/* ------------------------------------------------------------------ */
export function uid(prefixo = 'id'): string {
  const rand =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10)
  return `${prefixo}-${rand}`
}

/* ------------------------------------------------------------------ */
/* Ações                                                               */
/* ------------------------------------------------------------------ */
export type RoteiroEntrada = Omit<TripRoteiro, 'ordem'>

export type Action =
  | { type: 'SET_ATIVA'; viagemId: ID }
  | { type: 'ADD_VIAGEM'; viagem: TripViagem; dias: TripDia[]; destinos?: TripDestino[] }
  | { type: 'UPDATE_VIAGEM'; id: ID; patch: Partial<TripViagem> }
  | { type: 'DELETE_VIAGEM'; id: ID }
  | { type: 'ADD_DESTINO'; destino: TripDestino }
  | { type: 'UPDATE_DESTINO'; id: ID; patch: Partial<TripDestino> }
  | { type: 'DELETE_DESTINO'; id: ID }
  | { type: 'REORDENAR_DESTINOS'; viagemId: ID; ids: ID[] }
  | {
      type: 'SET_DATAS'
      viagemId: ID
      comDatas: boolean
      dataInicio?: string
      dataFim?: string
    }
  | { type: 'UPDATE_DIA'; id: ID; patch: Partial<TripDia> }
  | { type: 'ADD_DIA'; viagemId: ID }
  | { type: 'DELETE_DIA'; id: ID }
  | { type: 'ADD_LOCAL'; local: TripLocal }
  | { type: 'UPDATE_LOCAL'; id: ID; patch: Partial<TripLocal> }
  | { type: 'DELETE_LOCAL'; id: ID }
  | { type: 'ADD_PASSAGEM'; passagem: TripPassagem }
  | { type: 'UPDATE_PASSAGEM'; id: ID; patch: Partial<TripPassagem> }
  | { type: 'DELETE_PASSAGEM'; id: ID }
  | { type: 'ADD_HOTEL'; hotel: TripHotel }
  | { type: 'UPDATE_HOTEL'; id: ID; patch: Partial<TripHotel> }
  | { type: 'DELETE_HOTEL'; id: ID }
  | { type: 'ADD_ROTEIRO'; entrada: RoteiroEntrada }
  | { type: 'ADD_HOTEL_AOS_DIAS'; hotelId: ID }
  | { type: 'UPDATE_ROTEIRO'; id: ID; patch: Partial<TripRoteiro> }
  | { type: 'REMOVE_ROTEIRO'; id: ID }
  | { type: 'MOVER_ROTEIRO'; id: ID; paraDiaId: ID }
  | { type: 'REORDENAR_DIA'; diaId: ID; ids: ID[] }
  | { type: 'ADD_LISTA'; lista: TripLista }
  | { type: 'UPDATE_LISTA'; id: ID; patch: Partial<TripLista> }
  | { type: 'DELETE_LISTA'; id: ID }
  | { type: 'ADD_LISTA_ITEM'; item: TripListaItem }
  | { type: 'UPDATE_LISTA_ITEM'; id: ID; patch: Partial<TripListaItem> }
  | { type: 'DELETE_LISTA_ITEM'; id: ID }
  | { type: 'TOGGLE_LISTA_ITEM'; id: ID; concluido: boolean; em: string }
  | {
      type: 'CONCLUIR_LISTA_ITEM'
      id: ID
      valorPago?: number
      em: string
    }
  | { type: 'RESET'; state: TripState }

/* ------------------------------------------------------------------ */
/* Fábricas de entidades (geram IDs fora do reducer)                    */
/* ------------------------------------------------------------------ */
export interface DadosDestino {
  nome: string
  cidade?: string
  pais?: string
  dataInicio?: string
  dataFim?: string
  lat?: number
  lng?: number
}

export interface DadosNovaViagem {
  nome: string
  destino: string
  comDatas: boolean
  dataInicio?: string
  dataFim?: string
  moeda?: TripViagem['moeda']
  capaUrl?: string
  destinos?: DadosDestino[]
}

/**
 * Cria uma viagem que SEMPRE começa com um único card de dia (Task 5.2).
 * Com datas, esse primeiro dia recebe a data de início; os demais dias são
 * adicionados manualmente pelo usuário.
 */
export function novaViagem(
  usuarioId: ID,
  dados: DadosNovaViagem,
): { viagem: TripViagem; dias: TripDia[]; destinos: TripDestino[] } {
  const id = uid('v')
  const comDatas = dados.comDatas && !!dados.dataInicio && !!dados.dataFim
  const entradasDestino =
    dados.destinos?.length
      ? dados.destinos
      : [{ nome: dados.destino, cidade: dados.destino }]

  const destinos: TripDestino[] = entradasDestino.map((destino, indice) => ({
    id: `${id}-dest${indice + 1}`,
    viagemId: id,
    nome: destino.nome,
    cidade: destino.cidade,
    pais: destino.pais,
    ordem: indice,
    dataInicio: comDatas ? destino.dataInicio : undefined,
    dataFim: comDatas ? destino.dataFim : undefined,
    lat: destino.lat,
    lng: destino.lng,
  }))

  const viagem: TripViagem = {
    id,
    usuarioId,
    nome: dados.nome,
    destino: dados.destino,
    comDatas,
    dataInicio: comDatas ? dados.dataInicio : undefined,
    dataFim: comDatas ? dados.dataFim : undefined,
    moeda: dados.moeda ?? 'BRL',
    ativa: true,
    capaUrl: dados.capaUrl ?? '',
    criadaEm: new Date().toISOString(),
  }
  const diaInicial: TripDia = {
    id: `${id}-d1`,
    viagemId: id,
    numero: 1,
    data: comDatas ? dados.dataInicio : undefined,
    destinoId: destinos[0]?.id,
  }
  return { viagem, dias: [diaInicial], destinos }
}

export function resetarSeed(): Action {
  return { type: 'RESET', state: estadoInicial() }
}

export function limparTudo(): Action {
  return { type: 'RESET', state: estadoVazio() }
}
