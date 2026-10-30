import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '../../lib/cn'

type Variante = 'primario' | 'secundario' | 'fantasma' | 'creme'
type Tamanho = 'sm' | 'md' | 'lg'

/**
 * Mesmas classes/variantes de `src/components/ui/Button.tsx`.
 * O `Button` do app renderiza apenas `<button>`; CTAs de navegação
 * precisam ser âncoras (semântica, SEO e "abrir em nova aba").
 */
const VARIANTES: Record<Variante, string> = {
  primario:
    'bg-forest-700 text-cream-50 hover:bg-forest-800 active:bg-forest-900 shadow-soft',
  secundario:
    'bg-sage-200 text-forest-900 hover:bg-sage-300 active:bg-sage-400',
  creme:
    'bg-cream-50 text-forest-900 border border-sage-200 hover:border-sage-400 hover:bg-cream-100',
  fantasma: 'text-forest-700 hover:bg-sage-100 active:bg-sage-200',
}

const TAMANHOS: Record<Tamanho, string> = {
  sm: 'h-9 px-3.5 text-[13px]',
  md: 'h-11 px-5 text-sm',
  lg: 'h-13 px-6 text-[15px]',
}

interface Props {
  /** Rota interna (`/cadastro`) ou âncora (`#como-funciona`). */
  para: string
  variante?: Variante
  tamanho?: Tamanho
  icone?: ReactNode
  iconeFim?: ReactNode
  bloco?: boolean
  className?: string
  children: ReactNode
}

export function ButtonLink({
  para,
  variante = 'primario',
  tamanho = 'md',
  icone,
  iconeFim,
  bloco,
  className,
  children,
}: Props) {
  const classes = cn(
    'inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-tight transition-colors duration-150',
    VARIANTES[variante],
    TAMANHOS[tamanho],
    bloco && 'w-full',
    className,
  )

  const conteudo = (
    <>
      {icone}
      {children}
      {iconeFim}
    </>
  )

  // Âncora na mesma página: `<a href>` preserva o scroll nativo suave
  // (`html { scroll-behavior: smooth }`); o `Link` não rola para o hash.
  if (para.startsWith('#')) {
    return (
      <a href={para} className={classes}>
        {conteudo}
      </a>
    )
  }

  return (
    <Link to={para} className={classes}>
      {conteudo}
    </Link>
  )
}
