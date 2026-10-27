import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

type Tom = 'floresta' | 'salvia' | 'creme' | 'argila' | 'neutro'

const TONS: Record<Tom, string> = {
  floresta: 'bg-forest-700 text-cream-50',
  salvia: 'bg-sage-200 text-forest-800',
  creme: 'bg-cream-200 text-ink-700',
  argila: 'bg-clay-100 text-clay-700',
  neutro: 'bg-sage-100 text-ink-600',
}

interface Props {
  children: ReactNode
  tom?: Tom
  className?: string
  icone?: ReactNode
}

export function Badge({ children, tom = 'salvia', className, icone }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide',
        TONS[tom],
        className,
      )}
    >
      {icone}
      {children}
    </span>
  )
}
