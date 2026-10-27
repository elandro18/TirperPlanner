import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

type Variante = 'primario' | 'secundario' | 'fantasma' | 'perigo' | 'creme'
type Tamanho = 'sm' | 'md' | 'lg'

const VARIANTES: Record<Variante, string> = {
  primario:
    'bg-forest-700 text-cream-50 hover:bg-forest-800 active:bg-forest-900 shadow-soft',
  secundario:
    'bg-sage-200 text-forest-900 hover:bg-sage-300 active:bg-sage-400',
  creme:
    'bg-cream-50 text-forest-900 border border-sage-200 hover:border-sage-400 hover:bg-cream-100',
  fantasma: 'text-forest-700 hover:bg-sage-100 active:bg-sage-200',
  perigo: 'bg-clay-100 text-clay-700 hover:bg-clay-200',
}

const TAMANHOS: Record<Tamanho, string> = {
  sm: 'h-9 px-3.5 text-[13px]',
  md: 'h-11 px-5 text-sm',
  lg: 'h-13 px-6 text-[15px]',
}

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante
  tamanho?: Tamanho
  icone?: ReactNode
  iconeFim?: ReactNode
  bloco?: boolean
}

export function Button({
  variante = 'primario',
  tamanho = 'md',
  icone,
  iconeFim,
  bloco,
  className,
  children,
  type = 'button',
  ...rest
}: Props) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-tight transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50',
        VARIANTES[variante],
        TAMANHOS[tamanho],
        bloco && 'w-full',
        className,
      )}
      {...rest}
    >
      {icone}
      {children}
      {iconeFim}
    </button>
  )
}
