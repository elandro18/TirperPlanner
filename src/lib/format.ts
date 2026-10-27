import type { Moeda } from '../types'

const MESES = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
]

const MESES_CURTOS = [
  'jan',
  'fev',
  'mar',
  'abr',
  'mai',
  'jun',
  'jul',
  'ago',
  'set',
  'out',
  'nov',
  'dez',
]

/** Converte 'YYYY-MM-DD' em Date local (sem deslocamento de fuso). */
export function parseData(iso: string): Date {
  const [ano, mes, dia] = iso.slice(0, 10).split('-').map(Number)
  return new Date(ano, (mes ?? 1) - 1, dia ?? 1)
}

export function isoDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function addDias(iso: string, n: number): string {
  const d = parseData(iso)
  d.setDate(d.getDate() + n)
  return isoDate(d)
}

export function diasEntre(inicio: string, fim: string): number {
  const a = parseData(inicio)
  const b = parseData(fim)
  const ms = b.getTime() - a.getTime()
  return Math.round(ms / 86_400_000)
}

/** Lista de datas ISO entre início e fim, inclusive. */
export function gerarDatas(inicio: string, fim: string): string[] {
  const total = Math.max(0, diasEntre(inicio, fim))
  return Array.from({ length: total + 1 }, (_, i) => addDias(inicio, i))
}

export function formatDiaMes(iso: string): string {
  const d = parseData(iso)
  return `${d.getDate()} de ${MESES[d.getMonth()]}`
}

export function formatDataLonga(iso: string): string {
  const d = parseData(iso)
  return `${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`
}

export function formatDataCurta(iso: string): string {
  const d = parseData(iso)
  return `${String(d.getDate()).padStart(2, '0')}/${String(
    d.getMonth() + 1,
  ).padStart(2, '0')}`
}

export function formatMesCurto(iso: string): string {
  const d = parseData(iso)
  return MESES_CURTOS[d.getMonth()]
}

/** Período opcional — viagens sem datas usam "Datas a definir". */
export function formatPeriodoOpcional(inicio?: string, fim?: string): string {
  if (inicio && fim) return formatPeriodo(inicio, fim)
  if (inicio) return `A partir de ${formatDataLonga(inicio)}`
  if (fim) return `Até ${formatDataLonga(fim)}`
  return 'Datas a definir'
}

/** Rótulo de um dia: data quando existir, senão "Dia N". */
export function formatDiaOuNumero(data: string | undefined, numero: number): string {
  return data ? formatDiaMes(data) : `Dia ${numero}`
}

/** "12 – 15 de maio de 2026" (compacta meses/anos iguais). */
export function formatPeriodo(inicio: string, fim: string): string {
  const a = parseData(inicio)
  const b = parseData(fim)
  const mesA = MESES[a.getMonth()]
  const mesB = MESES[b.getMonth()]
  if (a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()) {
    return `${a.getDate()} – ${b.getDate()} de ${mesA} de ${a.getFullYear()}`
  }
  if (a.getFullYear() === b.getFullYear()) {
    return `${a.getDate()} de ${mesA} – ${b.getDate()} de ${mesB} de ${a.getFullYear()}`
  }
  return `${formatDataLonga(inicio)} – ${formatDataLonga(fim)}`
}

/** Extrai 'HH:mm' de um ISO datetime ou de um 'HH:mm'. */
export function horaDe(valor?: string): string | undefined {
  if (!valor) return undefined
  if (valor.length <= 5) return valor
  const d = new Date(valor)
  if (Number.isNaN(d.getTime())) return undefined
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export function formatDataHora(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const dia = String(d.getDate()).padStart(2, '0')
  return `${dia} ${MESES_CURTOS[d.getMonth()]} · ${horaDe(iso)}`
}

export function formatMoeda(valor?: number, moeda: Moeda = 'BRL'): string {
  if (valor == null || Number.isNaN(valor)) return '—'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: moeda,
    maximumFractionDigits: 0,
  }).format(valor)
}

export function hhmmToMin(hhmm?: string): number | undefined {
  if (!hhmm) return undefined
  const [h, m] = hhmm.split(':').map(Number)
  if (Number.isNaN(h) || Number.isNaN(m)) return undefined
  return h * 60 + m
}

export function minToHhmm(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function formatDuracao(min?: number): string | undefined {
  if (!min || min <= 0) return undefined
  const h = Math.floor(min / 60)
  const m = min % 60
  if (h && m) return `${h}h ${m}min`
  if (h) return `${h}h`
  return `${m}min`
}

export function plural(n: number, singular: string, plural: string): string {
  return n === 1 ? singular : plural
}

/** Timestamp atual em ISO — centralizado para não instanciar Date no render. */
export function agoraISO(): string {
  return new Date().toISOString()
}
