import { api, listarTudo } from './client'
import type {
  DestinoApi,
  DiaApi,
  HotelApi,
  ListaApi,
  ListaItemApi,
  LocalApi,
  PassagemApi,
  ResumoApi,
  RoteiroApi,
  SessaoApi,
  UsuarioApi,
  ViagemApi,
} from './types'

/* ------------------------------------------------------------------ */
/* Autenticação                                                        */
/* ------------------------------------------------------------------ */
export function entrar(email: string, senha: string): Promise<SessaoApi> {
  return api<SessaoApi>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, senha }),
  })
}

export function registrar(nome: string, email: string, senha: string): Promise<SessaoApi> {
  return api<SessaoApi>('/auth/registrar', {
    method: 'POST',
    body: JSON.stringify({ nome, email, senha }),
  })
}

export function usuarioAtual(): Promise<UsuarioApi> {
  return api<UsuarioApi>('/auth/me')
}

export function encerrarSessao(): Promise<void> {
  return api<void>('/auth/logout', { method: 'POST' })
}

/* ------------------------------------------------------------------ */
/* Viagens                                                             */
/* ------------------------------------------------------------------ */
export interface DadosViagemApi {
  nome: string
  destino: string
  comDatas: boolean
  dataInicio?: string
  dataFim?: string
  moeda?: string
  capaUrl?: string
}

export function listarViagens(): Promise<ViagemApi[]> {
  return listarTudo<ViagemApi>('/viagens')
}

export function criarViagem(dados: DadosViagemApi): Promise<ViagemApi> {
  return api<ViagemApi>('/viagens', { method: 'POST', body: JSON.stringify(dados) })
}

export function atualizarViagem(id: number, dados: DadosViagemApi): Promise<ViagemApi> {
  return api<ViagemApi>(`/viagens/${id}`, {
    method: 'PUT',
    body: JSON.stringify(dados),
  })
}

export function excluirViagem(id: number): Promise<void> {
  return api<void>(`/viagens/${id}`, { method: 'DELETE' })
}

export function ativarViagem(id: number): Promise<ViagemApi> {
  return api<ViagemApi>(`/viagens/${id}/ativa`, { method: 'PUT' })
}

export function resumoViagem(id: number): Promise<ResumoApi> {
  return api<ResumoApi>(`/viagens/${id}/resumo`)
}

/* ------------------------------------------------------------------ */
/* Dias                                                                */
/* ------------------------------------------------------------------ */
export interface DadosDiaApi {
  data?: string | null
  titulo?: string | null
  destinoId?: number | null
  numeroDia?: number
}

export function listarDias(viagemId: number): Promise<DiaApi[]> {
  return api<DiaApi[]>(`/viagens/${viagemId}/dias`)
}

export function criarDia(viagemId: number, dados: DadosDiaApi = {}): Promise<DiaApi> {
  return api<DiaApi>(`/viagens/${viagemId}/dias`, {
    method: 'POST',
    body: JSON.stringify(dados),
  })
}

export function atualizarDia(id: number, dados: DadosDiaApi): Promise<DiaApi> {
  return api<DiaApi>(`/dias/${id}`, { method: 'PUT', body: JSON.stringify(dados) })
}

export function excluirDia(id: number): Promise<void> {
  return api<void>(`/dias/${id}`, { method: 'DELETE' })
}

/* ------------------------------------------------------------------ */
/* Destinos                                                            */
/* ------------------------------------------------------------------ */
export interface DadosDestinoApi {
  nome: string
  cidade?: string | null
  pais?: string | null
  ordem?: number
  dataInicio?: string | null
  dataFim?: string | null
  lat?: number | null
  lng?: number | null
}

export function listarDestinos(viagemId: number): Promise<DestinoApi[]> {
  return api<DestinoApi[]>(`/viagens/${viagemId}/destinos`)
}

export function criarDestino(viagemId: number, dados: DadosDestinoApi): Promise<DestinoApi> {
  return api<DestinoApi>(`/viagens/${viagemId}/destinos`, {
    method: 'POST',
    body: JSON.stringify(dados),
  })
}

export function atualizarDestino(id: number, dados: DadosDestinoApi): Promise<DestinoApi> {
  return api<DestinoApi>(`/destinos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(dados),
  })
}

export function excluirDestino(id: number): Promise<void> {
  return api<void>(`/destinos/${id}`, { method: 'DELETE' })
}

export function reordenarDestinos(viagemId: number, ids: number[]): Promise<DestinoApi[]> {
  return api<DestinoApi[]>(`/viagens/${viagemId}/destinos/reordenar`, {
    method: 'PUT',
    body: JSON.stringify({ ids }),
  })
}

/* ------------------------------------------------------------------ */
/* Locais                                                              */
/* ------------------------------------------------------------------ */
export interface DadosLocalApi {
  nome: string
  endereco?: string | null
  cidade?: string | null
  categoria?: string | null
  horarioPrevisto?: string | null
  horarioFim?: string | null
  horarioAbertura?: string | null
  horarioFechamento?: string | null
  duracaoEstimada?: number | null
  custo?: number | null
  observacoes?: string | null
  fotoUrl?: string | null
  lat?: number | null
  lng?: number | null
  geoStatus?: string | null
}

export function listarLocais(viagemId: number): Promise<LocalApi[]> {
  return listarTudo<LocalApi>(`/viagens/${viagemId}/locais`)
}

export function criarLocal(viagemId: number, dados: DadosLocalApi): Promise<LocalApi> {
  return api<LocalApi>(`/viagens/${viagemId}/locais`, {
    method: 'POST',
    body: JSON.stringify(dados),
  })
}

export function atualizarLocal(id: number, dados: DadosLocalApi): Promise<LocalApi> {
  return api<LocalApi>(`/locais/${id}`, { method: 'PUT', body: JSON.stringify(dados) })
}

export function excluirLocal(id: number): Promise<void> {
  return api<void>(`/locais/${id}`, { method: 'DELETE' })
}

/* ------------------------------------------------------------------ */
/* Passagens                                                           */
/* ------------------------------------------------------------------ */
export interface DadosPassagemApi {
  tipo: string
  origem: string
  destino: string
  dataHoraPartida: string
  dataHoraChegada?: string | null
  companhia?: string | null
  localizador?: string | null
  numeroBilhete?: string | null
  passageiro?: string | null
  classe?: string | null
  terminal?: string | null
  assento?: string | null
  moeda?: string | null
  valor?: number | null
  documentoHash?: string | null
  importadoDe?: 'pdf' | 'imagem' | 'manual' | null
}

export function listarPassagens(viagemId: number): Promise<PassagemApi[]> {
  return listarTudo<PassagemApi>(`/viagens/${viagemId}/passagens`)
}

export function criarPassagem(
  viagemId: number,
  dados: DadosPassagemApi,
): Promise<PassagemApi> {
  return api<PassagemApi>(`/viagens/${viagemId}/passagens`, {
    method: 'POST',
    body: JSON.stringify(dados),
  })
}

export function atualizarPassagem(id: number, dados: DadosPassagemApi): Promise<PassagemApi> {
  return api<PassagemApi>(`/passagens/${id}`, {
    method: 'PUT',
    body: JSON.stringify(dados),
  })
}

export function excluirPassagem(id: number): Promise<void> {
  return api<void>(`/passagens/${id}`, { method: 'DELETE' })
}

/* ------------------------------------------------------------------ */
/* Hotéis                                                              */
/* ------------------------------------------------------------------ */
export interface DadosHotelApi {
  nome: string
  endereco?: string | null
  cidade?: string | null
  dataHoraCheckin: string
  dataHoraCheckout: string
  valorNoite?: number | null
  noites?: number | null
  valorTotal?: number | null
  reserva?: string | null
  fotoUrl?: string | null
  lat?: number | null
  lng?: number | null
  geoStatus?: string | null
}

export function listarHoteis(viagemId: number): Promise<HotelApi[]> {
  return listarTudo<HotelApi>(`/viagens/${viagemId}/hoteis`)
}

export function criarHotel(viagemId: number, dados: DadosHotelApi): Promise<HotelApi> {
  return api<HotelApi>(`/viagens/${viagemId}/hoteis`, {
    method: 'POST',
    body: JSON.stringify(dados),
  })
}

export function atualizarHotel(id: number, dados: DadosHotelApi): Promise<HotelApi> {
  return api<HotelApi>(`/hoteis/${id}`, { method: 'PUT', body: JSON.stringify(dados) })
}

export function excluirHotel(id: number): Promise<void> {
  return api<void>(`/hoteis/${id}`, { method: 'DELETE' })
}

export function buscarHotel(id: number): Promise<HotelApi> {
  return api<HotelApi>(`/hoteis/${id}`)
}

/* ------------------------------------------------------------------ */
/* Roteiro                                                             */
/* ------------------------------------------------------------------ */
export interface DadosRoteiroApi {
  tipo?: string
  itemId?: number
  diaId?: number
  ordem?: number
  horarioInicio?: string | null
  horarioFim?: string | null
  concluido?: boolean
}

export function listarRoteiro(viagemId: number): Promise<RoteiroApi[]> {
  return api<RoteiroApi[]>(`/viagens/${viagemId}/roteiro`)
}

export function criarRoteiro(diaId: number, dados: DadosRoteiroApi): Promise<RoteiroApi> {
  return api<RoteiroApi>(`/dias/${diaId}/roteiro`, {
    method: 'POST',
    body: JSON.stringify(dados),
  })
}

export function atualizarRoteiro(id: number, dados: DadosRoteiroApi): Promise<RoteiroApi> {
  return api<RoteiroApi>(`/roteiro/${id}`, {
    method: 'PUT',
    body: JSON.stringify(dados),
  })
}

export function excluirRoteiro(id: number): Promise<void> {
  return api<void>(`/roteiro/${id}`, { method: 'DELETE' })
}

export function reordenarRoteiro(
  diaId: number,
  ordens: Array<{ id: number; ordem: number }>,
): Promise<RoteiroApi[]> {
  return api<RoteiroApi[]>(`/dias/${diaId}/roteiro/reordenar`, {
    method: 'PUT',
    body: JSON.stringify({ ordens }),
  })
}

/* ------------------------------------------------------------------ */
/* Listas                                                              */
/* ------------------------------------------------------------------ */
export interface DadosListaApi {
  nome?: string
  categoria?: string
  viagemId?: number | null
}

export function listarListas(): Promise<ListaApi[]> {
  return api<ListaApi[]>('/listas')
}

export function criarLista(dados: DadosListaApi): Promise<ListaApi> {
  return api<ListaApi>('/listas', { method: 'POST', body: JSON.stringify(dados) })
}

export function atualizarLista(id: number, dados: DadosListaApi): Promise<ListaApi> {
  return api<ListaApi>(`/listas/${id}`, { method: 'PUT', body: JSON.stringify(dados) })
}

export function excluirLista(id: number): Promise<void> {
  return api<void>(`/listas/${id}`, { method: 'DELETE' })
}

export interface DadosListaItemApi {
  nome?: string
  tipo?: string | null
  valor?: number | null
  valorPrevisto?: number | null
  valorPago?: number | null
  pagoEm?: string | null
  concluido?: boolean
  concluidoEm?: string | null
  ordem?: number
  fotoUrl?: string | null
  refeicao?: boolean
  endereco?: string | null
  cidade?: string | null
  lat?: number | null
  lng?: number | null
  fotoPratoUrl?: string | null
  fotoLocalUrl?: string | null
  observacoes?: string | null
}

export function listarItensLista(listaId: number): Promise<ListaItemApi[]> {
  return api<ListaItemApi[]>(`/listas/${listaId}/itens`)
}

export function criarItemLista(
  listaId: number,
  dados: DadosListaItemApi,
): Promise<ListaItemApi> {
  return api<ListaItemApi>(`/listas/${listaId}/itens`, {
    method: 'POST',
    body: JSON.stringify(dados),
  })
}

export function atualizarItemLista(
  id: number,
  dados: DadosListaItemApi,
): Promise<ListaItemApi> {
  return api<ListaItemApi>(`/itens/${id}`, {
    method: 'PUT',
    body: JSON.stringify(dados),
  })
}

export function excluirItemLista(id: number): Promise<void> {
  return api<void>(`/itens/${id}`, { method: 'DELETE' })
}

export function reordenarItensLista(
  listaId: number,
  ordens: Array<{ id: number; ordem: number }>,
): Promise<ListaItemApi[]> {
  return api<ListaItemApi[]>(`/listas/${listaId}/itens/reordenar`, {
    method: 'PUT',
    body: JSON.stringify({ ordens }),
  })
}
