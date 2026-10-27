import { useState } from 'react'
import { AlertTriangle, CalendarPlus, Check } from 'lucide-react'
import type { ID, RoteiroItemTipo, TripDia } from '../../types'
import { useTrip } from '../../store/TripStore'
import { conflitoAoAdicionar, diasDaViagem, diasDoItem } from '../../lib/derive'
import { formatDiaOuNumero, minToHhmm } from '../../lib/format'
import { Sheet } from '../ui/Sheet'
import { Button } from '../ui/Button'
import { cn } from '../../lib/cn'

interface Props {
  aberto: boolean
  aoFechar: () => void
  viagemId: ID
  tipoItem: RoteiroItemTipo
  itemId: ID
  titulo: string
  onEscolher: (diaId: ID) => void
}

export function SeletorDia({
  aberto,
  aoFechar,
  viagemId,
  tipoItem,
  itemId,
  titulo,
  onEscolher,
}: Props) {
  const { state } = useTrip()
  const dias = diasDaViagem(state, viagemId)
  const diasComItem = diasDoItem(state, tipoItem, itemId)
  const ehHotel = tipoItem === 'HOTEL'

  const [pendente, setPendente] = useState<TripDia | null>(null)
  const [erro, setErro] = useState<string>()

  function escolher(dia: TripDia) {
    setErro(undefined)

    if (tipoItem === 'PASSAGEM') {
      const conflito = conflitoAoAdicionar(state, {
        diaId: dia.id,
        tipoItem,
        itemId,
      })
      if (conflito) {
        setErro(
          `Conflito com “${conflito.titulo}” (${minToHhmm(conflito.inicio)}–${minToHhmm(conflito.fim)}) neste dia. Ajuste o horário da passagem antes de adicioná-la.`,
        )
        return
      }
    }

    const jaTem = state.roteiro.some(
      (r) => r.diaId === dia.id && r.tipoItem === tipoItem && r.itemId === itemId,
    )
    const emOutroDia = !jaTem && diasComItem.length > 0

    if (emOutroDia && !ehHotel) {
      setPendente(dia)
      return
    }

    onEscolher(dia.id)
  }

  return (
    <>
      <Sheet
        aberto={aberto}
        aoFechar={aoFechar}
        titulo="Adicionar ao roteiro"
        subtitulo={titulo}
      >
        {erro ? (
          <p className="mb-3 flex items-start gap-2 rounded-2xl bg-clay-100 px-3.5 py-2.5 text-[12px] font-semibold leading-relaxed text-clay-700">
            <AlertTriangle size={15} className="mt-0.5 shrink-0" />
            {erro}
          </p>
        ) : null}

        <ul className="space-y-2">
          {dias.map((d) => {
            const jaTem = state.roteiro.some(
              (r) =>
                r.diaId === d.id && r.tipoItem === tipoItem && r.itemId === itemId,
            )
            const emOutroDia = !jaTem && diasComItem.length > 0
            const desabilitado = jaTem && !ehHotel
            return (
              <li key={d.id}>
                <button
                  type="button"
                  disabled={desabilitado}
                  onClick={() => escolher(d)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors',
                    desabilitado
                      ? 'cursor-not-allowed border-sage-200 bg-cream-100 opacity-60'
                      : 'border-sage-200 bg-cream-50 hover:border-forest-600 hover:bg-sage-100',
                  )}
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-forest-700 font-display text-sm font-bold text-cream-50">
                    {d.numero}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] font-semibold text-forest-900">
                      {formatDiaOuNumero(d.data, d.numero)}
                    </span>
                    <span className="block truncate text-[12px] text-ink-500">
                      {d.titulo ?? `Dia ${d.numero}`}
                    </span>
                  </span>
                  {jaTem ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-forest-600">
                      <Check size={14} /> incluído
                    </span>
                  ) : emOutroDia && !ehHotel ? (
                    <span className="text-[11px] font-semibold text-clay-700">
                      em outro dia
                    </span>
                  ) : (
                    <CalendarPlus size={18} className="text-ink-400" />
                  )}
                </button>
              </li>
            )
          })}
        </ul>

        {ehHotel ? (
          <p className="mt-4 rounded-2xl bg-sage-100 px-3.5 py-3 text-[12px] leading-relaxed text-ink-600">
            A hospedagem aparece em <strong>todos os dias do período</strong> como
            cards independentes vinculados ao mesmo registro — sem duplicar o
            hotel.
          </p>
        ) : null}
      </Sheet>

      <Sheet
        aberto={!!pendente}
        aoFechar={() => setPendente(null)}
        titulo="Item já usado em outro dia"
        subtitulo={titulo}
        rodape={
          <div className="flex flex-col gap-2.5 sm:flex-row sm:justify-end">
            <Button variante="creme" bloco className="sm:w-auto" onClick={() => setPendente(null)}>
              Cancelar
            </Button>
            <Button
              bloco
              className="sm:w-auto"
              onClick={() => {
                if (pendente) onEscolher(pendente.id)
                setPendente(null)
              }}
            >
              Adicionar mesmo assim
            </Button>
          </div>
        }
      >
        <p className="text-[14px] leading-relaxed text-ink-700">
          Este item já está adicionado ao roteiro de outro dia. Deseja
          adicioná-lo também a este dia?
        </p>
        {pendente ? (
          <p className="mt-3 rounded-2xl bg-sage-100 px-3.5 py-2.5 text-[13px] font-semibold text-forest-800">
            {formatDiaOuNumero(pendente.data, pendente.numero)}
            {pendente.titulo ? ` · ${pendente.titulo}` : ''}
          </p>
        ) : null}
      </Sheet>
    </>
  )
}
