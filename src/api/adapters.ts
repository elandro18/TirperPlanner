import type {
  GeoStatus,
  LocalCategoria,
  Moeda,
  RoteiroItemTipo,
  TransporteTipo,
  TripDestino,
  TripDia,
  TripHotel,
  TripLista,
  TripListaItem,
  TripLocal,
  TripPassagem,
  TripRoteiro,
  TripUsuario,
  TripViagem,
} from '../types'
import { LOCAL_CATEGORIAS } from '../types'
import type {
  DestinoApi,
  DiaApi,
  HotelApi,
  ListaApi,
  ListaItemApi,
  LocalApi,
  PassagemApi,
  RoteiroApi,
  UsuarioApi,
  ViagemApi,
} from './types'

const id = (valor: number): string => String(valor)
const opcional = <T>(valor: T | null | undefined): T | undefined =>
  valor === null || valor === undefined ? undefined : valor

function moeda(valor: string | null | undefined): Moeda {
  return valor === 'USD' || valor === 'EUR' ? valor : 'BRL'
}

function categoria(valor: string | null): LocalCategoria {
  return (LOCAL_CATEGORIAS as readonly string[]).includes(valor ?? '')
    ? (valor as LocalCategoria)
    : 'ponto-turistico'
}

function transporte(valor: string): TransporteTipo {
  const tipo = valor.toLowerCase()
  return tipo === 'trem' || tipo === 'onibus' ? tipo : 'aviao'
}

function tipoRoteiro(valor: string): RoteiroItemTipo {
  return valor === 'PASSAGEM' || valor === 'HOTEL' ? valor : 'LOCAL'
}

function geo(valor: string | null): GeoStatus | undefined {
  return valor === 'confirmado' || valor === 'aproximado' || valor === 'manual'
    ? valor
    : undefined
}

function importado(valor: string | null): 'pdf' | 'imagem' | 'manual' | undefined {
  return valor === 'pdf' || valor === 'imagem' || valor === 'manual' ? valor : undefined
}

export function adaptUsuario(usuario: UsuarioApi): TripUsuario {
  return {
    id: id(usuario.id),
    nome: usuario.nome,
    email: usuario.email,
    ativo: usuario.ativo,
  }
}

export function adaptViagem(viagem: ViagemApi): TripViagem {
  return {
    id: id(viagem.id),
    usuarioId: '',
    nome: viagem.nome,
    destino: viagem.destino,
    comDatas: viagem.comDatas,
    dataInicio: opcional(viagem.dataInicio),
    dataFim: opcional(viagem.dataFim),
    moeda: moeda(viagem.moeda),
    ativa: viagem.ativa,
    capaUrl: viagem.capaUrl,
    criadaEm: viagem.criadaEm,
  }
}

export function adaptDia(dia: DiaApi): TripDia {
  return {
    id: id(dia.id),
    viagemId: id(dia.viagemId),
    numero: dia.numeroDia,
    data: opcional(dia.data),
    titulo: opcional(dia.titulo),
    destinoId: dia.destinoId === null ? undefined : id(dia.destinoId),
  }
}

export function adaptDestino(destino: DestinoApi): TripDestino {
  return {
    id: id(destino.id),
    viagemId: id(destino.viagemId),
    nome: destino.nome,
    cidade: opcional(destino.cidade),
    pais: opcional(destino.pais),
    ordem: destino.ordem,
    dataInicio: opcional(destino.dataInicio),
    dataFim: opcional(destino.dataFim),
    lat: opcional(destino.lat),
    lng: opcional(destino.lng),
  }
}

export function adaptLocal(local: LocalApi): TripLocal {
  return {
    id: id(local.id),
    viagemId: id(local.viagemId),
    nome: local.nome,
    categoria: categoria(local.categoria),
    endereco: opcional(local.endereco),
    cidade: opcional(local.cidade),
    horarioPrevisto: opcional(local.horarioPrevisto),
    horarioFim: opcional(local.horarioFim),
    horarioAbertura: opcional(local.horarioAbertura),
    horarioFechamento: opcional(local.horarioFechamento),
    duracaoMin: opcional(local.duracaoEstimada),
    custo: opcional(local.custo),
    observacoes: opcional(local.observacoes),
    fotoUrl: opcional(local.fotoUrl),
    lat: opcional(local.lat),
    lng: opcional(local.lng),
    geoStatus: geo(local.geoStatus),
  }
}

export function adaptPassagem(passagem: PassagemApi): TripPassagem {
  return {
    id: id(passagem.id),
    viagemId: id(passagem.viagemId),
    tipo: transporte(passagem.tipo),
    origem: passagem.origem,
    destino: passagem.destino,
    partida: passagem.dataHoraPartida,
    chegada: opcional(passagem.dataHoraChegada),
    companhia: opcional(passagem.companhia),
    localizador: opcional(passagem.localizador),
    numeroBilhete: opcional(passagem.numeroBilhete),
    passageiro: opcional(passagem.passageiro),
    classe: opcional(passagem.classe),
    terminal: opcional(passagem.terminal),
    assento: opcional(passagem.assento),
    moeda: passagem.moeda === null ? undefined : moeda(passagem.moeda),
    valor: opcional(passagem.valor),
    documentoHash: opcional(passagem.documentoHash),
    importadoDe: importado(passagem.importadoDe),
  }
}

export function adaptHotel(hotel: HotelApi): TripHotel {
  return {
    id: id(hotel.id),
    viagemId: id(hotel.viagemId),
    nome: hotel.nome,
    endereco: opcional(hotel.endereco),
    cidade: opcional(hotel.cidade),
    checkin: hotel.dataHoraCheckin,
    checkout: hotel.dataHoraCheckout,
    valorNoite: opcional(hotel.valorNoite),
    noites: opcional(hotel.noites),
    valorTotal: opcional(hotel.valorTotal),
    codigoReserva: opcional(hotel.reserva),
    fotoUrl: opcional(hotel.fotoUrl),
    lat: opcional(hotel.lat),
    lng: opcional(hotel.lng),
    geoStatus: geo(hotel.geoStatus),
  }
}

export function adaptRoteiro(card: RoteiroApi): TripRoteiro {
  return {
    id: id(card.id),
    viagemId: id(card.viagemId),
    diaId: id(card.diaId),
    tipoItem: tipoRoteiro(card.tipo),
    itemId: id(card.itemId),
    ordem: card.ordem,
    inicio: opcional(card.horarioInicio),
    fim: opcional(card.horarioFim),
    concluido: card.concluido,
  }
}

export function adaptLista(lista: ListaApi): TripLista {
  return {
    id: id(lista.id),
    usuarioId: id(lista.usuarioId),
    viagemId: lista.viagemId === null ? undefined : id(lista.viagemId),
    nome: lista.nome,
    categoria: lista.categoria,
    criadaEm: lista.criadaEm,
  }
}

export function adaptListaItem(item: ListaItemApi): TripListaItem {
  return {
    id: id(item.id),
    listaId: id(item.listaId),
    nome: item.nome,
    tipo: opcional(item.tipo),
    valor: opcional(item.valor),
    valorPrevisto: opcional(item.valorPrevisto),
    valorPago: opcional(item.valorPago),
    pagoEm: opcional(item.pagoEm),
    concluido: item.concluido,
    concluidoEm: opcional(item.concluidoEm),
    ordem: item.ordem,
    criadaEm: item.criadaEm,
    fotoUrl: opcional(item.fotoUrl),
    refeicao: item.refeicao,
    endereco: opcional(item.endereco),
    cidade: opcional(item.cidade),
    lat: opcional(item.lat),
    lng: opcional(item.lng),
    fotoPratoUrl: opcional(item.fotoPratoUrl),
    fotoLocalUrl: opcional(item.fotoLocalUrl),
    observacoes: opcional(item.observacoes),
  }
}
