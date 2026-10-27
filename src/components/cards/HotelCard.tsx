import type { ReactNode } from 'react'
import { BedDouble, MapPin } from 'lucide-react'
import type { TripDia, TripHotel } from '../../types'
import { cn } from '../../lib/cn'
import { formatDataHora, formatMoeda, plural } from '../../lib/format'
import { Badge } from '../ui/Badge'

interface Props {
  hotel: TripHotel
  /** dias da viagem, para desenhar a faixa temporal de vigência */
  dias?: TripDia[]
  modo?: 'inventario' | 'roteiro'
  acao?: ReactNode
  onClick?: () => void
  className?: string
}

function faixaVigencia(hotel: TripHotel, dias: TripDia[]) {
  const inicio = hotel.checkin.slice(0, 10)
  const fim = hotel.checkout.slice(0, 10)
  return dias.map((d) => !!d.data && d.data >= inicio && d.data < fim)
}

function ehExemplo(codigo?: string) {
  return !!codigo && codigo.toUpperCase().startsWith('EXEMPLO')
}

export function HotelCard({
  hotel,
  dias = [],
  modo = 'inventario',
  acao,
  onClick,
  className,
}: Props) {
  const noites =
    hotel.noites ?? Math.max(0, (new Date(hotel.checkout).getTime() - new Date(hotel.checkin).getTime()) / 86_400_000)
  const total =
    hotel.valorTotal ?? (hotel.valorNoite ?? 0) * (Number(noites) || 0)
  const vigencia = dias.length ? faixaVigencia(hotel, dias) : []
  const compacto = modo === 'roteiro'

  return (
    <div
      onClick={onClick}
      className={cn(
        'overflow-hidden rounded-3xl border border-sage-200/70 bg-cream-50 transition-all',
        onClick && 'cursor-pointer hover:-translate-y-0.5 hover:shadow-card',
        className,
      )}
    >
      <div className={cn('flex gap-4', compacto ? 'p-3' : 'p-4')}>
        {hotel.fotoUrl ? (
          <img
            src={hotel.fotoUrl}
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
              'grid shrink-0 place-items-center rounded-2xl bg-sage-100 text-forest-700',
              compacto ? 'h-16 w-16' : 'h-24 w-24 sm:h-28 sm:w-28',
            )}
          >
            <BedDouble size={26} />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className={cn('leading-snug text-forest-900', compacto ? 'text-[15px]' : 'text-base')}>
              {hotel.nome}
            </h3>
            <span className="shrink-0 rounded-full bg-sage-200 px-2 py-0.5 text-[11px] font-bold text-forest-800">
              {Number(noites)} {plural(Number(noites), 'noite', 'noites')}
            </span>
          </div>

          <p className="mt-1 flex items-center gap-1 truncate text-[12px] text-ink-500">
            <MapPin size={13} className="shrink-0" />
            {[hotel.endereco, hotel.cidade].filter(Boolean).join(' · ') || 'Endereço não informado'}
          </p>

          <div className="mt-2 flex items-center gap-2 text-[12px] text-ink-600">
            <span className="tabular-nums">
              <span className="text-ink-400">in </span>
              {formatDataHora(hotel.checkin)}
            </span>
            <span className="text-ink-300">→</span>
            <span className="tabular-nums">
              <span className="text-ink-400">out </span>
              {formatDataHora(hotel.checkout)}
            </span>
          </div>

          {hotel.codigoReserva ? (
            <div className="mt-2 flex items-center gap-1.5 text-[12px]">
              <span className="font-mono text-ink-600">{hotel.codigoReserva}</span>
              {ehExemplo(hotel.codigoReserva) ? (
                <Badge tom="creme" className="py-0.5">exemplo</Badge>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      {/* Faixa temporal de vigência sobre os dias da viagem */}
      {dias.length ? (
        <div className="px-4 pb-3">
          <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-400">
            Vigência na viagem
          </div>
          <div className="flex gap-1">
            {dias.map((d, i) => (
              <div key={d.id} className="flex-1 text-center">
                <div
                  className={cn(
                    'h-2.5 rounded-full',
                    vigencia[i] ? 'bg-forest-600' : 'bg-sage-200',
                  )}
                  title={`Dia ${d.numero}`}
                />
                <div className="mt-1 text-[10px] font-medium text-ink-400">
                  D{d.numero}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="flex items-center justify-between border-t border-sage-200/70 bg-cream-100/60 px-4 py-2.5">
        <span className="text-[12px] text-ink-500">
          {hotel.valorNoite ? `${formatMoeda(hotel.valorNoite)} / noite` : 'Valor não informado'}
        </span>
        <span className="font-display text-base text-forest-900">
          {total ? formatMoeda(total) : '—'}
        </span>
      </div>

      {acao ? (
        <div className="border-t border-sage-200/70 bg-cream-100/60 px-4 py-2.5">
          {acao}
        </div>
      ) : null}
    </div>
  )
}
