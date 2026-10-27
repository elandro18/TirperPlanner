import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface Props {
  children: ReactNode
  ativo?: boolean
  onClick?: () => void
  icone?: ReactNode
  className?: string
}

export function Chip({ children, ativo, onClick, icone, className }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ativo}
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-[13px] font-semibold transition-colors duration-150',
        ativo
          ? 'border-forest-700 bg-forest-700 text-cream-50'
          : 'border-sage-200 bg-cream-50 text-ink-600 hover:border-sage-300 hover:text-forest-700',
        className,
      )}
    >
      {icone}
      {children}
    </button>
  )
}
