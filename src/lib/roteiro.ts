import type { ID, TripRoteiro } from '../types'
import { hhmmToMin } from './format'

/** Intervalo ocupado por uma atividade, em minutos desde 00:00. */
export interface IntervaloMin {
  inicio: number
  fim: number
}

/**
 * Ordena as atividades de um dia pelo horário de início (crescente).
 * Atividades sem horário definido permanecem no fim, preservando a ordem
 * manual anterior. Reatribui `ordem` sequencialmente (0..n-1).
 */
export function ordenarPorHorario(
  roteiro: TripRoteiro[],
  diaId: ID,
): TripRoteiro[] {
  const doDia = roteiro.filter((r) => r.diaId === diaId)
  const comHorario = doDia
    .filter((r) => hhmmToMin(r.inicio) != null)
    .sort(
      (a, b) =>
        hhmmToMin(a.inicio)! - hhmmToMin(b.inicio)! || a.ordem - b.ordem,
    )
  const semHorario = doDia
    .filter((r) => hhmmToMin(r.inicio) == null)
    .sort((a, b) => a.ordem - b.ordem)

  const posicao = new Map(
    [...comHorario, ...semHorario].map((r, i) => [r.id, i] as const),
  )

  return roteiro.map((r) =>
    r.diaId === diaId ? { ...r, ordem: posicao.get(r.id) ?? r.ordem } : r,
  )
}

/** Aplica `ordenarPorHorario` a todos os dias afetados de uma vez. */
export function ordenarDias(
  roteiro: TripRoteiro[],
  diaIds: ID[],
): TripRoteiro[] {
  return [...new Set(diaIds)].reduce(ordenarPorHorario, roteiro)
}

/**
 * Dois intervalos conflitam quando o início de um ocorre antes do término do
 * outro e seu término ocorre depois do início do outro. Atividades
 * consecutivas (fim == início) NÃO conflitam.
 */
export function intervalosSobrepoem(a: IntervaloMin, b: IntervaloMin): boolean {
  return a.inicio < b.fim && b.inicio < a.fim
}

/** Normaliza "HH:mm" em minutos; devolve null quando inválido. */
export function minutosDe(hhmm?: string): number | null {
  const m = hhmmToMin(hhmm)
  return m == null ? null : m
}
