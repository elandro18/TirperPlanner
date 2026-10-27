import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'
import { cn } from '../../lib/cn'

interface CampoProps {
  rotulo: string
  dica?: string
  erro?: string
  obrigatorio?: boolean
  children: ReactNode
  className?: string
}

/** Rótulo persistente + agrupamento visual + mensagens de validação. */
export function Campo({
  rotulo,
  dica,
  erro,
  obrigatorio,
  children,
  className,
}: CampoProps) {
  return (
    <label className={cn('block', className)}>
      <span className="mb-1.5 flex items-baseline gap-1.5">
        <span className="text-[13px] font-semibold text-ink-700">{rotulo}</span>
        {obrigatorio ? (
          <span className="text-clay-600" aria-hidden>
            *
          </span>
        ) : (
          <span className="text-[11px] font-medium text-ink-400">opcional</span>
        )}
      </span>
      {children}
      {erro ? (
        <span className="mt-1 block text-[12px] font-medium text-clay-700">
          {erro}
        </span>
      ) : dica ? (
        <span className="mt-1 block text-[12px] text-ink-400">{dica}</span>
      ) : null}
    </label>
  )
}

const BASE =
  'w-full rounded-2xl border bg-cream-50 px-3.5 text-[15px] text-ink-900 placeholder:text-ink-300 transition-colors focus:outline-none focus:ring-0'

export function Entrada({
  className,
  erro,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { erro?: boolean }) {
  return (
    <input
      className={cn(
        BASE,
        'h-11',
        erro
          ? 'border-clay-500 focus:border-clay-600'
          : 'border-sage-200 focus:border-forest-600',
        className,
      )}
      {...rest}
    />
  )
}

export function AreaTexto({
  className,
  erro,
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { erro?: boolean }) {
  return (
    <textarea
      className={cn(
        BASE,
        'min-h-24 resize-y py-2.5 leading-relaxed',
        erro
          ? 'border-clay-500 focus:border-clay-600'
          : 'border-sage-200 focus:border-forest-600',
        className,
      )}
      {...rest}
    />
  )
}

export function Selecao({
  className,
  erro,
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & { erro?: boolean }) {
  return (
    <select
      className={cn(
        BASE,
        'h-11 appearance-none bg-[url("data:image/svg+xml;utf8,<svg xmlns=%27http://www.w3.org/2000/svg%27 width=%2716%27 height=%2716%27 fill=%27none%27 stroke=%27%2355604f%27 stroke-width=%272%27 stroke-linecap=%27round%27><path d=%27M4 6l4 4 4-4%27/></svg>")] bg-[length:16px] bg-[right_0.85rem_center] bg-no-repeat pr-10',
        erro
          ? 'border-clay-500 focus:border-clay-600'
          : 'border-sage-200 focus:border-forest-600',
        className,
      )}
      {...rest}
    >
      {children}
    </select>
  )
}

/** Grade de duas colunas para agrupar campos relacionados. */
export function LinhaCampos({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('grid grid-cols-1 gap-4 sm:grid-cols-2', className)}>
      {children}
    </div>
  )
}
