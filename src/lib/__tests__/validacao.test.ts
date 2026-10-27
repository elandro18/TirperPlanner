import { describe, expect, it } from 'vitest'
import {
  dataISOValida,
  horaValida,
  periodoValido,
  validarIntervaloHorario,
  validarPeriodo,
  validarPeriodoCampos,
  validarPeriodoParcial,
  validarUrlImagem,
} from '../validacao'

describe('dataISOValida', () => {
  it('aceita datas ISO reais', () => {
    expect(dataISOValida('2026-05-12')).toBe(true)
    expect(dataISOValida('2024-02-29')).toBe(true)
  })

  it('rejeita formato e datas inexistentes', () => {
    expect(dataISOValida(undefined)).toBe(false)
    expect(dataISOValida('')).toBe(false)
    expect(dataISOValida('12/05/2026')).toBe(false)
    expect(dataISOValida('2026-13-01')).toBe(false)
    expect(dataISOValida('2026-02-30')).toBe(false)
    expect(dataISOValida('2025-02-29')).toBe(false)
  })
})

describe('validarPeriodo', () => {
  it('exige início e fim', () => {
    expect(validarPeriodo()).toBe('Informe a data de início')
    expect(validarPeriodo('2026-05-12')).toBe('Informe a data de fim')
  })

  it('rejeita data final anterior à inicial', () => {
    expect(validarPeriodo('2026-05-15', '2026-05-12')).toBe(
      'A data de fim não pode ser anterior à data de início',
    )
  })

  it('aceita o mesmo dia e intervalos válidos', () => {
    expect(validarPeriodo('2026-05-12', '2026-05-12')).toBeUndefined()
    expect(validarPeriodo('2026-05-12', '2026-05-15')).toBeUndefined()
    expect(periodoValido('2026-05-12', '2026-05-15')).toBe(true)
  })
})

describe('validarPeriodoCampos', () => {
  it('devolve erros por campo', () => {
    expect(validarPeriodoCampos('', '')).toEqual({
      dataInicio: 'Informe a data de início',
      dataFim: 'Informe a data de fim',
    })
    expect(validarPeriodoCampos('2026-05-15', '2026-05-12')).toEqual({
      dataFim: 'A data de fim não pode ser anterior à data de início',
    })
  })
})

describe('validarPeriodoParcial', () => {
  it('não reclama de campos ainda vazios', () => {
    expect(validarPeriodoParcial()).toEqual({})
    expect(validarPeriodoParcial('2026-05-12', '')).toEqual({})
  })

  it('rejeita ordem inválida durante o preenchimento', () => {
    expect(validarPeriodoParcial('2026-05-15', '2026-05-12')).toEqual({
      dataFim: 'A data de fim não pode ser anterior à data de início',
    })
  })
})

describe('validarIntervaloHorario', () => {
  it('valida o formato HH:mm', () => {
    expect(horaValida('09:00')).toBe(true)
    expect(horaValida('23:59')).toBe(true)
    expect(horaValida('24:00')).toBe(false)
    expect(horaValida('9:00')).toBe(false)
    expect(horaValida('09:60')).toBe(false)
  })

  it('exige fim posterior ao início', () => {
    expect(validarIntervaloHorario('09:00', '10:30')).toBeUndefined()
    expect(validarIntervaloHorario('10:30', '09:00')).toBe(
      'O horário de fim deve ser posterior ao de início',
    )
    expect(validarIntervaloHorario('09:00', '09:00')).toBe(
      'O horário de fim deve ser posterior ao de início',
    )
  })

  it('aceita apenas um dos horários', () => {
    expect(validarIntervaloHorario('09:00')).toBeUndefined()
    expect(validarIntervaloHorario(undefined, '10:00')).toBeUndefined()
  })
})

describe('validarUrlImagem', () => {
  it('aceita http(s) e campo vazio', () => {
    expect(validarUrlImagem()).toBeUndefined()
    expect(validarUrlImagem('https://exemplo.com/foto.jpg')).toBeUndefined()
    expect(validarUrlImagem('http://exemplo.com/foto.jpg')).toBeUndefined()
  })

  it('rejeita protocolos e URLs inválidas', () => {
    expect(validarUrlImagem('ftp://exemplo.com/foto.jpg')).toBe(
      'Informe uma URL http(s) válida',
    )
    expect(validarUrlImagem('foto.jpg')).toBe('Informe uma URL http(s) válida')
  })
})
