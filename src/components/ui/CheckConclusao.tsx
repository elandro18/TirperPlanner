import { CheckSquare, Square } from 'lucide-react'
import { cn } from '../../lib/cn'

interface Props {
  concluido: boolean
  onToggle: () => void
  rotulo: string
  className?: string
}

/** Checkbox de conclusão (roteiro e listas). */
export function CheckConclusao({ concluido, onToggle, rotulo, className }: Props) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={concluido}
      aria-label={rotulo}
      title={rotulo}
      onClick={(e) => {
        e.stopPropagation()
        onToggle()
      }}
      className={cn(
        'grid h-7 w-7 shrink-0 place-items-center rounded-lg border transition-colors',
        concluido
          ? 'border-forest-600 bg-forest-600 text-cream-50'
          : 'border-sage-300 bg-cream-50 text-ink-400 hover:border-forest-600 hover:text-forest-700',
        className,
      )}
    >
      {concluido ? <CheckSquare size={15} /> : <Square size={15} />}
    </button>
  )
}
