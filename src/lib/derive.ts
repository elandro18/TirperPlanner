import type {
  ID,
  TripDestino,
  TripDia,
  TripHotel,
  TripLocal,
  TripPassagem,
  TripRoteiro,
  TripState,
} from '../types'
import { CATEGORIA_META, TRANSPORTE_META } from '../types'
import { hhmmToMin, horaDe, minToHhmm } from './format'
import { intervalosSobrepoem } from './roteiro'

export type ItemResolvido =
  | { tipo: 'LOCAL'; local: TripLocal }
  | { tipo: 'PASSAGEM'; passagem: TripPassagem }
  | { tipo: 'HOTEL'; hotel: TripHotel }

export interface EntradaResolvida {
  entrada: TripRoteiro
  item: ItemResolvido
}

/* --- seleção básica ------------------------------------------------ */
export function viagemAtiva(state: TripState) {
  return state.viagens.find((v) => v.ativa) ?? state.viagens[0] ?? null
}

export function viagemPorId(state: TripState, id: ID | null) {
  if (!id) return null
  return state.viagens.find((v) => v.id === id) ?? null
}

export function diasDaViagem(state: TripState, viagemId: ID): TripDia[] {
  return state.dias
    .filter((d) => d.viagemId === viagemId)
    .sort((a, b) => a.numero - b.numero)
}

export function destinosDaViagem(
  state: TripState,
  viagemId: ID,
): TripDestino[] {
  return state.destinos
    .filter((d) => d.viagemId === viagemId)
    .sort((a, b) => a.ordem - b.ordem)
}

export function destinoDoDia(
  state: TripState,
  dia: TripDia,
): TripDestino | null {
  if (!dia.destinoId) return null
  return state.destinos.find((d) => d.id === dia.destinoId) ?? null
}

export function locaisDaViagem(state: TripState, viagemId: ID): TripLocal[] {
  return state.locais.filter((l) => l.viagemId === viagemId)
}

export function passagensDaViagem(state: TripState, viagemId: ID): TripPassagem[] {
  return state.passagens.filter((p) => p.viagemId === viagemId)
}

export function hoteisDaViagem(state: TripState, viagemId: ID): TripHotel[] {
  return state.hoteis.filter((h) => h.viagemId === viagemId)
}

export function resolverItem(state: TripState, r: TripRoteiro): ItemResolvido | null {
  if (r.tipoItem === 'LOCAL') {
    const local = state.locais.find((l) => l.id === r.itemId)
    return local ? { tipo: 'LOCAL', local } : null
  }
  if (r.tipoItem === 'PASSAGEM') {
    const passagem = state.passagens.find((p) => p.id === r.itemId)
    return passagem ? { tipo: 'PASSAGEM', passagem } : null
  }
  const hotel = state.hoteis.find((h) => h.id === r.itemId)
  return hotel ? { tipo: 'HOTEL', hotel } : null
}

export function roteiroDoDia(state: TripState, diaId: ID): EntradaResolvida[] {
  return state.roteiro
    .filter((r) => r.diaId === diaId)
    .sort((a, b) => a.ordem - b.ordem)
    .map((entrada) => ({ entrada, item: resolverItem(state, entrada) }))
    .filter((e): e is EntradaResolvida => e.item !== null)
}

/* --- organização --------------------------------------------------- */
export function itemOrganizado(
  state: TripState,
  tipoItem: TripRoteiro['tipoItem'],
  itemId: ID,
): boolean {
  return state.roteiro.some(
    (r) => r.tipoItem === tipoItem && r.itemId === itemId,
  )
}

export function diasDoItem(
  state: TripState,
  tipoItem: TripRoteiro['tipoItem'],
  itemId: ID,
): TripDia[] {
  const diaIds = new Set(
    state.roteiro
      .filter((r) => r.tipoItem === tipoItem && r.itemId === itemId)
      .map((r) => r.diaId),
  )
  return state.dias
    .filter((d) => diaIds.has(d.id))
    .sort((a, b) => a.numero - b.numero)
}

/* --- resumo da viagem --------------------------------------------- */
export interface ResumoViagem {
  dias: number
  locais: number
  passagens: number
  hoteis: number
  totalItens: number
  itensOrganizados: number
  progresso: number // 0..100
  orcamento: {
    locais: number
    passagens: number
    hoteis: number
    total: number
  }
}

export function resumoViagem(state: TripState, viagemId: ID): ResumoViagem {
  const locais = locaisDaViagem(state, viagemId)
  const passagens = passagensDaViagem(state, viagemId)
  const hoteis = hoteisDaViagem(state, viagemId)

  const organizados =
    locais.filter((l) => itemOrganizado(state, 'LOCAL', l.id)).length +
    passagens.filter((p) => itemOrganizado(state, 'PASSAGEM', p.id)).length +
    hoteis.filter((h) => itemOrganizado(state, 'HOTEL', h.id)).length

  const totalItens = locais.length + passagens.length + hoteis.length

  const custoLocais = locais.reduce((s, l) => s + (l.custo ?? 0), 0)
  const custoPassagens = passagens.reduce((s, p) => s + (p.valor ?? 0), 0)
  const custoHoteis = hoteis.reduce(
    (s, h) => s + (h.valorTotal ?? (h.valorNoite ?? 0) * (h.noites ?? 0)),
    0,
  )

  return {
    dias: diasDaViagem(state, viagemId).length,
    locais: locais.length,
    passagens: passagens.length,
    hoteis: hoteis.length,
    totalItens,
    itensOrganizados: organizados,
    progresso: totalItens ? Math.round((organizados / totalItens) * 100) : 0,
    orcamento: {
      locais: custoLocais,
      passagens: custoPassagens,
      hoteis: custoHoteis,
      total: custoLocais + custoPassagens + custoHoteis,
    },
  }
}

/* --- conflitos de horário ----------------------------------------- */
export interface Intervalo {
  id: ID
  inicio: number
  fim: number
  titulo: string
}

/**
 * Intervalos de um dia (minutos), para validação de sobreposição.
 *
 * Só participam atividades com horário DEFINIDO NO ROTEIRO (`entrada.inicio`).
 * Atividades sem horário no roteiro continuam permitidas e ficam fora da
 * validação. O término vem de `entrada.fim` ou, na falta dele, da duração
 * estimada do local / chegada da passagem. Hospedagens cobrem o dia inteiro e
 * são excluídas.
 */
export function intervalosDoDia(entradas: EntradaResolvida[]): Intervalo[] {
  const out: Intervalo[] = []
  for (const { entrada, item } of entradas) {
    if (item.tipo === 'HOTEL') continue
    const inicio = hhmmToMin(entrada.inicio)
    if (inicio == null) continue
    let fim = hhmmToMin(entrada.fim)
    if (fim == null) {
      if (item.tipo === 'LOCAL') {
        const fimLocal = hhmmToMin(item.local.horarioFim)
        if (fimLocal != null && fimLocal > inicio) fim = fimLocal
        else if (item.local.duracaoMin) fim = inicio + item.local.duracaoMin
      } else if (item.tipo === 'PASSAGEM' && item.passagem.chegada) {
        const chegada = hhmmToMin(horaDe(item.passagem.chegada))
        if (chegada != null) fim = chegada > inicio ? chegada : 1440
      }
    }
    if (fim == null || fim <= inicio) continue
    const titulo =
      item.tipo === 'LOCAL'
        ? item.local.nome
        : item.passagem.origem + ' → ' + item.passagem.destino
    out.push({ id: entrada.id, inicio, fim, titulo })
  }
  return out.sort((a, b) => a.inicio - b.inicio)
}

export interface ConflitoDia {
  a: Intervalo
  b: Intervalo
}

/** Pares de atividades que se sobrepõem no mesmo dia. */
export function conflitosDoDia(entradas: EntradaResolvida[]): ConflitoDia[] {
  const intervalos = intervalosDoDia(entradas)
  const conflitos: ConflitoDia[] = []
  for (let i = 0; i < intervalos.length; i++) {
    for (let j = i + 1; j < intervalos.length; j++) {
      if (intervalosSobrepoem(intervalos[i], intervalos[j])) {
        conflitos.push({ a: intervalos[i], b: intervalos[j] })
      }
    }
  }
  return conflitos
}

/** IDs de entradas que se sobrepõem no mesmo dia. */
export function idsEmConflito(entradas: EntradaResolvida[]): Set<ID> {
  const conflitos = new Set<ID>()
  for (const { a, b } of conflitosDoDia(entradas)) {
    conflitos.add(a.id)
    conflitos.add(b.id)
  }
  return conflitos
}

/** Procura uma atividade que conflite com o intervalo candidato no mesmo dia.
 *  A própria atividade (candidato.id) é ignorada — editar não conflita consigo. */
export function encontrarConflito(
  entradas: EntradaResolvida[],
  candidato: { id?: ID; inicio: number; fim: number },
): Intervalo | null {
  for (const it of intervalosDoDia(entradas)) {
    if (it.id === candidato.id) continue
    if (intervalosSobrepoem(candidato, it)) return it
  }
  return null
}

/** Título legível de um item, independente do tipo. */
export function tituloDoItem(item: ItemResolvido): string {
  if (item.tipo === 'LOCAL') return item.local.nome
  if (item.tipo === 'PASSAGEM')
    return `${item.passagem.origem} → ${item.passagem.destino}`
  return item.hotel.nome
}

export function emojiDoItem(item: ItemResolvido): string {
  if (item.tipo === 'LOCAL') return CATEGORIA_META[item.local.categoria].emoji
  if (item.tipo === 'PASSAGEM') return TRANSPORTE_META[item.passagem.tipo].emoji
  return '🏨'
}

/** Horário atribuído no roteiro. Sem horário definido, o item não tem horário. */
export function horarioDaEntrada(
  entrada: TripRoteiro,
  item: ItemResolvido,
): { inicio?: string; fim?: string } {
  const inicio = entrada.inicio
  let fim = entrada.fim

  if (!fim && inicio) {
    const ini = hhmmToMin(inicio)
    if (ini != null) {
      if (item.tipo === 'LOCAL') {
        const fimLocal = hhmmToMin(item.local.horarioFim)
        if (fimLocal != null && fimLocal > ini) fim = item.local.horarioFim
        else if (item.local.duracaoMin) fim = minToHhmm(ini + item.local.duracaoMin)
      } else if (item.tipo === 'PASSAGEM' && item.passagem.chegada) {
        const chegada = hhmmToMin(horaDe(item.passagem.chegada))
        if (chegada != null) fim = chegada > ini ? horaDe(item.passagem.chegada) : '24:00'
      }
    }
  }

  return { inicio, fim }
}

/** Horário natural do registro — usado apenas para sugerir/validar a inclusão. */
export function horarioNatural(
  state: TripState,
  tipoItem: TripRoteiro['tipoItem'],
  itemId: ID,
): { inicio?: string; fim?: string } {
  if (tipoItem === 'LOCAL') {
    const local = state.locais.find((l) => l.id === itemId)
    return { inicio: local?.horarioPrevisto, fim: local?.horarioFim }
  }
  if (tipoItem === 'PASSAGEM') {
    const passagem = state.passagens.find((p) => p.id === itemId)
    return {
      inicio: horaDe(passagem?.partida),
      fim: horaDe(passagem?.chegada),
    }
  }
  return {}
}

export interface CandidatoRoteiro {
  id?: ID
  diaId: ID
  tipoItem: TripRoteiro['tipoItem']
  itemId: ID
  inicio?: string
  fim?: string
}

/**
 * Conflito que o candidato criaria no dia de destino. Usa o horário informado
 * ou, na falta dele, o horário natural do registro. O próprio item (id) é
 * ignorado para permitir editar sem conflitar consigo.
 */
export function conflitoAoAdicionar(
  state: TripState,
  candidato: CandidatoRoteiro,
): Intervalo | null {
  const natural = horarioNatural(state, candidato.tipoItem, candidato.itemId)
  const inicio = hhmmToMin(candidato.inicio ?? natural.inicio)
  if (inicio == null) return null

  let fim = hhmmToMin(candidato.fim) ?? hhmmToMin(natural.fim)

  if (fim == null) {
    if (candidato.tipoItem === 'LOCAL') {
      const local = state.locais.find((l) => l.id === candidato.itemId)
      if (local?.duracaoMin) fim = inicio + local.duracaoMin
    } else if (candidato.tipoItem === 'PASSAGEM') {
      const chegada = hhmmToMin(natural.fim)
      if (chegada != null) fim = chegada > inicio ? chegada : 1440
    }
  } else if (fim <= inicio) {
    if (candidato.tipoItem === 'PASSAGEM') {
      fim = 1440
    } else {
      const local = state.locais.find((l) => l.id === candidato.itemId)
      fim = local?.duracaoMin ? inicio + local.duracaoMin : undefined
    }
  }

  if (fim == null || fim <= inicio) return null

  return encontrarConflito(roteiroDoDia(state, candidato.diaId), {
    id: candidato.id,
    inicio,
    fim,
  })
}

/** Custo estimado dos locais de um dia (soma dos locais distintos). */
export function custoEstimadoDoDia(entradas: EntradaResolvida[]): number {
  const vistos = new Set<ID>()
  let total = 0
  for (const { item } of entradas) {
    if (item.tipo === 'LOCAL' && !vistos.has(item.local.id)) {
      vistos.add(item.local.id)
      total += item.local.custo ?? 0
    }
  }
  return total
}

/* --- próximos itens ------------------------------------------------ */
export function proximosItens(
  state: TripState,
  viagemId: ID,
  limite = 4,
): { dia: TripDia; entrada: EntradaResolvida }[] {
  const dias = diasDaViagem(state, viagemId)
  const out: { dia: TripDia; entrada: EntradaResolvida }[] = []
  for (const dia of dias) {
    for (const entrada of roteiroDoDia(state, dia.id)) {
      out.push({ dia, entrada })
      if (out.length >= limite) return out
    }
  }
  return out
}
