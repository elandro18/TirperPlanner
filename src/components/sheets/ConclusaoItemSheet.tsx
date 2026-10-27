import { useState } from 'react'
import { CheckCircle2, Wallet } from 'lucide-react'
import type { Moeda, TripListaItem } from '../../types'
import { formatMoeda } from '../../lib/format'
import { parseValorMonetario } from '../../lib/validacao'
import { valorPrevistoItem } from '../../lib/listas'
import { Sheet } from '../ui/Sheet'
import { Button } from '../ui/Button'
import { Campo, Entrada } from '../ui/Field'

interface Props {
  item: TripListaItem | null
  moeda?: Moeda
  aoFechar: () => void
  onConfirmar: (valorPago?: number) => void
}

export function ConclusaoItemSheet({
  item,
  moeda = 'BRL',
  aoFechar,
  onConfirmar,
}: Props) {
  const [valor, setValor] = useState(() =>
    item?.valorPago != null
      ? String(item.valorPago)
      : item
        ? String(valorPrevistoItem(item))
        : '',
  )
  const [erro, setErro] = useState<string>()

  if (!item) return null

  const previsto = valorPrevistoItem(item)
  const editando = !!item.concluido

  function confirmar() {
    const convertido = parseValorMonetario(valor)
    if (convertido === 'erro') {
      setErro('Informe um valor válido ou deixe vazio para concluir sem valor.')
      return
    }
    onConfirmar(convertido)
  }

  return (
    <Sheet
      aberto
      aoFechar={aoFechar}
      titulo={
        editando
          ? 'Valor pago'
          : item.refeicao
            ? 'Concluir refeição'
            : 'Concluir item'
      }
      subtitulo={item.nome}
      rodape={
        <div className="flex flex-col gap-2.5 sm:flex-row sm:justify-end">
          <Button variante="creme" bloco className="sm:w-auto" onClick={aoFechar}>
            Cancelar
          </Button>
          <Button
            bloco
            className="sm:w-auto"
            icone={<CheckCircle2 size={16} />}
            onClick={confirmar}
          >
            {editando ? 'Salvar valor' : 'Concluir'}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-2xl bg-forest-700/5 px-4 py-3">
          <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-forest-800">
            <Wallet size={15} /> Valor previsto
          </span>
          <span className="font-display text-lg text-forest-900">
            {previsto > 0 ? formatMoeda(previsto, moeda) : '—'}
          </span>
        </div>

        <Campo
          rotulo="Valor efetivamente pago"
          dica="Deixe vazio para concluir sem informar o valor. Zero significa gratuito."
          erro={erro}
        >
          <Entrada
            type="number"
            min={0}
            inputMode="decimal"
            value={valor}
            erro={!!erro}
            placeholder="0"
            autoFocus
            onChange={(e) => {
              setValor(e.target.value)
              setErro(undefined)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                confirmar()
              }
            }}
          />
        </Campo>

        <p className="rounded-2xl bg-sage-100 px-3.5 py-3 text-[12px] leading-relaxed text-ink-600">
          O valor pago fica separado do previsto e só é registrado ao confirmar.
          Cancelar mantém o item como estava.
        </p>
      </div>
    </Sheet>
  )
}
