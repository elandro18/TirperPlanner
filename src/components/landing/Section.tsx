import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface Props {
  /** Âncora da seção (alvo de links como `#como-funciona`). */
  id?: string
  /** Classes extras aplicadas ao `<section>` (ex.: fundo de contraste). */
  className?: string
  /** Classes extras do container interno. */
  containerClassName?: string
  children: ReactNode
}

/**
 * Wrapper de seção da landing: container centralizado (`max-w-6xl`),
 * espaçamento vertical responsivo e `scroll-mt-20` para o header sticky.
 */
export function Section({ id, className, containerClassName, children }: Props) {
  return (
    <section id={id} className={cn('scroll-mt-20', className)}>
      <div
        className={cn(
          'mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24',
          containerClassName,
        )}
      >
        {children}
      </div>
    </section>
  )
}
