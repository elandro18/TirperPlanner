import type { ID, TripDia, TripLocal, TripState } from '../types'
import {
  destinoDoDia,
  destinosDaViagem,
  diasDaViagem,
  intervalosDoDia,
  roteiroDoDia,
} from './derive'
import { hhmmToMin, minToHhmm } from './format'
import {
  distanciaKm,
  tempoDeslocamentoMin,
  type PontoGeo,
} from './geo'

export interface ConfigSugestao {
  inicioDia?: string
  fimDia?: string
  velocidadeKmh?: number
  fatorDesvio?: number
}

export interface ItemSugerido {
  localId: ID
  nome: string
  inicio: string
  fim: string
  deslocamentoMin: number
}

export interface DiaSugerido {
  diaId: ID
  numero: number
  data?: string
  destinoNome?: string
  itens: ItemSugerido[]
}

export interface LocalPendente {
  id: ID
  nome: string
  motivo: string
}

export interface SugestaoRoteiro {
  dias: DiaSugerido[]
  semCoordenadas: { id: ID; nome: string }[]
  naoAlocados: LocalPendente[]
  avisos: string[]
}

interface Janela {
  inicio: number
  fim: number
}

const DURACAO_PADRAO = 60

function coordenadas(local: TripLocal): PontoGeo | undefined {
  if (local.lat == null || local.lng == null) return undefined
  return { lat: local.lat, lng: local.lng }
}

function janelasLivres(
  ocupados: { inicio: number; fim: number }[],
  inicioDia: number,
  fimDia: number,
): Janela[] {
  const janelas: Janela[] = []
  let cursor = inicioDia

  for (const intervalo of [...ocupados].sort((a, b) => a.inicio - b.inicio)) {
    if (intervalo.fim <= cursor) continue
    if (intervalo.inicio > cursor) {
      janelas.push({ inicio: cursor, fim: Math.min(intervalo.inicio, fimDia) })
    }
    cursor = Math.max(cursor, intervalo.fim)
    if (cursor >= fimDia) break
  }

  if (cursor < fimDia) janelas.push({ inicio: cursor, fim: fimDia })
  return janelas.filter((j) => j.fim > j.inicio)
}

function pontoDePartida(
  state: TripState,
  dia: TripDia,
): PontoGeo | undefined {
  const destino = destinoDoDia(state, dia)
  if (destino?.lat != null && destino.lng != null) {
    return { lat: destino.lat, lng: destino.lng }
  }

  const hoteis = state.hoteis.filter((h) => {
    if (h.viagemId !== dia.viagemId) return false
    if (h.lat == null || h.lng == null) return false
    if (!dia.data) return true
    return dia.data >= h.checkin.slice(0, 10) && dia.data < h.checkout.slice(0, 10)
  })
  if (hoteis.length) return { lat: hoteis[0].lat!, lng: hoteis[0].lng! }

  const comCoordenadas = roteiroDoDia(state, dia.id).find(
    ({ item }) =>
      item.tipo === 'LOCAL' &&
      item.local.lat != null &&
      item.local.lng != null,
  )
  if (comCoordenadas && comCoordenadas.item.tipo === 'LOCAL') {
    return {
      lat: comCoordenadas.item.local.lat!,
      lng: comCoordenadas.item.local.lng!,
    }
  }

  return undefined
}

function diasElegiveis(
  state: TripState,
  dias: TripDia[],
  local: TripLocal,
): TripDia[] {
  const cidade = local.cidade?.trim().toLowerCase()
  if (!cidade) return dias

  const destino = destinosDaViagem(state, local.viagemId).find((d) => {
    const nome = d.nome.trim().toLowerCase()
    const cidadeDestino = (d.cidade ?? d.nome).trim().toLowerCase()
    return nome === cidade || cidadeDestino === cidade
  })
  if (!destino) return dias

  const doDestino = dias.filter(
    (d) =>
      d.destinoId === destino.id ||
      (!!d.data &&
        !!destino.dataInicio &&
        !!destino.dataFim &&
        d.data >= destino.dataInicio &&
        d.data <= destino.dataFim),
  )
  return doDestino.length ? doDestino : dias
}

function localCabe(
  local: TripLocal,
  janela: Janela,
  deslocamentoMin: number,
): { inicio: number; fim: number } | null {
  const duracao = local.duracaoMin ?? DURACAO_PADRAO
  const abertura = hhmmToMin(local.horarioAbertura) ?? 0
  const fechamento = hhmmToMin(local.horarioFechamento) ?? 24 * 60

  if (fechamento <= abertura) return null
  if (duracao > fechamento - abertura) return null

  const inicio = Math.max(janela.inicio + deslocamentoMin, abertura)
  const fim = inicio + duracao
  if (inicio >= janela.fim || fim > janela.fim || fim > fechamento) return null
  return { inicio, fim }
}

export function sugerirRoteiro(
  state: TripState,
  viagemId: ID,
  config: ConfigSugestao = {},
): SugestaoRoteiro {
  const inicioDia = hhmmToMin(config.inicioDia ?? '09:00') ?? 540
  const fimDia = hhmmToMin(config.fimDia ?? '20:00') ?? 1200
  const velocidadeKmh = config.velocidadeKmh ?? 30
  const fatorDesvio = config.fatorDesvio ?? 1.3

  const dias = diasDaViagem(state, viagemId)
  const locais = state.locais.filter((l) => l.viagemId === viagemId)
  const organizados = new Set(
    state.roteiro
      .filter((r) => r.viagemId === viagemId && r.tipoItem === 'LOCAL')
      .map((r) => r.itemId),
  )
  const pendentes = locais.filter((l) => !organizados.has(l.id))

  const comCoordenadas = pendentes.filter((l) => !!coordenadas(l))
  const semCoordenadas = pendentes
    .filter((l) => !coordenadas(l))
    .map((l) => ({ id: l.id, nome: l.nome }))

  const avisos: string[] = []
  if (!dias.length) avisos.push('A viagem ainda não tem dias para receber o roteiro.')
  if (!pendentes.length) {
    avisos.push('Todos os locais desta viagem já estão organizados no roteiro.')
  }
  if (semCoordenadas.length) {
    avisos.push(
      `${semCoordenadas.length} local(is) sem coordenadas ficaram fora da sugestão. Corrija a localização para incluí-los.`,
    )
  }

  const restantes = [...comCoordenadas]
  const resultado: DiaSugerido[] = []

  for (const dia of dias) {
    const fixos = intervalosDoDia(roteiroDoDia(state, dia.id))
    const janelas = janelasLivres(fixos, inicioDia, fimDia)
    const itens: ItemSugerido[] = []
    let pontoAtual = pontoDePartida(state, dia)
    let janelaAtual = 0

    if (!janelas.length && restantes.length) {
      continue
    }

    while (janelaAtual < janelas.length) {
      const janela = janelas[janelaAtual]

      let melhor: {
        indice: number
        local: TripLocal
        inicio: number
        fim: number
        deslocamentoMin: number
      } | null = null

      for (let i = 0; i < restantes.length; i++) {
        const local = restantes[i]
        if (!diasElegiveis(state, dias, local).some((d) => d.id === dia.id)) {
          continue
        }

        const pontoLocal = coordenadas(local)
        if (!pontoLocal) continue

        const deslocamentoMin = pontoAtual
          ? tempoDeslocamentoMin(
              distanciaKm(pontoAtual, pontoLocal),
              velocidadeKmh,
              fatorDesvio,
            )
          : 0
        const encaixe = localCabe(local, janela, deslocamentoMin)
        if (!encaixe) continue

        if (
          !melhor ||
          deslocamentoMin < melhor.deslocamentoMin ||
          (deslocamentoMin === melhor.deslocamentoMin &&
            encaixe.inicio < melhor.inicio)
        ) {
          melhor = {
            indice: i,
            local,
            inicio: encaixe.inicio,
            fim: encaixe.fim,
            deslocamentoMin,
          }
        }
      }

      if (!melhor) {
        janelaAtual += 1
        continue
      }

      itens.push({
        localId: melhor.local.id,
        nome: melhor.local.nome,
        inicio: minToHhmm(melhor.inicio),
        fim: minToHhmm(melhor.fim),
        deslocamentoMin: melhor.deslocamentoMin,
      })

      restantes.splice(melhor.indice, 1)
      pontoAtual = coordenadas(melhor.local) ?? pontoAtual
      janela.inicio = melhor.fim
    }

    if (itens.length) {
      const destino = destinoDoDia(state, dia)
      resultado.push({
        diaId: dia.id,
        numero: dia.numero,
        data: dia.data,
        destinoNome: destino?.nome,
        itens,
      })
    }
  }

  const naoAlocados = restantes.map((local) => {
    const diasDoLocal = diasElegiveis(state, dias, local)
    const motivo = diasDoLocal.length
      ? 'Sem janela livre compatível com a duração e o horário de funcionamento.'
      : 'Nenhum dia compatível com o destino do local.'
    return { id: local.id, nome: local.nome, motivo }
  })

  if (naoAlocados.length) {
    avisos.push(
      `${naoAlocados.length} local(is) não couberam no período disponível.`,
    )
  }

  return { dias: resultado, semCoordenadas, naoAlocados, avisos }
}
