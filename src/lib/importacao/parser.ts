import type { Moeda, TransporteTipo, TripPassagem } from '../../types'
import { addDias } from '../format'

export interface DadosImportados {
  campos: Partial<TripPassagem>
  encontrados: string[]
  faltando: string[]
}

const OBRIGATORIOS: (keyof TripPassagem)[] = ['origem', 'destino', 'partida']

function limpar(valor?: string): string | undefined {
  if (!valor) return undefined
  const limpo = valor.replace(/\s+/g, ' ').trim().replace(/[.,;:]+$/, '')
  return limpo || undefined
}

function buscar(texto: string, padroes: RegExp[]): string | undefined {
  for (const padrao of padroes) {
    const resultado = padrao.exec(texto)
    if (resultado?.[1]) {
      const valor = limpar(resultado[1])
      if (valor) return valor
    }
  }
  return undefined
}

function normalizarData(valor: string): string | undefined {
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor)
  if (iso) return valor

  const br = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(valor)
  if (!br) return undefined
  return `${br[3]}-${br[2]}-${br[1]}`
}

function normalizarHora(valor: string): string {
  const [h, m] = valor.split(':')
  return `${h.padStart(2, '0')}:${m}`
}

function dataHoraAposRotulo(
  texto: string,
  rotulos: string[],
): string | undefined {
  for (const rotulo of rotulos) {
    const trecho = new RegExp(`${rotulo}[^\\n]{0,90}`, 'i').exec(texto)?.[0]
    if (!trecho) continue

    const data = /(\d{2}\/\d{2}\/\d{4}|\d{4}-\d{2}-\d{2})/.exec(trecho)?.[0]
    if (!data) continue

    const isoData = normalizarData(data)
    if (!isoData) continue

    const hora = /\b([01]?\d|2[0-3]):([0-5]\d)\b/.exec(trecho)?.[0]
    return `${isoData}T${hora ? normalizarHora(hora) : '00:00'}:00`
  }
  return undefined
}

function datasDoTexto(texto: string): string[] {
  const encontradas = [
    ...texto.matchAll(/(\d{2}\/\d{2}\/\d{4}|\d{4}-\d{2}-\d{2})/g),
  ]
  return encontradas
    .map((m) => normalizarData(m[0]))
    .filter((d): d is string => !!d)
}

function horasDoTexto(texto: string): string[] {
  const encontradas = [...texto.matchAll(/\b([01]?\d|2[0-3]):([0-5]\d)\b/g)]
  return encontradas.map((m) => normalizarHora(m[0]))
}

function montarPartidaChegada(texto: string): {
  partida?: string
  chegada?: string
} {
  const partidaRotulo = dataHoraAposRotulo(texto, [
    'partida',
    'departure',
    'embarque',
    'saída',
    'saida',
  ])
  const chegadaRotulo = dataHoraAposRotulo(texto, [
    'chegada',
    'arrival',
    'desembarque',
  ])

  if (partidaRotulo || chegadaRotulo) {
    return { partida: partidaRotulo, chegada: chegadaRotulo }
  }

  const datas = datasDoTexto(texto)
  const horas = horasDoTexto(texto)
  if (!datas.length) return {}

  const partida = `${datas[0]}T${horas[0] ?? '00:00'}:00`
  if (!horas[1]) return { partida }

  let dataChegada = datas[1] ?? datas[0]
  if (!datas[1] && horas[1] <= (horas[0] ?? '00:00')) {
    dataChegada = addDias(dataChegada, 1)
  }
  const chegada = `${dataChegada}T${horas[1]}:00`
  return { partida, chegada }
}

function inferirTipo(texto: string): TransporteTipo {
  if (/\b(trem|train|ferrovi|rail)\b/i.test(texto)) return 'trem'
  if (/\b(ônibus|onibus|bus|rodovi)\b/i.test(texto)) return 'onibus'
  return 'aviao'
}

function numeroValor(valor: string): number | undefined {
  const limpo = valor.replace(/\s/g, '')
  let normalizado = limpo
  if (limpo.includes(',') && limpo.includes('.')) {
    normalizado = limpo.replace(/\./g, '').replace(',', '.')
  } else if (limpo.includes(',')) {
    normalizado = limpo.replace(',', '.')
  }
  const numero = Number(normalizado)
  return Number.isFinite(numero) ? numero : undefined
}

function moedaDoPrefixo(prefixo?: string): Moeda | undefined {
  if (!prefixo) return undefined
  if (/R\$/i.test(prefixo)) return 'BRL'
  if (/US\$|USD|\$/i.test(prefixo)) return 'USD'
  if (/€|EUR/i.test(prefixo)) return 'EUR'
  return undefined
}

export function parsePassagem(entrada: string): DadosImportados {
  const texto = entrada
    .replace(/\r/g, '\n')
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .trim()

  if (!texto) {
    return {
      campos: {},
      encontrados: [],
      faltando: [...OBRIGATORIOS] as string[],
    }
  }

  const { partida, chegada } = montarPartidaChegada(texto)

  const origemCodigo = buscar(texto, [
    /(?:origem|from)[\s:]*([A-Z]{3})/,
    /(?:origem|from)[\s:]*([A-Za-zÀ-ú0-9 .()/-]{2,40})/i,
  ])
  const destinoCodigo = buscar(texto, [
    /(?:destino|to)[\s:]*([A-Z]{3})/,
    /(?:destino|to)[\s:]*([A-Za-zÀ-ú0-9 .()/-]{2,40})/i,
  ])

  const seta = /([A-Z]{3})\s*(?:→|->|–|-|para)\s*([A-Z]{3})/.exec(texto)
  const origem = origemCodigo ?? seta?.[1]
  const destino = destinoCodigo ?? seta?.[2]

  const valorMatch =
    /(?:total|valor|tarifa|preço|preco|amount)[^\n]{0,25}?((?:R\$|US\$|EUR|€|\$)\s*)?([\d.]*\d(?:[.,]\d{1,2})?)/i.exec(
      texto,
    )
  const valor = valorMatch ? numeroValor(valorMatch[2]) : undefined
  const moeda = valorMatch ? moedaDoPrefixo(valorMatch[1]) : undefined

  const campos: Partial<TripPassagem> = {
    tipo: inferirTipo(texto),
    origem,
    destino,
    partida,
    chegada,
    companhia: buscar(texto, [
      /(?:companhia|operadora|airline|operado por)[\s:]*([A-Za-zÀ-ú0-9 .&'-]{2,40})/i,
    ]),
    localizador: buscar(texto, [
      /(?:localizador|record locator|booking|reserva|pnr|código da reserva|codigo da reserva)[\s:#]*([A-Z0-9]{5,10})/i,
    ]),
    numeroBilhete: buscar(texto, [
      /(?:bilhete|ticket|e-?ticket|eticket)[\s:#]*([0-9]{8,14})/i,
    ]),
    passageiro: buscar(texto, [
      /(?:passageiro|passenger)[\s:]*([A-ZÀ-Ú][A-Za-zÀ-ú.' ]{2,60})/i,
    ]),
    numeroVoo: buscar(texto, [
      /(?:voo|vôo|flight)[\s:#]*([A-Z0-9]{2,3}\s?\d{2,4})/i,
    ]),
    classe: buscar(texto, [
      /(?:classe|class)[\s:]*([A-Za-zÀ-ú ]{3,20})/i,
    ]),
    terminal: buscar(texto, [
      /(?:terminal|aeroporto|airport)[\s:]*([A-Za-zÀ-ú0-9 .()/-]{1,50})/i,
    ]),
    assento: buscar(texto, [
      /(?:assento|seat)[\s:]*([0-9]{1,2}[A-Z])/i,
    ]),
    valor,
    moeda,
  }

  const limpado = Object.fromEntries(
    Object.entries(campos).filter(([, valor]) => valor !== undefined),
  ) as Partial<TripPassagem>

  const encontrados = Object.keys(limpado)
  const faltando = OBRIGATORIOS.filter(
    (campo) => limpado[campo] === undefined,
  ) as string[]

  return { campos: limpado, encontrados, faltando }
}
