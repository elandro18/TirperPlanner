export interface UsuarioApi {
  id: number;
  nome: string;
  email: string;
  ativo: boolean;
}

export interface SessaoApi {
  id: number;
  nome: string;
  email: string;
  token: string;
}

export interface ViagemApi {
  id: number;
  nome: string;
  destino: string;
  comDatas: boolean;
  dataInicio: string | null;
  dataFim: string | null;
  moeda: string;
  ativa: boolean;
  capaUrl: string;
  criadaEm: string;
}

export interface DiaApi {
  id: number;
  viagemId: number;
  numeroDia: number;
  data: string | null;
  titulo: string | null;
  destinoId: number | null;
}

export interface DestinoApi {
  id: number;
  viagemId: number;
  nome: string;
  cidade: string | null;
  pais: string | null;
  ordem: number;
  dataInicio: string | null;
  dataFim: string | null;
  lat: number | null;
  lng: number | null;
}

export interface LocalApi {
  id: number;
  viagemId: number;
  nome: string;
  endereco: string | null;
  cidade: string | null;
  categoria: string | null;
  horarioPrevisto: string | null;
  horarioFim: string | null;
  horarioAbertura: string | null;
  horarioFechamento: string | null;
  duracaoEstimada: number | null;
  custo: number | null;
  observacoes: string | null;
  fotoUrl: string | null;
  lat: number | null;
  lng: number | null;
  geoStatus: string | null;
}

export interface PassagemApi {
  id: number;
  viagemId: number;
  tipo: string;
  origem: string;
  destino: string;
  dataHoraPartida: string;
  dataHoraChegada: string | null;
  companhia: string | null;
  localizador: string | null;
  numeroBilhete: string | null;
  passageiro: string | null;
  classe: string | null;
  terminal: string | null;
  assento: string | null;
  moeda: string | null;
  valor: number | null;
  documentoHash: string | null;
  importadoDe: string | null;
}

export interface HotelApi {
  id: number;
  viagemId: number;
  nome: string;
  endereco: string | null;
  cidade: string | null;
  dataHoraCheckin: string;
  dataHoraCheckout: string;
  valorNoite: number | null;
  noites: number | null;
  valorTotal: number | null;
  reserva: string | null;
  fotoUrl: string | null;
  lat: number | null;
  lng: number | null;
  geoStatus: string | null;
}

export interface RoteiroApi {
  id: number;
  viagemId: number;
  diaId: number;
  tipo: string;
  itemId: number;
  ordem: number;
  horarioInicio: string | null;
  horarioFim: string | null;
  concluido: boolean;
}

export interface ListaApi {
  id: number;
  usuarioId: number;
  viagemId: number | null;
  nome: string;
  categoria: string;
  criadaEm: string;
}

export interface ListaItemApi {
  id: number;
  listaId: number;
  nome: string;
  tipo: string | null;
  valor: number | null;
  valorPrevisto: number | null;
  valorPago: number | null;
  pagoEm: string | null;
  concluido: boolean;
  concluidoEm: string | null;
  ordem: number;
  criadaEm: string;
  fotoUrl: string | null;
  refeicao: boolean;
  endereco: string | null;
  cidade: string | null;
  lat: number | null;
  lng: number | null;
  fotoPratoUrl: string | null;
  fotoLocalUrl: string | null;
  observacoes: string | null;
}

export interface ResumoApi {
  dias: number;
  locais: number;
  passagens: number;
  hoteis: number;
  totalItens: number;
  itensOrganizados: number;
  progresso: number;
  orcamento: {
    locais: number;
    passagens: number;
    hoteis: number;
    total: number;
  };
}

export interface PaginaApi<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
