import { describe, expect, it } from 'vitest'
import { encontrarPassagemDuplicada } from '../importacao/duplicata'
import { parsePassagem } from '../importacao/parser'
import {
  hashArquivo,
  tipoDocumento,
  validarArquivo,
} from '../importacao/arquivo'
import type { TripPassagem } from '../../types'

const TEXTO_COMPLETO = `
COMPANHIA: Exemplo Air
LOCALIZADOR: ABC123
BILHETE: 1234567890123
PASSAGEIRO: ANA BEATRIZ MORAES
VOO: EA 1234
ORIGEM: GRU
DESTINO: POA
PARTIDA: 12/05/2026 08:20
CHEGADA: 12/05/2026 10:05
CLASSE: Econômica
TERMINAL: 2
ASSENTO: 14A
VALOR: R$ 780,00
`

describe('parsePassagem', () => {
  it('extrai os campos de um comprovante completo', () => {
    const { campos, faltando } = parsePassagem(TEXTO_COMPLETO)

    expect(faltando).toEqual([])
    expect(campos).toMatchObject({
      tipo: 'aviao',
      origem: 'GRU',
      destino: 'POA',
      partida: '2026-05-12T08:20:00',
      chegada: '2026-05-12T10:05:00',
      companhia: 'Exemplo Air',
      localizador: 'ABC123',
      numeroBilhete: '1234567890123',
      numeroVoo: 'EA 1234',
      passageiro: 'ANA BEATRIZ MORAES',
      classe: 'Econômica',
      terminal: '2',
      assento: '14A',
      valor: 780,
      moeda: 'BRL',
    })
  })

  it('não inventa dados quando o texto está vazio', () => {
    const { campos, faltando } = parsePassagem('   ')
    expect(campos).toEqual({})
    expect(faltando).toEqual(['origem', 'destino', 'partida'])
  })

  it('aponta os campos obrigatórios ausentes', () => {
    const { campos, faltando } = parsePassagem('COMPANHIA: Exemplo Air')
    expect(campos.companhia).toBe('Exemplo Air')
    expect(faltando).toEqual(['origem', 'destino', 'partida'])
  })

  it('interpreta chegada no dia seguinte quando só há uma data e duas horas', () => {
    const { campos } = parsePassagem(`
      ORIGEM: GRU
      DESTINO: LIS
      DATA: 12/05/2026
      23:00
      01:30
    `)
    expect(campos.partida).toBe('2026-05-12T23:00:00')
    expect(campos.chegada).toBe('2026-05-13T01:30:00')
  })

  it('detecta moeda e valor com separadores brasileiros', () => {
    const { campos } = parsePassagem(`
      ORIGEM: GRU
      DESTINO: POA
      PARTIDA: 12/05/2026 08:20
      VALOR: R$ 1.234,56
    `)
    expect(campos.valor).toBe(1234.56)
    expect(campos.moeda).toBe('BRL')
  })

  it('detecta dólar e euro', () => {
    const usd = parsePassagem(`
      ORIGEM: GRU
      DESTINO: MIA
      PARTIDA: 12/05/2026 08:20
      VALOR: US$ 450.00
    `)
    expect(usd.campos.moeda).toBe('USD')
    expect(usd.campos.valor).toBe(450)

    const eur = parsePassagem(`
      ORIGEM: LIS
      DESTINO: MAD
      PARTIDA: 12/05/2026 08:20
      VALOR: € 120,50
    `)
    expect(eur.campos.moeda).toBe('EUR')
    expect(eur.campos.valor).toBe(120.5)
  })

  it('reconhece origem e destino no formato GRU → POA', () => {
    const { campos } = parsePassagem(`
      GRU → POA
      PARTIDA: 12/05/2026 08:20
    `)
    expect(campos.origem).toBe('GRU')
    expect(campos.destino).toBe('POA')
  })

  it('infere ônibus e trem pelo texto', () => {
    expect(
      parsePassagem('Ônibus rodoviário de São Paulo para o Rio').campos.tipo,
    ).toBe('onibus')
    expect(parsePassagem('Trem regional Lisboa - Sintra').campos.tipo).toBe(
      'trem',
    )
  })
})

describe('encontrarPassagemDuplicada', () => {
  function passagem(overrides: Partial<TripPassagem> = {}): TripPassagem {
    return {
      id: 'p1',
      viagemId: 'v1',
      tipo: 'aviao',
      origem: 'GRU',
      destino: 'POA',
      partida: '2026-05-12T08:20:00',
      localizador: 'ABC123',
      numeroBilhete: '1234567890123',
      documentoHash: 'hash-1',
      ...overrides,
    }
  }

  it('encontra pelo hash do comprovante', () => {
    const existente = encontrarPassagemDuplicada(
      [passagem()],
      'hash-1',
      {},
    )
    expect(existente?.id).toBe('p1')
  })

  it('encontra por localizador e número do bilhete', () => {
    const existente = encontrarPassagemDuplicada(
      [passagem({ documentoHash: 'outro' })],
      'novo-hash',
      { localizador: 'ABC123', numeroBilhete: '1234567890123' },
    )
    expect(existente?.id).toBe('p1')
  })

  it('não considera duplicada com apenas um dos identificadores', () => {
    expect(
      encontrarPassagemDuplicada(
        [passagem({ documentoHash: 'outro' })],
        'novo-hash',
        { localizador: 'ABC123' },
      ),
    ).toBeUndefined()
  })

  it('devolve undefined quando não há correspondência', () => {
    expect(
      encontrarPassagemDuplicada(
        [passagem({ documentoHash: 'outro' })],
        'novo-hash',
        { localizador: 'XYZ999', numeroBilhete: '999' },
      ),
    ).toBeUndefined()
  })
})

describe('arquivo', () => {
  it('identifica o tipo do documento', () => {
    const pdf = new File(['x'], 'bilhete.pdf', { type: 'application/pdf' })
    const imagem = new File(['x'], 'print.png', { type: 'image/png' })
    const invalido = new File(['x'], 'nota.txt', { type: 'text/plain' })

    expect(tipoDocumento(pdf)).toBe('pdf')
    expect(tipoDocumento(imagem)).toBe('imagem')
    expect(tipoDocumento(invalido)).toBeNull()
  })

  it('valida formato, tamanho e conteúdo', () => {
    const valido = new File(['x'], 'bilhete.pdf', { type: 'application/pdf' })
    const invalido = new File(['x'], 'nota.txt', { type: 'text/plain' })
    const vazio = new File([], 'vazio.pdf', { type: 'application/pdf' })

    expect(validarArquivo(valido)).toBeUndefined()
    expect(validarArquivo(invalido)).toBe(
      'Formato não suportado. Envie PDF, JPG, PNG ou WEBP.',
    )
    expect(validarArquivo(vazio)).toBe('O arquivo está vazio.')
  })

  it('gera hash estável por conteúdo', async () => {
    const a = new File(['conteudo'], 'a.pdf', { type: 'application/pdf' })
    const b = new File(['conteudo'], 'b.pdf', { type: 'application/pdf' })
    const c = new File(['outro'], 'c.pdf', { type: 'application/pdf' })

    const hashA = await hashArquivo(a)
    const hashB = await hashArquivo(b)
    const hashC = await hashArquivo(c)

    expect(hashA).toBe(hashB)
    expect(hashA).not.toBe(hashC)
    expect(hashA).toHaveLength(64)
  })
})
