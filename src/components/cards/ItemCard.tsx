import type { ReactNode } from 'react'
import type { TripDia } from '../../types'
import type { ItemResolvido } from '../../lib/derive'
import { LocalCard } from './LocalCard'
import { PassagemCard } from './PassagemCard'
import { HotelCard } from './HotelCard'

interface Props {
  item: ItemResolvido
  modo?: 'inventario' | 'roteiro'
  dias?: TripDia[]
  inicio?: string
  fim?: string
  emConflito?: boolean
  acao?: ReactNode
  onClick?: () => void
  className?: string
}

/** Renderiza o cartão específico do tipo — nunca mistura as entidades. */
export function ItemCard({
  item,
  modo,
  dias,
  inicio,
  fim,
  emConflito,
  acao,
  onClick,
  className,
}: Props) {
  if (item.tipo === 'LOCAL') {
    return (
      <LocalCard
        local={item.local}
        modo={modo}
        inicio={inicio}
        fim={fim}
        emConflito={emConflito}
        acao={acao}
        onClick={onClick}
        className={className}
      />
    )
  }
  if (item.tipo === 'PASSAGEM') {
    return (
      <PassagemCard
        passagem={item.passagem}
        modo={modo}
        emConflito={emConflito}
        acao={acao}
        onClick={onClick}
        className={className}
      />
    )
  }
  return (
    <HotelCard
      hotel={item.hotel}
      dias={dias}
      modo={modo}
      acao={acao}
      onClick={onClick}
      className={className}
    />
  )
}
