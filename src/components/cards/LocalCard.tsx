import type { ReactNode } from 'react'
import { Clock, MapPin, Wallet } from 'lucide-react'
import type { TripLocal } from '../../types'
import { CATEGORIA_META } from '../../types'
import { cn } from '../../lib/cn'
import { formatDuracao, formatMoeda } from '../../lib/format'
import { Badge } from '../ui/Badge'

interface Props {
  local: TripLocal
  modo?: 'inventario' | 'roteiro'
  inicio?: string
  fim?: string
  emConflito?: boolean
  acao?: ReactNode
  onClick?: () => void
  className?: string
}

export function LocalCard({
  local,
  modo = 'inventario',
  inicio,
  fim,
  emConflito,
  acao,
  onClick,
  className,
}: Props) {
  const meta = CATEGORIA_META[local.categoria]
  const duracao = formatDuracao(local.duracaoMin)
  const horario =
    inicio ?? (modo === 'inventario' ? local.horarioPrevisto : undefined)
  const fimExibido =
    fim ?? (modo === 'inventario' ? local.horarioFim : undefined)
  const compacto = modo === 'roteiro'

  return (
    <div
      onClick={onClick}
      className={cn(
        'group overflow-hidden rounded-3xl border bg-cream-50 transition-all',
        emConflito ? 'border-clay-500' : 'border-sage-200/70',
        onClick && 'cursor-pointer hover:-translate-y-0.5 hover:shadow-card',
        className,
      )}
    >
      <div className={cn('flex', compacto ? 'gap-3 p-3' : 'gap-4 p-4')}>
        {local.fotoUrl ? (
          <img
            src={local.fotoUrl}
            alt=""
            loading="lazy"
            className={cn(
              'shrink-0 rounded-2xl object-cover',
              compacto ? 'h-16 w-16' : 'h-24 w-24 sm:h-28 sm:w-28',
            )}
          />
        ) : (
          <div
            className={cn(
              'grid shrink-0 place-items-center rounded-2xl bg-sage-100 text-2xl',
              compacto ? 'h-16 w-16' : 'h-24 w-24 sm:h-28 sm:w-28',
            )}
          >
            {meta.emoji}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3
              className={cn(
                'leading-snug text-forest-900',
                compacto ? 'text-[15px]' : 'text-base',
              )}
            >
              {local.nome}
            </h3>
            {horario ? (
              <span className="shrink-0 rounded-full bg-forest-700 px-2 py-0.5 text-[11px] font-bold tabular-nums text-cream-50">
                {horario}
                {fimExibido ? `–${fimExibido}` : ''}
              </span>
            ) : null}
          </div>

          <div className="mt-1">
            <Badge tom="neutro">{meta.emoji} {meta.rotulo}</Badge>
          </div>

          {local.cidade || local.endereco ? (
            <p className="mt-2 flex items-center gap-1 truncate text-[12px] text-ink-500">
              <MapPin size={13} className="shrink-0" />
              {[local.endereco, local.cidade].filter(Boolean).join(' · ')}
            </p>
          ) : null}

          <div className="mt-2 flex flex-wrap items-center gap-3 text-[12px] font-medium text-ink-600">
            {duracao ? (
              <span className="inline-flex items-center gap-1">
                <Clock size={13} /> {duracao}
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1">
              <Wallet size={13} />
              {local.custo ? formatMoeda(local.custo) : 'Grátis'}
            </span>
          </div>

          {emConflito ? (
            <p className="mt-2 text-[12px] font-semibold text-clay-700">
              ⚠ Conflito de horário neste dia
            </p>
          ) : null}
        </div>
      </div>

      {acao ? (
        <div className="border-t border-sage-200/70 bg-cream-100/60 px-4 py-2.5">
          {acao}
        </div>
      ) : null}
    </div>
  )
}
