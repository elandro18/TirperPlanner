import type { ReactNode } from 'react'
import { CheckCircle2, CalendarRange, Plus } from 'lucide-react'
import { Button } from '../ui/Button'

interface Props {
  titulo: string
  descricao: string
  rotuloAdicionarOutro: string
  onAdicionarOutro: () => void
  onOrganizar: () => void
  children?: ReactNode
}

export function PainelSalvo({
  titulo,
  descricao,
  rotuloAdicionarOutro,
  onAdicionarOutro,
  onOrganizar,
  children,
}: Props) {
  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-forest-700/20 bg-forest-700/5 p-5 text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-forest-700 text-cream-50">
          <CheckCircle2 size={24} />
        </span>
        <h2 className="mt-3 text-xl">{titulo}</h2>
        <p className="mx-auto mt-1.5 max-w-md text-sm leading-relaxed text-ink-600">
          {descricao}
        </p>
      </div>

      {children}

      <div className="flex flex-col gap-2.5 sm:flex-row">
        <Button
          bloco
          variante="creme"
          icone={<Plus size={17} />}
          onClick={onAdicionarOutro}
        >
          {rotuloAdicionarOutro}
        </Button>
        <Button
          bloco
          icone={<CalendarRange size={17} />}
          onClick={onOrganizar}
        >
          Organizar no roteiro
        </Button>
      </div>
    </div>
  )
}
