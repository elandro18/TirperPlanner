import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../lib/cn'

interface Props {
  aberto: boolean
  aoFechar: () => void
  titulo?: string
  subtitulo?: string
  children: ReactNode
  rodape?: ReactNode
  largura?: 'md' | 'lg'
}

/* Contador para não liberar o scroll do body quando há modais sobrepostos
   (ex.: modal de edição aberto dentro do modal de detalhe do roteiro). */
let modaisAbertos = 0

/** Painel modal: bottom-sheet no mobile, diálogo central no desktop. */
export function Sheet({
  aberto,
  aoFechar,
  titulo,
  subtitulo,
  children,
  rodape,
  largura = 'md',
}: Props) {
  useEffect(() => {
    if (!aberto) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') aoFechar()
    }
    document.addEventListener('keydown', onKey)
    modaisAbertos += 1
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      modaisAbertos = Math.max(0, modaisAbertos - 1)
      if (modaisAbertos === 0) document.body.style.overflow = ''
    }
  }, [aberto, aoFechar])

  if (!aberto) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-forest-950/40 backdrop-blur-[2px]"
        onClick={aoFechar}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className={cn(
          'relative flex max-h-[92svh] w-full flex-col overflow-hidden rounded-t-3xl bg-cream-100 shadow-pop sm:rounded-3xl',
          largura === 'lg' ? 'sm:max-w-2xl' : 'sm:max-w-lg',
        )}
      >
        <header className="flex items-start justify-between gap-4 border-b border-sage-200/70 px-5 py-4">
          <div>
            {titulo ? <h2 className="text-xl leading-tight">{titulo}</h2> : null}
            {subtitulo ? (
              <p className="mt-0.5 text-sm text-ink-500">{subtitulo}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={aoFechar}
            aria-label="Fechar"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink-500 transition-colors hover:bg-sage-100 hover:text-forest-800"
          >
            <X size={18} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>

        {rodape ? (
          <footer className="border-t border-sage-200/70 bg-cream-50 px-5 py-4 safe-bottom">
            {rodape}
          </footer>
        ) : null}
      </div>
    </div>
  )
}
