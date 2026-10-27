import { describe, expect, it } from 'vitest'
import { intervalosSobrepoem, ordenarPorHorario } from '../roteiro'
import type { TripRoteiro } from '../../types'

function entrada(
  id: string,
  inicio: string | undefined,
  ordem: number,
): TripRoteiro {
  return {
    id,
    viagemId: 'v1',
    diaId: 'd1',
    tipoItem: 'LOCAL',
    itemId: id,
    ordem,
    inicio,
  }
}

function sequencia(roteiro: TripRoteiro[]): string[] {
  return [...roteiro].sort((a, b) => a.ordem - b.ordem).map((r) => r.id)
}

describe('ordenarPorHorario', () => {
  it('ordena as atividades pelo horário de início', () => {
    const out = ordenarPorHorario(
      [
        entrada('castelo', '14:00', 0),
        entrada('museu', '09:00', 1),
        entrada('almoco', '11:00', 2),
      ],
      'd1',
    )
    expect(sequencia(out)).toEqual(['museu', 'almoco', 'castelo'])
  })

  it('mantém atividades sem horário no fim, preservando a ordem manual', () => {
    const out = ordenarPorHorario(
      [
        entrada('sem-1', undefined, 5),
        entrada('com-hora', '10:00', 1),
        entrada('sem-2', undefined, 2),
      ],
      'd1',
    )
    expect(sequencia(out)).toEqual(['com-hora', 'sem-2', 'sem-1'])
  })

  it('não altera as ordens de outros dias', () => {
    const outro = { ...entrada('outro', '08:00', 0), diaId: 'd2' }
    const out = ordenarPorHorario(
      [entrada('a', '12:00', 0), entrada('b', '09:00', 1), outro],
      'd1',
    )
    expect(out.find((r) => r.id === 'outro')?.ordem).toBe(0)
  })
})

describe('intervalosSobrepoem', () => {
  const a = { inicio: 9 * 60, fim: 11 * 60 }

  it('detecta sobreposição', () => {
    expect(intervalosSobrepoem(a, { inicio: 10 * 60, fim: 12 * 60 })).toBe(true)
  })

  it('permite atividades consecutivas (fim == início)', () => {
    expect(intervalosSobrepoem(a, { inicio: 11 * 60, fim: 12 * 60 })).toBe(false)
  })

  it('não conflita quando não há interseção', () => {
    expect(intervalosSobrepoem(a, { inicio: 14 * 60, fim: 15 * 60 })).toBe(false)
  })
})
