import type {
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
import { gerarDatas } from '../lib/format'

/**
 * Fotografias de destino.
 * Placeholders estáveis via picsum (sempre carregam). Para produção, troque
 * pela URL curada do Unsplash mantendo a assinatura de `foto(seed, w, h)`.
 */
export function foto(seed: string, w = 1200, h = 800): string {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`
}

/** Gera os TRIP_DIA de uma viagem a partir do período. */
export function gerarDias(
  viagemId: string,
  dataInicio: string,
  dataFim: string,
  titulos: string[] = [],
): TripDia[] {
  return gerarDatas(dataInicio, dataFim).map((data, i) => ({
    id: `${viagemId}-d${i + 1}`,
    viagemId,
    numero: i + 1,
    data,
    titulo: titulos[i],
  }))
}

/** Gera `quantidade` dias sem data (viagem sem datas definidas). */
export function gerarDiasSemData(viagemId: string, quantidade = 1): TripDia[] {
  return Array.from({ length: Math.max(1, quantidade) }, (_, i) => ({
    id: `${viagemId}-d${i + 1}`,
    viagemId,
    numero: i + 1,
  }))
}

export const USUARIO_DEMO = {
  id: 'u1',
  nome: 'Ana Beatriz Moraes',
  email: 'ana.moraes@exemplo.com',
  ativo: true,
}

const VIAGEM_1: TripViagem = {
  id: 'v1',
  usuarioId: 'u1',
  nome: 'Gramado & Canela',
  destino: 'Gramado, RS',
  comDatas: true,
  dataInicio: '2026-05-12',
  dataFim: '2026-05-15',
  moeda: 'BRL',
  ativa: true,
  capaUrl: foto('gramado-serra', 1600, 1000),
  criadaEm: '2026-03-01T09:00:00',
}

const VIAGEM_2: TripViagem = {
  id: 'v2',
  usuarioId: 'u1',
  nome: 'Réveillon no Rio',
  destino: 'Rio de Janeiro, RJ',
  comDatas: true,
  dataInicio: '2025-12-29',
  dataFim: '2026-01-02',
  moeda: 'BRL',
  ativa: false,
  capaUrl: foto('rio-copacabana', 1600, 1000),
  criadaEm: '2025-11-10T20:00:00',
}

const VIAGEM_3: TripViagem = {
  id: 'v3',
  usuarioId: 'u1',
  nome: 'Férias em Florianópolis',
  destino: 'Florianópolis, SC',
  comDatas: false,
  moeda: 'BRL',
  ativa: false,
  capaUrl: foto('floripa-praia', 1600, 1000),
  criadaEm: '2026-04-02T11:30:00',
}

const DESTINOS: TripDestino[] = [
  {
    id: 'v1-dest1',
    viagemId: 'v1',
    nome: 'Gramado',
    cidade: 'Gramado',
    pais: 'Brasil',
    ordem: 0,
    dataInicio: '2026-05-12',
    dataFim: '2026-05-13',
    lat: -29.3785,
    lng: -50.8727,
  },
  {
    id: 'v1-dest2',
    viagemId: 'v1',
    nome: 'Canela',
    cidade: 'Canela',
    pais: 'Brasil',
    ordem: 1,
    dataInicio: '2026-05-14',
    dataFim: '2026-05-15',
    lat: -29.3656,
    lng: -50.8123,
  },
  {
    id: 'v2-dest1',
    viagemId: 'v2',
    nome: 'Rio de Janeiro',
    cidade: 'Rio de Janeiro',
    pais: 'Brasil',
    ordem: 0,
    lat: -22.9068,
    lng: -43.1729,
  },
  {
    id: 'v3-dest1',
    viagemId: 'v3',
    nome: 'Florianópolis',
    cidade: 'Florianópolis',
    pais: 'Brasil',
    ordem: 0,
  },
]

const DIAS: TripDia[] = [
  ...gerarDias('v1', '2026-05-12', '2026-05-15', [
    'Chegada e Lago Negro',
    'Museus e centro',
    'Passeio de trem',
    'Compras e volta',
  ]).map((dia) => ({
    ...dia,
    destinoId: dia.numero <= 2 ? 'v1-dest1' : 'v1-dest2',
  })),
  ...gerarDias('v2', '2025-12-29', '2026-01-02').map((dia) => ({
    ...dia,
    destinoId: 'v2-dest1',
  })),
  /* Viagem sem datas: começa com um único dia, sem data. */
  ...gerarDiasSemData('v3', 1).map((dia) => ({
    ...dia,
    destinoId: 'v3-dest1',
  })),
]

const LOCAIS: TripLocal[] = [
  {
    id: 'l1',
    viagemId: 'v1',
    nome: 'Lago Negro',
    categoria: 'natureza',
    endereco: 'Av. Borges de Medeiros, s/n',
    cidade: 'Gramado',
    horarioPrevisto: '10:30',
    duracaoMin: 90,
    custo: 0,
    observacoes: 'Aluguel de pedalinhos opcional. Levar casaco.',
    fotoUrl: foto('lago-negro', 900, 700),
    lat: -29.3792,
    lng: -50.8769,
  },
  {
    id: 'l2',
    viagemId: 'v1',
    nome: 'Museu de Cera Dreamland',
    categoria: 'museu',
    endereco: 'Av. das Hortênsias, 5507',
    cidade: 'Canela',
    duracaoMin: 60,
    custo: 60,
    observacoes: 'Ingresso de exemplo — confirmar valor na bilheteria.',
    fotoUrl: foto('museu-cera', 900, 700),
    lat: -29.3656,
    lng: -50.8123,
  },
  {
    id: 'l3',
    viagemId: 'v1',
    nome: 'Café Colonial Bela Vista',
    categoria: 'restaurante',
    endereco: 'Rua Bela Vista, 100',
    cidade: 'Gramado',
    horarioPrevisto: '12:30',
    duracaoMin: 90,
    custo: 95,
    observacoes: 'Reservar mesa para o horário do almoço.',
    fotoUrl: foto('cafe-colonial', 900, 700),
    lat: -29.3741,
    lng: -50.8747,
  },
  {
    id: 'l4',
    viagemId: 'v2',
    nome: 'Praia de Copacabana',
    categoria: 'passeio',
    cidade: 'Rio de Janeiro',
    duracaoMin: 120,
    custo: 0,
    fotoUrl: foto('copacabana', 900, 700),
    lat: -22.9711,
    lng: -43.1822,
  },
  {
    id: 'l5',
    viagemId: 'v2',
    nome: 'Pão de Açúcar',
    categoria: 'ponto-turistico',
    cidade: 'Rio de Janeiro',
    duracaoMin: 150,
    custo: 120,
    fotoUrl: foto('pao-de-acucar', 900, 700),
    lat: -22.9486,
    lng: -43.1566,
  },
]

const PASSAGENS: TripPassagem[] = [
  {
    id: 'p1',
    viagemId: 'v1',
    tipo: 'aviao',
    origem: 'São Paulo (GRU)',
    destino: 'Porto Alegre (POA)',
    partida: '2026-05-12T08:20:00',
    chegada: '2026-05-12T10:05:00',
    companhia: 'Exemplo Air',
    localizador: 'EXEMPLO-GRUPOA',
    valor: 780,
  },
  {
    id: 'p2',
    viagemId: 'v2',
    tipo: 'onibus',
    origem: 'São Paulo (Tietê)',
    destino: 'Rio de Janeiro (Novo Rio)',
    partida: '2025-12-29T22:00:00',
    chegada: '2025-12-30T05:30:00',
    companhia: 'Exemplo Bus',
    localizador: 'EXEMPLO-RIO',
    valor: 210,
  },
]

const HOTEIS: TripHotel[] = [
  {
    id: 'h1',
    viagemId: 'v1',
    nome: 'Hotel Vila Verde',
    endereco: 'Av. Borges de Medeiros, 2000',
    cidade: 'Gramado',
    checkin: '2026-05-12T14:00:00',
    checkout: '2026-05-15T12:00:00',
    valorNoite: 480,
    noites: 3,
    valorTotal: 1440,
    codigoReserva: 'EXEMPLO-4837',
    fotoUrl: foto('hotel-serra', 900, 700),
    lat: -29.3765,
    lng: -50.8742,
  },
  {
    id: 'h2',
    viagemId: 'v2',
    nome: 'Pousada Ipanema',
    endereco: 'Rua Farme de Amoedo, 50',
    cidade: 'Rio de Janeiro',
    checkin: '2025-12-30T14:00:00',
    checkout: '2026-01-02T11:00:00',
    valorNoite: 620,
    noites: 3,
    valorTotal: 1860,
    codigoReserva: 'EXEMPLO-9921',
    fotoUrl: foto('pousada-ipanema', 900, 700),
    lat: -22.9838,
    lng: -43.2096,
  },
]

/**
 * Roteiro inicial da viagem ativa: Lago Negro e o café já no Dia 1; a
 * hospedagem vigora nos dias 1–3 (checkout no dia 4) como cards independentes
 * vinculados ao MESMO registro de hotel. Museu e passagem ficam pendentes
 * (Área A do inventário) para demonstrar o fluxo de organização.
 */
const ROTEIRO: TripRoteiro[] = [
  {
    id: 'r1',
    viagemId: 'v1',
    diaId: 'v1-d1',
    tipoItem: 'HOTEL',
    itemId: 'h1',
    ordem: 0,
  },
  {
    id: 'r2',
    viagemId: 'v1',
    diaId: 'v1-d1',
    tipoItem: 'LOCAL',
    itemId: 'l1',
    ordem: 1,
    inicio: '10:30',
    fim: '12:00',
  },
  {
    id: 'r3',
    viagemId: 'v1',
    diaId: 'v1-d1',
    tipoItem: 'LOCAL',
    itemId: 'l3',
    ordem: 2,
    inicio: '12:30',
    fim: '14:00',
  },
  { id: 'r4', viagemId: 'v1', diaId: 'v1-d2', tipoItem: 'HOTEL', itemId: 'h1', ordem: 0 },
  { id: 'r5', viagemId: 'v1', diaId: 'v1-d3', tipoItem: 'HOTEL', itemId: 'h1', ordem: 0 },
]

/* TRIP_LISTA / TRIP_LISTA_ITEM ------------------------------------- */
const LISTAS: TripLista[] = [
  {
    id: 'ls1',
    usuarioId: 'u1',
    viagemId: 'v1',
    nome: 'Documentos da viagem',
    categoria: 'Documentos',
    criadaEm: '2026-04-10T09:00:00',
  },
  {
    id: 'ls2',
    usuarioId: 'u1',
    viagemId: 'v1',
    nome: 'Eletrônicos',
    categoria: 'Eletrônicos',
    criadaEm: '2026-04-10T09:05:00',
  },
]

const LISTA_ITENS: TripListaItem[] = [
  {
    id: 'li1',
    listaId: 'ls1',
    nome: 'Passaporte',
    tipo: 'documento',
    concluido: false,
    ordem: 0,
    criadaEm: '2026-04-10T09:01:00',
  },
  {
    id: 'li2',
    listaId: 'ls1',
    nome: 'Seguro viagem',
    tipo: 'documento',
    concluido: false,
    ordem: 1,
    criadaEm: '2026-04-10T09:02:00',
  },
  {
    id: 'li3',
    listaId: 'ls1',
    nome: 'Cartão de embarque',
    tipo: 'documento',
    concluido: true,
    concluidoEm: '2026-05-01T10:00:00',
    ordem: 2,
    criadaEm: '2026-04-10T09:03:00',
  },
  {
    id: 'li4',
    listaId: 'ls2',
    nome: 'Carregador',
    tipo: 'eletrônico',
    valor: 120,
    concluido: false,
    ordem: 0,
    criadaEm: '2026-04-10T09:06:00',
  },
  {
    id: 'li5',
    listaId: 'ls2',
    nome: 'Adaptador de tomada',
    tipo: 'eletrônico',
    valor: 45,
    concluido: true,
    concluidoEm: '2026-04-11T08:00:00',
    ordem: 1,
    criadaEm: '2026-04-10T09:07:00',
  },
]

export function estadoInicial(): TripState {
  return {
    usuario: { ...USUARIO_DEMO },
    viagens: [VIAGEM_1, VIAGEM_2, VIAGEM_3].map((v) => ({ ...v })),
    destinos: DESTINOS.map((d) => ({ ...d })),
    dias: DIAS.map((d) => ({ ...d })),
    locais: LOCAIS.map((l) => ({ ...l })),
    passagens: PASSAGENS.map((p) => ({ ...p })),
    hoteis: HOTEIS.map((h) => ({ ...h })),
    roteiro: ROTEIRO.map((r) => ({ ...r })),
    listas: LISTAS.map((l) => ({ ...l })),
    listaItens: LISTA_ITENS.map((i) => ({ ...i })),
  }
}

/** Estado vazio — usado pelo botão "Recomeçar demonstração". */
export function estadoVazio(): TripState {
  return {
    usuario: { ...USUARIO_DEMO },
    viagens: [],
    destinos: [],
    dias: [],
    locais: [],
    passagens: [],
    hoteis: [],
    roteiro: [],
    listas: [],
    listaItens: [],
  }
}
