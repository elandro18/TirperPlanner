import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

interface Props {
  titulo: string
  subtitulo?: string
  sobre?: string
  acao?: ReactNode
  voltar?: boolean
}

export function PageHeader({ titulo, subtitulo, sobre, acao, voltar = true }: Props) {
  const navigate = useNavigate()
  return (
    <header className="mb-6">
      {voltar ? (
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-500 transition-colors hover:text-forest-700"
        >
          <ArrowLeft size={15} /> Voltar
        </button>
      ) : null}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          {sobre ? (
            <p className="text-[12px] font-bold uppercase tracking-widest text-sage-700">
              {sobre}
            </p>
          ) : null}
          <h1 className="mt-0.5 text-2xl leading-tight sm:text-3xl">{titulo}</h1>
          {subtitulo ? (
            <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-ink-500">
              {subtitulo}
            </p>
          ) : null}
        </div>
        {acao}
      </div>
    </header>
  )
}
