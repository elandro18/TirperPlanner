import { AlertTriangle, CalendarCheck, Clock, Sparkles } from 'lucide-react'
import type { SugestaoRoteiro } from '../../lib/sugestaoRoteiro'
import { formatDiaOuNumero } from '../../lib/format'
import { Sheet } from '../ui/Sheet'
import { Button } from '../ui/Button'

interface Props {
  aberto: boolean
  sugestao: SugestaoRoteiro
  aoFechar: () => void
  onAplicar: () => void
}

export function SugestaoRoteiroSheet({
  aberto,
  sugestao,
  aoFechar,
  onAplicar,
}: Props) {
  const total = sugestao.dias.reduce((s, d) => s + d.itens.length, 0)
  const temItens = total > 0

  return (
    <Sheet
      aberto={aberto}
      aoFechar={aoFechar}
      largura="lg"
      titulo="Sugestão de roteiro"
      subtitulo="Confira antes de aplicar. Nada do roteiro atual será sobrescrito."
      rodape={
        <div className="flex flex-col gap-2.5 sm:flex-row sm:justify-end">
          <Button variante="creme" bloco className="sm:w-auto" onClick={aoFechar}>
            Descartar
          </Button>
          <Button
            bloco
            className="sm:w-auto"
            disabled={!temItens}
            icone={<CalendarCheck size={16} />}
            onClick={onAplicar}
          >
            Aplicar sugestão
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        {sugestao.avisos.length ? (
          <ul className="space-y-2">
            {sugestao.avisos.map((aviso) => (
              <li
                key={aviso}
                className="flex items-start gap-2 rounded-2xl bg-clay-100 px-3.5 py-2.5 text-[12px] font-semibold leading-relaxed text-clay-700"
              >
                <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                {aviso}
              </li>
            ))}
          </ul>
        ) : null}

        {temItens ? (
          <p className="flex items-center gap-1.5 text-[12px] font-semibold text-forest-800">
            <Sparkles size={14} /> {total}{' '}
            {total === 1 ? 'local sugerido' : 'locais sugeridos'} · deslocamento
            estimado em linha reta
          </p>
        ) : null}

        {sugestao.dias.map((dia) => (
          <section
            key={dia.diaId}
            className="rounded-3xl border border-sage-200/70 bg-cream-50 p-4"
          >
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="font-display text-[16px] text-forest-900">
                {formatDiaOuNumero(dia.data, dia.numero)}
              </h3>
              {dia.destinoNome ? (
                <span className="text-[12px] font-semibold text-ink-500">
                  {dia.destinoNome}
                </span>
              ) : null}
            </div>

            <ol className="mt-3 space-y-2">
              {dia.itens.map((item) => (
                <li
                  key={`${dia.diaId}-${item.localId}`}
                  className="flex items-center gap-3 rounded-2xl bg-cream-100/70 px-3 py-2.5"
                >
                  <span className="shrink-0 rounded-full bg-forest-700 px-2 py-0.5 text-[11px] font-bold tabular-nums text-cream-50">
                    {item.inicio}–{item.fim}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[14px] font-semibold text-forest-900">
                    {item.nome}
                  </span>
                  {item.deslocamentoMin > 0 ? (
                    <span className="inline-flex shrink-0 items-center gap-1 text-[11px] font-medium text-ink-500">
                      <Clock size={12} /> {item.deslocamentoMin} min
                    </span>
                  ) : null}
                </li>
              ))}
            </ol>
          </section>
        ))}

        {sugestao.semCoordenadas.length ? (
          <section className="rounded-3xl border border-clay-500/30 bg-clay-100/40 p-4">
            <h3 className="text-[13px] font-bold uppercase tracking-wide text-clay-700">
              Precisam de localização
            </h3>
            <p className="mt-1 text-[12px] leading-relaxed text-ink-600">
              Estes locais não têm coordenadas e ficaram fora da sugestão.
              Edite o endereço para que possam ser considerados.
            </p>
            <ul className="mt-2 space-y-1 text-[13px] font-semibold text-ink-700">
              {sugestao.semCoordenadas.map((local) => (
                <li key={local.id}>· {local.nome}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {sugestao.naoAlocados.length ? (
          <section className="rounded-3xl border border-sage-200/70 bg-cream-50 p-4">
            <h3 className="text-[13px] font-bold uppercase tracking-wide text-ink-400">
              Não couberam no período
            </h3>
            <ul className="mt-2 space-y-2 text-[12px] text-ink-600">
              {sugestao.naoAlocados.map((local) => (
                <li key={local.id}>
                  <strong className="text-ink-800">{local.nome}</strong> —{' '}
                  {local.motivo}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <p className="rounded-2xl bg-sage-100 px-3.5 py-3 text-[12px] leading-relaxed text-ink-600">
          Reservas, passagens, hospedagens e itens com horário fixo são
          preservados. A sugestão apenas adiciona locais que ainda não estão no
          roteiro.
        </p>
      </div>
    </Sheet>
  )
}
