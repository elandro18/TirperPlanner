const DATA_ISO = /^(\d{4})-(\d{2})-(\d{2})$/
const HORA = /^([01]\d|2[0-3]):([0-5]\d)$/

export interface ErrosPeriodo {
  dataInicio?: string
  dataFim?: string
}

export function dataISOValida(valor?: string): boolean {
  if (!valor) return false
  const partes = DATA_ISO.exec(valor)
  if (!partes) return false

  const ano = Number(partes[1])
  const mes = Number(partes[2])
  const dia = Number(partes[3])
  const data = new Date(ano, mes - 1, dia)

  return (
    data.getFullYear() === ano &&
    data.getMonth() === mes - 1 &&
    data.getDate() === dia
  )
}

export function validarPeriodoParcial(
  inicio?: string,
  fim?: string,
): ErrosPeriodo {
  const erros: ErrosPeriodo = {}

  if (inicio && !dataISOValida(inicio)) {
    erros.dataInicio = 'Informe uma data de início válida'
  }

  if (fim && !dataISOValida(fim)) {
    erros.dataFim = 'Informe uma data de fim válida'
  } else if (inicio && fim && dataISOValida(inicio) && fim < inicio) {
    erros.dataFim = 'A data de fim não pode ser anterior à data de início'
  }

  return erros
}

export function validarPeriodoCampos(
  inicio?: string,
  fim?: string,
): ErrosPeriodo {
  const erros = validarPeriodoParcial(inicio, fim)

  if (!inicio) erros.dataInicio = 'Informe a data de início'
  if (!fim) erros.dataFim = 'Informe a data de fim'

  return erros
}

export function validarPeriodo(
  inicio?: string,
  fim?: string,
): string | undefined {
  const erros = validarPeriodoCampos(inicio, fim)
  return erros.dataInicio ?? erros.dataFim
}

export function periodoValido(inicio?: string, fim?: string): boolean {
  return validarPeriodo(inicio, fim) === undefined
}

export function horaValida(valor?: string): boolean {
  return !!valor && HORA.test(valor)
}

export function validarIntervaloHorario(
  inicio?: string,
  fim?: string,
): string | undefined {
  if (inicio && !horaValida(inicio)) return 'Informe um horário de início válido'
  if (fim && !horaValida(fim)) return 'Informe um horário de fim válido'
  if (inicio && fim && horaValida(inicio) && horaValida(fim) && fim <= inicio) {
    return 'O horário de fim deve ser posterior ao de início'
  }
  return undefined
}

export function validarUrlImagem(valor?: string): string | undefined {
  if (!valor) return undefined
  try {
    const url = new URL(valor)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return 'Informe uma URL http(s) válida'
    }
    return undefined
  } catch {
    return 'Informe uma URL http(s) válida'
  }
}

export function parseValorMonetario(
  valor: string,
): number | undefined | 'erro' {
  if (valor.trim() === '') return undefined
  const numero = Number(valor.replace(',', '.'))
  if (!Number.isFinite(numero) || numero < 0) return 'erro'
  return numero
}
