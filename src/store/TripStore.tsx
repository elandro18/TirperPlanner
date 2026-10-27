import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  adaptDestino,
  adaptDia,
  adaptHotel,
  adaptLista,
  adaptListaItem,
  adaptLocal,
  adaptPassagem,
  adaptRoteiro,
  adaptUsuario,
  adaptViagem,
} from '../api/adapters'
import { HttpError, mensagemDeErro } from '../api/client'
import * as api from '../api/endpoints'
import type { DestinoApi } from '../api/types'
import { estadoInicial, estadoVazio } from '../data/seed'
import type {
  ID,
  TripDestino,
  TripHotel,
  TripLista,
  TripListaItem,
  TripLocal,
  TripPassagem,
  TripState,
} from '../types'
import type { Action } from './tripModel'
import { migrar, reducer } from './reducer'

const STORAGE_KEY = 'trip-planner:state:v1'

interface TripContextValue {
  state: TripState
  dispatch: React.Dispatch<Action>
  viagemAtivaId: ID | null
  setViagemAtivaId: (id: ID | null) => void
  recarregar: () => Promise<void>
  carregando: boolean
}

const TripContext = createContext<TripContextValue | null>(null)

type MapasDeId = Record<string, Map<string, string>>

function mapasIniciais(): MapasDeId {
  return {
    viagem: new Map(),
    dia: new Map(),
    destino: new Map(),
    local: new Map(),
    passagem: new Map(),
    hotel: new Map(),
    roteiro: new Map(),
    lista: new Map(),
    listaItem: new Map(),
    LOCAL: new Map(),
    PASSAGEM: new Map(),
    HOTEL: new Map(),
  }
}

async function carregarEstado(): Promise<TripState> {
  const [usuario, viagensApi, listasApi] = await Promise.all([
    api.usuarioAtual(),
    api.listarViagens(),
    api.listarListas(),
  ])

  const viagens = viagensApi.map((viagem) => ({
    ...adaptViagem(viagem),
    usuarioId: String(usuario.id),
  }))

  const porViagem = await Promise.all(
    viagens.map(async (viagem) => {
      const [dias, destinos, locais, passagens, hoteis, roteiro] = await Promise.all([
        api.listarDias(Number(viagem.id)),
        api.listarDestinos(Number(viagem.id)),
        api.listarLocais(Number(viagem.id)),
        api.listarPassagens(Number(viagem.id)),
        api.listarHoteis(Number(viagem.id)),
        api.listarRoteiro(Number(viagem.id)),
      ])
      return { dias, destinos, locais, passagens, hoteis, roteiro }
    }),
  )

  const itensPorLista = await Promise.all(
    listasApi.map((lista) => api.listarItensLista(lista.id)),
  )

  return {
    usuario: adaptUsuario(usuario),
    viagens,
    destinos: porViagem.flatMap((item) => item.destinos).map(adaptDestino),
    dias: porViagem.flatMap((item) => item.dias).map(adaptDia),
    locais: porViagem.flatMap((item) => item.locais).map(adaptLocal),
    passagens: porViagem.flatMap((item) => item.passagens).map(adaptPassagem),
    hoteis: porViagem.flatMap((item) => item.hoteis).map(adaptHotel),
    roteiro: porViagem.flatMap((item) => item.roteiro).map(adaptRoteiro),
    listas: listasApi.map(adaptLista),
    listaItens: itensPorLista.flat().map(adaptListaItem),
  }
}

function dadosLocal(local: TripLocal): api.DadosLocalApi {
  return {
    nome: local.nome,
    endereco: local.endereco ?? null,
    cidade: local.cidade ?? null,
    categoria: local.categoria,
    horarioPrevisto: local.horarioPrevisto ?? null,
    horarioFim: local.horarioFim ?? null,
    horarioAbertura: local.horarioAbertura ?? null,
    horarioFechamento: local.horarioFechamento ?? null,
    duracaoEstimada: local.duracaoMin ?? null,
    custo: local.custo ?? null,
    observacoes: local.observacoes ?? null,
    fotoUrl: local.fotoUrl ?? null,
    lat: local.lat ?? null,
    lng: local.lng ?? null,
    geoStatus: local.geoStatus ?? null,
  }
}

function dadosPassagem(passagem: TripPassagem): api.DadosPassagemApi {
  return {
    tipo: passagem.tipo,
    origem: passagem.origem,
    destino: passagem.destino,
    dataHoraPartida: passagem.partida,
    dataHoraChegada: passagem.chegada ?? null,
    companhia: passagem.companhia ?? null,
    localizador: passagem.localizador ?? null,
    numeroBilhete: passagem.numeroBilhete ?? null,
    passageiro: passagem.passageiro ?? null,
    classe: passagem.classe ?? null,
    terminal: passagem.terminal ?? null,
    assento: passagem.assento ?? null,
    moeda: passagem.moeda ?? null,
    valor: passagem.valor ?? null,
    documentoHash: passagem.documentoHash ?? null,
    importadoDe: passagem.importadoDe ?? null,
  }
}

function dadosHotel(hotel: TripHotel): api.DadosHotelApi {
  return {
    nome: hotel.nome,
    endereco: hotel.endereco ?? null,
    cidade: hotel.cidade ?? null,
    dataHoraCheckin: hotel.checkin,
    dataHoraCheckout: hotel.checkout,
    valorNoite: hotel.valorNoite ?? null,
    noites: hotel.noites ?? null,
    valorTotal: hotel.valorTotal ?? null,
    reserva: hotel.codigoReserva ?? null,
    fotoUrl: hotel.fotoUrl ?? null,
    lat: hotel.lat ?? null,
    lng: hotel.lng ?? null,
    geoStatus: hotel.geoStatus ?? null,
  }
}

function dadosDestino(destino: TripDestino): api.DadosDestinoApi {
  return {
    nome: destino.nome,
    cidade: destino.cidade ?? null,
    pais: destino.pais ?? null,
    ordem: destino.ordem,
    dataInicio: destino.dataInicio ?? null,
    dataFim: destino.dataFim ?? null,
    lat: destino.lat ?? null,
    lng: destino.lng ?? null,
  }
}

function dadosItemLista(item: TripListaItem): api.DadosListaItemApi {
  return {
    nome: item.nome,
    tipo: item.tipo ?? null,
    valor: item.valor ?? null,
    valorPrevisto: item.valorPrevisto ?? null,
    valorPago: item.valorPago ?? null,
    pagoEm: item.pagoEm ?? null,
    concluido: item.concluido,
    concluidoEm: item.concluidoEm ?? null,
    ordem: item.ordem,
    fotoUrl: item.fotoUrl ?? null,
    refeicao: item.refeicao ?? false,
    endereco: item.endereco ?? null,
    cidade: item.cidade ?? null,
    lat: item.lat ?? null,
    lng: item.lng ?? null,
    fotoPratoUrl: item.fotoPratoUrl ?? null,
    fotoLocalUrl: item.fotoLocalUrl ?? null,
    observacoes: item.observacoes ?? null,
  }
}

function dadosItemListaPatch(patch: Partial<TripListaItem>): api.DadosListaItemApi {
  const dados: api.DadosListaItemApi = {}
  if (patch.nome !== undefined) dados.nome = patch.nome
  if (patch.tipo !== undefined) dados.tipo = patch.tipo ?? null
  if (patch.valor !== undefined) dados.valor = patch.valor ?? null
  if (patch.valorPrevisto !== undefined) dados.valorPrevisto = patch.valorPrevisto ?? null
  if (patch.valorPago !== undefined) dados.valorPago = patch.valorPago ?? null
  if (patch.pagoEm !== undefined) dados.pagoEm = patch.pagoEm ?? null
  if (patch.concluido !== undefined) dados.concluido = patch.concluido
  if (patch.concluidoEm !== undefined) dados.concluidoEm = patch.concluidoEm ?? null
  if (patch.ordem !== undefined) dados.ordem = patch.ordem
  if (patch.fotoUrl !== undefined) dados.fotoUrl = patch.fotoUrl ?? null
  if (patch.refeicao !== undefined) dados.refeicao = patch.refeicao
  if (patch.endereco !== undefined) dados.endereco = patch.endereco ?? null
  if (patch.cidade !== undefined) dados.cidade = patch.cidade ?? null
  if (patch.lat !== undefined) dados.lat = patch.lat ?? null
  if (patch.lng !== undefined) dados.lng = patch.lng ?? null
  if (patch.fotoPratoUrl !== undefined) dados.fotoPratoUrl = patch.fotoPratoUrl ?? null
  if (patch.fotoLocalUrl !== undefined) dados.fotoLocalUrl = patch.fotoLocalUrl ?? null
  if (patch.observacoes !== undefined) dados.observacoes = patch.observacoes ?? null
  return dados
}

function TripProviderApi({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TripState>(estadoVazio)
  const [viagemAtivaId, setViagemAtivaId] = useState<ID | null>(null)
  const [carregando, setCarregando] = useState(true)
  const stateRef = useRef(state)
  const viagemAtivaRef = useRef(viagemAtivaId)
  const mapas = useRef<MapasDeId>(mapasIniciais())
  const fila = useRef<Promise<void>>(Promise.resolve())

  stateRef.current = state
  viagemAtivaRef.current = viagemAtivaId

  const recarregar = useCallback(async () => {
    const dados = await carregarEstado()
    setState(dados)

    const atual = viagemAtivaRef.current
    if (!atual || !dados.viagens.some((viagem) => viagem.id === atual)) {
      const proxima = dados.viagens.find((viagem) => viagem.ativa)?.id ?? dados.viagens[0]?.id ?? null
      viagemAtivaRef.current = proxima
      setViagemAtivaId(proxima)
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dados))
    } catch {
      /* cache local indisponível */
    }
  }, [])

  useEffect(() => {
    let ativo = true
    recarregar()
      .catch(async (erro: unknown) => {
        if (erro instanceof HttpError && erro.status === 401) {
          localStorage.removeItem(STORAGE_KEY)
          window.location.assign('/login')
          return
        }
        if (ativo) {
          console.error(erro)
        }
      })
      .finally(() => {
        if (ativo) setCarregando(false)
      })
    return () => {
      ativo = false
    }
  }, [recarregar])

  const executar = useCallback(
    async (action: Action): Promise<void> => {
      const estado = stateRef.current
      const mapa = (entidade: string, valor: ID): number => {
        const mapeado = mapas.current[entidade]?.get(valor) ?? valor
        const numero = Number(mapeado)
        if (!Number.isInteger(numero) || numero <= 0) {
          throw new Error(`Identificador não resolvido: ${valor}`)
        }
        return numero
      }
      const registrar = (entidade: string, front: ID, back: number): void => {
        mapas.current[entidade]?.set(front, String(back))
      }

      switch (action.type) {
        case 'SET_ATIVA': {
          await api.ativarViagem(mapa('viagem', action.viagemId))
          viagemAtivaRef.current = action.viagemId
          setViagemAtivaId(action.viagemId)
          break
        }

        case 'ADD_VIAGEM': {
          const criada = await api.criarViagem({
            nome: action.viagem.nome,
            destino: action.viagem.destino,
            comDatas: action.viagem.comDatas,
            dataInicio: action.viagem.comDatas ? action.viagem.dataInicio : undefined,
            dataFim: action.viagem.comDatas ? action.viagem.dataFim : undefined,
            moeda: action.viagem.moeda,
            capaUrl: action.viagem.capaUrl || undefined,
          })
          registrar('viagem', action.viagem.id, criada.id)
          viagemAtivaRef.current = String(criada.id)
          setViagemAtivaId(String(criada.id))

          const destinosCriados: DestinoApi[] = []
          for (const destino of action.destinos ?? []) {
            const criado = await api.criarDestino(criada.id, dadosDestino(destino))
            registrar('destino', destino.id, criado.id)
            destinosCriados.push(criado)
          }

          if (destinosCriados.length > 0) {
            const dias = await api.listarDias(criada.id)
            for (const dia of dias) {
              const alvo =
                destinosCriados.find(
                  (destino) =>
                    destino.dataInicio &&
                    destino.dataFim &&
                    dia.data &&
                    dia.data >= destino.dataInicio &&
                    dia.data <= destino.dataFim,
                ) ?? destinosCriados[0]
              if (alvo && dia.destinoId !== alvo.id) {
                await api.atualizarDia(dia.id, { destinoId: alvo.id })
              }
            }
          }
          break
        }

        case 'UPDATE_VIAGEM': {
          const atual = estado.viagens.find((viagem) => viagem.id === action.id)
          if (!atual) return
          const proxima = { ...atual, ...action.patch }
          await api.atualizarViagem(mapa('viagem', action.id), {
            nome: proxima.nome,
            destino: proxima.destino,
            comDatas: proxima.comDatas,
            dataInicio: proxima.comDatas ? proxima.dataInicio : undefined,
            dataFim: proxima.comDatas ? proxima.dataFim : undefined,
            moeda: proxima.moeda,
            capaUrl: proxima.capaUrl || undefined,
          })
          break
        }

        case 'SET_DATAS': {
          const atual = estado.viagens.find((viagem) => viagem.id === action.viagemId)
          if (!atual) return
          await api.atualizarViagem(mapa('viagem', action.viagemId), {
            nome: atual.nome,
            destino: atual.destino,
            comDatas: action.comDatas,
            dataInicio: action.comDatas ? action.dataInicio : undefined,
            dataFim: action.comDatas ? action.dataFim : undefined,
            moeda: atual.moeda,
            capaUrl: atual.capaUrl || undefined,
          })
          break
        }

        case 'DELETE_VIAGEM':
          await api.excluirViagem(mapa('viagem', action.id))
          break

        case 'ADD_DESTINO': {
          const criado = await api.criarDestino(
            mapa('viagem', action.destino.viagemId),
            dadosDestino(action.destino),
          )
          registrar('destino', action.destino.id, criado.id)
          break
        }

        case 'UPDATE_DESTINO': {
          const atual = estado.destinos.find((destino) => destino.id === action.id)
          if (!atual) return
          await api.atualizarDestino(
            mapa('destino', action.id),
            dadosDestino({ ...atual, ...action.patch }),
          )
          break
        }

        case 'DELETE_DESTINO':
          await api.excluirDestino(mapa('destino', action.id))
          break

        case 'REORDENAR_DESTINOS':
          await api.reordenarDestinos(
            mapa('viagem', action.viagemId),
            action.ids.map((id) => mapa('destino', id)),
          )
          break

        case 'ADD_DIA':
          await api.criarDia(mapa('viagem', action.viagemId))
          break

        case 'UPDATE_DIA': {
          const patch = action.patch
          await api.atualizarDia(mapa('dia', action.id), {
            numeroDia: 'numero' in patch ? patch.numero : undefined,
            data: 'data' in patch ? (patch.data ?? null) : undefined,
            titulo: 'titulo' in patch ? (patch.titulo ?? null) : undefined,
            destinoId:
              'destinoId' in patch
                ? patch.destinoId
                  ? mapa('destino', patch.destinoId)
                  : null
                : undefined,
          })
          break
        }

        case 'DELETE_DIA':
          await api.excluirDia(mapa('dia', action.id))
          break

        case 'ADD_LOCAL': {
          const criado = await api.criarLocal(
            mapa('viagem', action.local.viagemId),
            dadosLocal(action.local),
          )
          registrar('local', action.local.id, criado.id)
          registrar('LOCAL', action.local.id, criado.id)
          break
        }

        case 'UPDATE_LOCAL': {
          const atual = estado.locais.find((local) => local.id === action.id)
          if (!atual) return
          await api.atualizarLocal(
            mapa('local', action.id),
            dadosLocal({ ...atual, ...action.patch }),
          )
          break
        }

        case 'DELETE_LOCAL':
          await api.excluirLocal(mapa('local', action.id))
          break

        case 'ADD_PASSAGEM': {
          const criada = await api.criarPassagem(
            mapa('viagem', action.passagem.viagemId),
            dadosPassagem(action.passagem),
          )
          registrar('passagem', action.passagem.id, criada.id)
          registrar('PASSAGEM', action.passagem.id, criada.id)
          break
        }

        case 'UPDATE_PASSAGEM': {
          const atual = estado.passagens.find((passagem) => passagem.id === action.id)
          if (!atual) return
          await api.atualizarPassagem(
            mapa('passagem', action.id),
            dadosPassagem({ ...atual, ...action.patch }),
          )
          break
        }

        case 'DELETE_PASSAGEM':
          await api.excluirPassagem(mapa('passagem', action.id))
          break

        case 'ADD_HOTEL': {
          const criado = await api.criarHotel(
            mapa('viagem', action.hotel.viagemId),
            dadosHotel(action.hotel),
          )
          registrar('hotel', action.hotel.id, criado.id)
          registrar('HOTEL', action.hotel.id, criado.id)
          break
        }

        case 'UPDATE_HOTEL': {
          const atual = estado.hoteis.find((hotel) => hotel.id === action.id)
          if (!atual) return
          await api.atualizarHotel(
            mapa('hotel', action.id),
            dadosHotel({ ...atual, ...action.patch }),
          )
          break
        }

        case 'DELETE_HOTEL':
          await api.excluirHotel(mapa('hotel', action.id))
          break

        case 'ADD_ROTEIRO': {
          const entrada = action.entrada
          const card = await api.criarRoteiro(mapa('dia', entrada.diaId), {
            tipo: entrada.tipoItem,
            itemId: mapa(entrada.tipoItem, entrada.itemId),
            horarioInicio: entrada.inicio,
            horarioFim: entrada.fim,
          })
          registrar('roteiro', entrada.id, card.id)
          break
        }

        case 'ADD_HOTEL_AOS_DIAS': {
          const hotelId = mapa('hotel', action.hotelId)
          const hotel = await api.buscarHotel(hotelId)
          const inicio = hotel.dataHoraCheckin.slice(0, 10)
          const checkout = hotel.dataHoraCheckout.slice(0, 10)
          const [dias, roteiro] = await Promise.all([
            api.listarDias(hotel.viagemId),
            api.listarRoteiro(hotel.viagemId),
          ])
          for (const dia of dias) {
            if (!dia.data || dia.data < inicio || dia.data >= checkout) continue
            const existente = roteiro.some(
              (card) => card.diaId === dia.id && card.tipo === 'HOTEL' && card.itemId === hotelId,
            )
            if (!existente) {
              await api.criarRoteiro(dia.id, { tipo: 'HOTEL', itemId: hotelId })
            }
          }
          break
        }

        case 'UPDATE_ROTEIRO': {
          const patch = action.patch
          const dados: api.DadosRoteiroApi = {}
          if ('inicio' in patch) dados.horarioInicio = patch.inicio ?? null
          if ('fim' in patch) dados.horarioFim = patch.fim ?? null
          if ('concluido' in patch) dados.concluido = patch.concluido
          if ('ordem' in patch) dados.ordem = patch.ordem
          if ('diaId' in patch && patch.diaId) dados.diaId = mapa('dia', patch.diaId)
          await api.atualizarRoteiro(mapa('roteiro', action.id), dados)
          break
        }

        case 'REMOVE_ROTEIRO':
          await api.excluirRoteiro(mapa('roteiro', action.id))
          break

        case 'MOVER_ROTEIRO':
          await api.atualizarRoteiro(mapa('roteiro', action.id), {
            diaId: mapa('dia', action.paraDiaId),
          })
          break

        case 'REORDENAR_DIA':
          await api.reordenarRoteiro(
            mapa('dia', action.diaId),
            action.ids.map((id, ordem) => ({ id: mapa('roteiro', id), ordem })),
          )
          break

        case 'ADD_LISTA': {
          const criada = await api.criarLista({
            nome: action.lista.nome,
            categoria: action.lista.categoria,
            viagemId: action.lista.viagemId ? mapa('viagem', action.lista.viagemId) : null,
          })
          registrar('lista', action.lista.id, criada.id)
          break
        }

        case 'UPDATE_LISTA': {
          const atual = estado.listas.find((lista) => lista.id === action.id)
          if (!atual) return
          const proxima: TripLista = { ...atual, ...action.patch }
          await api.atualizarLista(mapa('lista', action.id), {
            nome: proxima.nome,
            categoria: proxima.categoria,
            viagemId: proxima.viagemId ? mapa('viagem', proxima.viagemId) : null,
          })
          break
        }

        case 'DELETE_LISTA':
          await api.excluirLista(mapa('lista', action.id))
          break

        case 'ADD_LISTA_ITEM': {
          const criado = await api.criarItemLista(
            mapa('lista', action.item.listaId),
            dadosItemLista(action.item),
          )
          registrar('listaItem', action.item.id, criado.id)
          break
        }

        case 'UPDATE_LISTA_ITEM':
          await api.atualizarItemLista(
            mapa('listaItem', action.id),
            dadosItemListaPatch(action.patch),
          )
          break

        case 'DELETE_LISTA_ITEM':
          await api.excluirItemLista(mapa('listaItem', action.id))
          break

        case 'TOGGLE_LISTA_ITEM':
          await api.atualizarItemLista(mapa('listaItem', action.id), {
            concluido: action.concluido,
          })
          break

        case 'CONCLUIR_LISTA_ITEM':
          await api.atualizarItemLista(mapa('listaItem', action.id), {
            concluido: true,
            valorPago: action.valorPago,
            pagoEm: action.valorPago != null ? action.em : null,
          })
          break

        case 'RESET':
          break

        default:
          break
      }
    },
    [],
  )

  const dispatch = useCallback(
    (action: Action) => {
      fila.current = fila.current.then(async () => {
        try {
          await executar(action)
          await recarregar()
        } catch (erro) {
          console.error(erro)
          if (erro instanceof HttpError && erro.status === 401) {
            window.location.assign('/login')
            return
          }
          window.alert(mensagemDeErro(erro))
        }
      })
    },
    [executar, recarregar],
  )

  const valor = useMemo<TripContextValue>(
    () => ({ state, dispatch, viagemAtivaId, setViagemAtivaId, recarregar, carregando }),
    [state, dispatch, viagemAtivaId, recarregar, carregando],
  )

  return <TripContext.Provider value={valor}>{children}</TripContext.Provider>
}

function carregarLocal(): TripState {
  if (typeof localStorage === 'undefined') return estadoInicial()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return estadoInicial()
    const parsed = JSON.parse(raw) as TripState
    if (!parsed || !Array.isArray(parsed.viagens)) return estadoInicial()
    return migrar(parsed)
  } catch {
    return estadoInicial()
  }
}

/** Provider local (seed + reducer) usado pelos testes de componentes. */
function TripProviderLocal({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, carregarLocal)
  const [viagemAtivaId, setViagemAtivaId] = useReducer(
    (_anterior: ID | null, proximo: ID | null) => proximo,
    null as ID | null,
  )

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* ignora quota/indisponibilidade */
    }
  }, [state])

  const recarregar = useCallback(async () => undefined, [])

  const valor = useMemo<TripContextValue>(
    () => ({
      state,
      dispatch,
      viagemAtivaId,
      setViagemAtivaId,
      recarregar,
      carregando: false,
    }),
    [state, viagemAtivaId, recarregar],
  )

  return <TripContext.Provider value={valor}>{children}</TripContext.Provider>
}

/** Em testes, usa o estado local (seed); em dev/produção, a API. */
export function TripProvider({ children }: { children: ReactNode }) {
  if (import.meta.env.MODE === 'test') {
    return <TripProviderLocal>{children}</TripProviderLocal>
  }
  return <TripProviderApi>{children}</TripProviderApi>
}

export function useTrip(): TripContextValue {
  const contexto = useContext(TripContext)
  if (!contexto) {
    throw new Error('useTrip precisa estar dentro de <TripProvider>')
  }
  return contexto
}
