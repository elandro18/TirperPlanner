/* ------------------------------------------------------------------ */
/* Modelo de dados — espelha as tabelas TRIP_* (Google Drive / Sheets)  */
/* Nenhuma entidade fictícia: restaurantes, museus e atrações são       */
/* registros de TRIP_LOCAL.                                            */
/* ------------------------------------------------------------------ */

export type ID = string

export type Moeda = 'BRL' | 'USD' | 'EUR'

/* TRIP_USUARIO ----------------------------------------------------- */
export interface TripUsuario {
  id: ID
  nome: string
  email: string
  ativo: boolean
}

/* TRIP_VIAGEM ------------------------------------------------------ */
/* dataInicio/dataFim são opcionais: a viagem pode existir sem datas.   */
export interface TripViagem {
  id: ID
  usuarioId: ID
  nome: string
  destino: string
  comDatas: boolean
  dataInicio?: string // ISO date (YYYY-MM-DD) — quando comDatas
  dataFim?: string // ISO date (YYYY-MM-DD) — quando comDatas
  moeda: Moeda
  ativa: boolean
  capaUrl: string
  criadaEm: string // ISO datetime
}

/* TRIP_DIA --------------------------------------------------------- */
/* `data` só existe quando a viagem tem datas. Sem datas, o dia é      */
/* identificado apenas pelo número sequencial.                         */
export interface TripDia {
  id: ID
  viagemId: ID
  numero: number // sequencial, 1..N
  data?: string // ISO date
  titulo?: string
  destinoId?: ID
}

/* TRIP_DESTINO ---------------------------------------------------- */
export interface TripDestino {
  id: ID
  viagemId: ID
  nome: string
  cidade?: string
  pais?: string
  ordem: number
  dataInicio?: string
  dataFim?: string
  lat?: number
  lng?: number
}

/* TRIP_LOCAL ------------------------------------------------------- */
export const LOCAL_CATEGORIAS = [
  'ponto-turistico',
  'museu',
  'restaurante',
  'natureza',
  'compras',
  'passeio',
  'cultura',
] as const

export type LocalCategoria = (typeof LOCAL_CATEGORIAS)[number]

export interface TripLocal {
  id: ID
  viagemId: ID
  nome: string
  categoria: LocalCategoria
  endereco?: string
  cidade?: string
  horarioPrevisto?: string // HH:mm
  horarioFim?: string // HH:mm
  horarioAbertura?: string // HH:mm
  horarioFechamento?: string // HH:mm
  duracaoMin?: number
  custo?: number // em reais
  observacoes?: string
  fotoUrl?: string
  lat?: number
  lng?: number
  /** origem da coordenada — evita associar localização sem confirmação */
  geoStatus?: GeoStatus
}

/* TRIP_PASSAGEM ---------------------------------------------------- */
export const TRANSPORTE_TIPOS = ['aviao', 'trem', 'onibus'] as const
export type TransporteTipo = (typeof TRANSPORTE_TIPOS)[number]

export interface TripPassagem {
  id: ID
  viagemId: ID
  tipo: TransporteTipo
  origem: string
  destino: string
  partida: string // ISO datetime
  chegada?: string // ISO datetime
  companhia?: string
  localizador?: string
  numeroBilhete?: string
  numeroVoo?: string
  passageiro?: string
  classe?: string
  terminal?: string
  assento?: string
  moeda?: Moeda
  valor?: number // em reais
  documentoHash?: string
  importadoDe?: 'pdf' | 'imagem' | 'manual'
}

/* TRIP_HOTEL ------------------------------------------------------- */
export interface TripHotel {
  id: ID
  viagemId: ID
  nome: string
  endereco?: string
  cidade?: string
  checkin: string // ISO datetime
  checkout: string // ISO datetime
  valorNoite?: number
  noites?: number
  valorTotal?: number
  codigoReserva?: string
  fotoUrl?: string
  lat?: number
  lng?: number
  /** origem da coordenada — evita associar localização sem confirmação */
  geoStatus?: GeoStatus
}

/* TRIP_ROTEIRO ----------------------------------------------------- */
export const ROTEIRO_TIPOS = ['LOCAL', 'PASSAGEM', 'HOTEL'] as const
export type RoteiroItemTipo = (typeof ROTEIRO_TIPOS)[number]

export interface TripRoteiro {
  id: ID
  viagemId: ID
  diaId: ID
  tipoItem: RoteiroItemTipo
  itemId: ID
  ordem: number
  inicio?: string // HH:mm
  fim?: string // HH:mm
  concluido?: boolean
}

/* TRIP_LISTA / TRIP_LISTA_ITEM ------------------------------------- */
/* Listas personalizadas (checklists) do usuário — independentes do     */
/* roteiro diário. Cada usuário vê e gerencia somente as suas listas.   */
export interface TripLista {
  id: ID
  usuarioId: ID
  viagemId?: ID
  nome: string
  categoria: string
  criadaEm: string // ISO datetime
}

export interface TripListaItem {
  id: ID
  listaId: ID
  nome: string
  tipo?: string // classificação livre (documento, roupa, eletrônico…)
  valor?: number // valor monetário legado (previsto)
  valorPrevisto?: number
  valorPago?: number
  pagoEm?: string // ISO datetime
  concluido: boolean
  concluidoEm?: string // ISO datetime — define a ordem dos concluídos
  ordem: number // ordem entre os pendentes
  criadaEm: string
  fotoUrl?: string
  refeicao?: boolean
  endereco?: string
  cidade?: string
  lat?: number
  lng?: number
  fotoPratoUrl?: string
  fotoLocalUrl?: string
  observacoes?: string
}

export const LISTA_CATEGORIAS_SUGERIDAS = [
  'Documentos',
  'Roupas',
  'Eletrônicos',
  'Brinquedos',
  'Itens para levar',
  'Farmácia',
  'Outros',
] as const

export const LISTA_TIPOS_SUGERIDOS = [
  'documento',
  'roupa',
  'acessório',
  'eletrônico',
  'brinquedo',
  'higiene',
] as const

/* Localização geográfica ------------------------------------------- */
/** Como a coordenada foi obtida — nunca gravamos sem confirmação. */
export type GeoStatus = 'confirmado' | 'aproximado' | 'manual'

/* Estado agregado (a "planilha") ----------------------------------- */
export interface TripState {
  usuario: TripUsuario
  viagens: TripViagem[]
  destinos: TripDestino[]
  dias: TripDia[]
  locais: TripLocal[]
  passagens: TripPassagem[]
  hoteis: TripHotel[]
  roteiro: TripRoteiro[]
  listas: TripLista[]
  listaItens: TripListaItem[]
}

/* Rótulos e metadados de apresentação ------------------------------ */
export interface CategoriaMeta {
  valor: LocalCategoria
  rotulo: string
  emoji: string
  cor: string // classe de fundo do marcador/chip
}

export const CATEGORIA_META: Record<LocalCategoria, CategoriaMeta> = {
  'ponto-turistico': {
    valor: 'ponto-turistico',
    rotulo: 'Ponto turístico',
    emoji: '📍',
    cor: '#295237',
  },
  museu: { valor: 'museu', rotulo: 'Museu', emoji: '🏛️', cor: '#6f8a6c' },
  restaurante: {
    valor: 'restaurante',
    rotulo: 'Restaurante',
    emoji: '🍽️',
    cor: '#c4703e',
  },
  natureza: { valor: 'natureza', rotulo: 'Natureza', emoji: '🌿', cor: '#437b57' },
  compras: { valor: 'compras', rotulo: 'Compras', emoji: '🛍️', cor: '#a85a2e' },
  passeio: { valor: 'passeio', rotulo: 'Passeio', emoji: '🚶', cor: '#5c9271' },
  cultura: { valor: 'cultura', rotulo: 'Cultura', emoji: '🎭', cor: '#87a183' },
}

export const TRANSPORTE_META: Record<
  TransporteTipo,
  { rotulo: string; emoji: string; cor: string }
> = {
  aviao: { rotulo: 'Avião', emoji: '✈️', cor: '#295237' },
  trem: { rotulo: 'Trem', emoji: '🚆', cor: '#437b57' },
  onibus: { rotulo: 'Ônibus', emoji: '🚌', cor: '#6f8a6c' },
}

export const ROTEIRO_TIPO_ROTULO: Record<RoteiroItemTipo, string> = {
  LOCAL: 'Local',
  PASSAGEM: 'Passagem',
  HOTEL: 'Hospedagem',
}
