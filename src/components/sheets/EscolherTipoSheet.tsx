import { useNavigate } from 'react-router-dom'
import { BedDouble, MapPin, Plus, Ticket } from 'lucide-react'
import type { ID } from '../../types'
import { Sheet } from '../ui/Sheet'

interface Props {
  aberto: boolean
  viagemId: ID
  aoFechar: () => void
}

export function EscolherTipoSheet({ aberto, viagemId, aoFechar }: Props) {
  const navigate = useNavigate()

  function ir(rota: string) {
    aoFechar()
    navigate(`${rota}?viagem=${viagemId}`)
  }

  return (
    <Sheet
      aberto={aberto}
      aoFechar={aoFechar}
      titulo="Adicionar outro item"
      subtitulo="Escolha o tipo — você volta direto ao cadastro."
    >
      <div className="space-y-2.5">
        <Opcao
          icone={<MapPin size={20} />}
          titulo="Local ou atividade"
          descricao="Pontos turísticos, museus, restaurantes, natureza, compras…"
          onClick={() => ir('/cadastro/local')}
        />
        <Opcao
          icone={<Ticket size={20} />}
          titulo="Passagem"
          descricao="Avião, trem ou ônibus com origem, destino e horários."
          onClick={() => ir('/cadastro/passagem')}
        />
        <Opcao
          icone={<BedDouble size={20} />}
          titulo="Hospedagem"
          descricao="Hotel ou pousada com check-in, check-out e valores."
          onClick={() => ir('/cadastro/hotel')}
        />
      </div>
    </Sheet>
  )
}

function Opcao({
  icone,
  titulo,
  descricao,
  onClick,
}: {
  icone: React.ReactNode
  titulo: string
  descricao: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3.5 rounded-3xl border border-sage-200 bg-cream-50 p-4 text-left transition-colors hover:border-forest-600 hover:bg-sage-100"
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-sage-100 text-forest-700">
        {icone}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-forest-900">{titulo}</span>
        <span className="mt-0.5 block text-[12px] leading-snug text-ink-500">
          {descricao}
        </span>
      </span>
      <Plus size={18} className="shrink-0 text-ink-400" />
    </button>
  )
}
