import type { ReactNode } from 'react'
import { ArrowRight, Plane, Ticket } from 'lucide-react'
import type { TripPassagem } from '../../types'
import { TRANSPORTE_META } from '../../types'
import { cn } from '../../lib/cn'
import { formatDataHora, formatMoeda, horaDe } from '../../lib/format'

interface Props {
  passagem: TripPassagem
  modo?: 'inventario' | 'roteiro'
  emConflito?: boolean
  acao?: ReactNode
  onClick?: () => void
  className?: string
}

function ehExemplo(valor?: string) {
  return !!valor && valor.toUpperCase().startsWith('EXEMPLO')
}

export function PassagemCard({
  passagem,
  modo = 'inventario',
  emConflito,
  acao,
  onClick,
  className,
}: Props) {
  const meta = TRANSPORTE_META[passagem.tipo]
  const compacto = modo === 'roteiro'

  return (
    <div
      onClick={onClick}
      className={cn(
        'overflow-hidden rounded-3xl border bg-forest-800 text-cream-50 transition-all',
        emConflito ? 'border-clay-500' : 'border-forest-900/40',
        onClick && 'cursor-pointer hover:-translate-y-0.5 hover:shadow-pop',
        className,
      )}
    >
      <div className={cn('px-4 pt-4', compacto && 'px-3.5 pt-3.5')}>
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-cream-50/12 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-sage-200">
            <span aria-hidden>{meta.emoji}</span> {meta.rotulo}
          </span>
          {passagem.valor ? (
            <span className="text-[13px] font-bold tabular-nums">
              {formatMoeda(passagem.valor, passagem.moeda)}
            </span>
          ) : null}
        </div>

        <div className="mt-3 flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <div className="text-[11px] uppercase tracking-wide text-sage-300">
              Origem
            </div>
            <div className="truncate font-display text-lg leading-tight">
              {passagem.origem}
            </div>
            <div className="mt-0.5 text-[12px] tabular-nums text-sage-200">
              {formatDataHora(passagem.partida)}
            </div>
          </div>

          <div className="flex flex-col items-center px-1 text-sage-300">
            <Plane size={16} className="rotate-90" />
            <ArrowRight size={16} />
          </div>

          <div className="min-w-0 flex-1 text-right">
            <div className="text-[11px] uppercase tracking-wide text-sage-300">
              Destino
            </div>
            <div className="truncate font-display text-lg leading-tight">
              {passagem.destino}
            </div>
            <div className="mt-0.5 text-[12px] tabular-nums text-sage-200">
              {passagem.chegada ? horaDe(passagem.chegada) : '—'}
            </div>
          </div>
        </div>
      </div>

      {/* picote do bilhete */}
      <div className="relative my-3 flex items-center">
        <span className="h-3 w-3 -translate-x-1/2 rounded-full bg-cream-100" />
        <span className="h-px flex-1 border-t border-dashed border-cream-50/25" />
        <span className="h-3 w-3 translate-x-1/2 rounded-full bg-cream-100" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-4 pb-4 text-[12px]">
        <span className="inline-flex items-center gap-1.5 text-sage-200">
          <Ticket size={13} />
          {passagem.companhia ?? 'Operadora não informada'}
        </span>
        {passagem.localizador ? (
          <span className="inline-flex items-center gap-1.5 font-mono tracking-tight text-cream-50">
            {passagem.localizador}
            {ehExemplo(passagem.localizador) ? (
              <em className="rounded bg-cream-50/15 px-1.5 py-0.5 font-sans text-[10px] font-semibold uppercase not-italic text-sage-200">
                exemplo
              </em>
            ) : null}
          </span>
        ) : null}
      </div>

      {passagem.numeroVoo ||
      passagem.classe ||
      passagem.numeroBilhete ||
      passagem.passageiro ? (
        <div className="flex flex-wrap gap-x-3 gap-y-1 border-t border-cream-50/15 px-4 py-2 text-[11px] text-sage-200">
          {passagem.passageiro ? <span>{passagem.passageiro}</span> : null}
          {passagem.numeroVoo ? <span>Voo {passagem.numeroVoo}</span> : null}
          {passagem.classe ? <span>{passagem.classe}</span> : null}
          {passagem.numeroBilhete ? (
            <span className="font-mono">Bilhete {passagem.numeroBilhete}</span>
          ) : null}
        </div>
      ) : null}

      {emConflito ? (
        <div className="bg-clay-500/20 px-4 py-2 text-[12px] font-semibold text-clay-100">
          ⚠ Conflito de horário neste dia
        </div>
      ) : null}

      {acao ? (
        <div className="border-t border-cream-50/15 bg-forest-900/40 px-4 py-2.5">
          {acao}
        </div>
      ) : null}
    </div>
  )
}
