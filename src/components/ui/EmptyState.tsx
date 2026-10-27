import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface Props {
  icone?: ReactNode
  titulo: string
  descricao: string
  acao?: ReactNode
  className?: string
  compacto?: boolean
}

export function EmptyState({
  icone,
  titulo,
  descricao,
  acao,
  className,
  compacto,
}: Props) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-3xl border border-dashed border-sage-300 bg-cream-50/60 text-center',
        compacto ? 'gap-2 px-6 py-8' : 'gap-3 px-8 py-12',
        className,
      )}
    >
      {icone ? (
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-sage-100 text-forest-600">
          {icone}
        </div>
      ) : null}
      <h3 className="text-lg">{titulo}</h3>
      <p className="max-w-sm text-sm leading-relaxed text-ink-500">{descricao}</p>
      {acao ? <div className="mt-2">{acao}</div> : null}
    </div>
  )
}
