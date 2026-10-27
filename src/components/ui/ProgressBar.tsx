import { cn } from '../../lib/cn'

interface Props {
  valor: number // 0..100
  className?: string
  cor?: string
}

export function ProgressBar({ valor, className, cor = 'bg-forest-600' }: Props) {
  const pct = Math.max(0, Math.min(100, valor))
  return (
    <div
      className={cn('h-2 w-full overflow-hidden rounded-full bg-sage-200', className)}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn('h-full rounded-full transition-all duration-500', cor)}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
