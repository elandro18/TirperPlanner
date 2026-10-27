import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface Props {
  icone: ReactNode
  valor: ReactNode
  rotulo: string
  className?: string
}

export function StatTile({ icone, valor, rotulo, className }: Props) {
  return (
    <div
      className={cn(
        'flex flex-col gap-2 rounded-2xl border border-sage-200/70 bg-cream-50 p-3.5',
        className,
      )}
    >
      <span className="grid h-8 w-8 place-items-center rounded-xl bg-sage-100 text-forest-700">
        {icone}
      </span>
      <div>
        <div className="font-display text-2xl leading-none text-forest-900">
          {valor}
        </div>
        <div className="mt-1 text-[12px] font-medium text-ink-500">{rotulo}</div>
      </div>
    </div>
  )
}
