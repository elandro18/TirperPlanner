import { cn } from '../../lib/cn'

interface Opcao<T extends string> {
  valor: T
  rotulo: string
  contagem?: number
}

interface Props<T extends string> {
  opcoes: Opcao<T>[]
  valor: T
  onChange: (valor: T) => void
  className?: string
}

export function SegmentedControl<T extends string>({
  opcoes,
  valor,
  onChange,
  className,
}: Props<T>) {
  return (
    <div
      role="tablist"
      className={cn(
        'inline-flex rounded-full border border-sage-200 bg-cream-50 p-1',
        className,
      )}
    >
      {opcoes.map((o) => {
        const ativo = o.valor === valor
        return (
          <button
            key={o.valor}
            role="tab"
            aria-selected={ativo}
            type="button"
            onClick={() => onChange(o.valor)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors',
              ativo
                ? 'bg-forest-700 text-cream-50'
                : 'text-ink-600 hover:text-forest-700',
            )}
          >
            {o.rotulo}
            {o.contagem != null ? (
              <span
                className={cn(
                  'rounded-full px-1.5 text-[11px] tabular-nums',
                  ativo ? 'bg-cream-50/20' : 'bg-sage-100 text-ink-500',
                )}
              >
                {o.contagem}
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
