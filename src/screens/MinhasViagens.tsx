import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  CalendarRange,
  Hotel,
  MapPin,
  Plane,
  Plus,
  Sparkles,
  Ticket,
  Wallet,
} from 'lucide-react'
import { useTrip } from '../store/TripStore'
import { resumoViagem, viagemAtiva } from '../lib/derive'
import { formatMoeda, formatPeriodoOpcional } from '../lib/format'
import { Button } from '../components/ui/Button'
import { ProgressBar } from '../components/ui/ProgressBar'
import { EmptyState } from '../components/ui/EmptyState'

export function MinhasViagens() {
  const { state, dispatch } = useTrip()
  const navigate = useNavigate()
  const ativa = viagemAtiva(state)
  const outras = state.viagens.filter((v) => v.id !== ativa?.id)
  const resumo = ativa ? resumoViagem(state, ativa.id) : null
  const primeiroNome = state.usuario.nome.split(' ')[0]

  function abrir(id: string) {
    dispatch({ type: 'SET_ATIVA', viagemId: id })
    navigate('/viagem')
  }

  return (
    <div className="space-y-8">
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-ink-500">
            Olá, <strong className="font-semibold text-forest-800">{primeiroNome}</strong> 👋
          </p>
          <h1 className="mt-1 text-3xl leading-tight sm:text-4xl">
            Minhas viagens
          </h1>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden h-11 w-11 place-items-center rounded-full bg-sage-200 text-sm font-bold text-forest-800 sm:grid">
            {state.usuario.nome
              .split(' ')
              .slice(0, 2)
              .map((p) => p[0])
              .join('')}
          </span>
          <Button icone={<Plus size={17} />} onClick={() => navigate('/nova-viagem')}>
            Criar viagem
          </Button>
        </div>
      </header>

      {!ativa || !resumo ? (
        <EmptyState
          icone={<Sparkles size={22} />}
          titulo="Nenhuma viagem por aqui ainda"
          descricao="Crie sua primeira viagem com destino e datas. Depois você cadastra locais, passagens e hospedagens e organiza tudo no roteiro."
          acao={
            <Button
              icone={<Plus size={17} />}
              onClick={() => navigate('/nova-viagem')}
            >
              Criar viagem
            </Button>
          }
        />
      ) : (
        <>
          {/* Cartão da viagem ativa */}
          <section aria-label="Viagem ativa">
            <div className="mb-3 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-forest-700 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-cream-50">
                <Sparkles size={13} /> Viagem ativa
              </span>
            </div>

            <article className="overflow-hidden rounded-3xl border border-sage-200/70 bg-cream-50 shadow-card">
              <div className="relative">
                <img
                  src={ativa.capaUrl}
                  alt=""
                  className="h-48 w-full object-cover sm:h-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest-950/85 via-forest-950/25 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <div className="flex items-center gap-1.5 text-[12px] font-semibold text-sage-200">
                    <MapPin size={14} /> {ativa.destino}
                  </div>
                  <h2 className="mt-1 text-3xl leading-tight text-cream-50 sm:text-4xl">
                    {ativa.nome}
                  </h2>
                  <div className="mt-1.5 flex items-center gap-1.5 text-[13px] text-cream-100">
                    <CalendarRange size={14} />
                    {formatPeriodoOpcional(ativa.dataInicio, ativa.dataFim)}
                  </div>
                </div>
              </div>

              <div className="p-5">
                <div className="grid grid-cols-3 gap-3">
                  <Indicador
                    icone={<MapPin size={16} />}
                    valor={resumo.locais}
                    rotulo="Locais"
                  />
                  <Indicador
                    icone={<Ticket size={16} />}
                    valor={resumo.passagens}
                    rotulo="Passagens"
                  />
                  <Indicador
                    icone={<Hotel size={16} />}
                    valor={resumo.hoteis}
                    rotulo="Hotéis"
                  />
                </div>

                {/* Valor total previsto (Task 2.2) */}
                <div className="mt-4 flex items-center justify-between rounded-2xl bg-forest-700 px-4 py-3 text-cream-50">
                  <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold">
                    <Wallet size={15} /> Valor total previsto
                  </span>
                  <span className="font-display text-xl">
                    {formatMoeda(resumo.orcamento.total, ativa.moeda)}
                  </span>
                </div>

                <div className="mt-5">
                  <div className="mb-2 flex items-baseline justify-between">
                    <span className="text-[13px] font-semibold text-ink-700">
                      Organização do roteiro
                    </span>
                    <span className="text-[13px] font-bold tabular-nums text-forest-800">
                      {resumo.progresso}%
                    </span>
                  </div>
                  <ProgressBar valor={resumo.progresso} />
                  <p className="mt-2 text-[12px] text-ink-500">
                    {resumo.itensOrganizados} de {resumo.totalItens} itens já
                    distribuídos nos dias
                    {resumo.totalItens - resumo.itensOrganizados > 0
                      ? ` · ${resumo.totalItens - resumo.itensOrganizados} aguardando organização`
                      : ''}
                  </p>
                </div>

                <div className="mt-5">
                  <Button
                    bloco
                    icone={<ArrowRight size={17} />}
                    onClick={() => navigate('/planejamento')}
                  >
                    Continuar planejando
                  </Button>
                </div>
              </div>
            </article>
          </section>

          {/* Viagens anteriores */}
          <section aria-label="Outras viagens">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xl">Outras viagens</h2>
              <span className="text-[12px] font-medium text-ink-400">
                {outras.length} {outras.length === 1 ? 'viagem' : 'viagens'}
              </span>
            </div>

            {outras.length === 0 ? (
              <EmptyState
                compacto
                icone={<Plane size={20} />}
                titulo="Só a viagem ativa por enquanto"
                descricao="Quando você criar outras viagens, elas aparecem aqui."
              />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {outras.map((v) => {
                  const r = resumoViagem(state, v.id)
                  const semItens = r.totalItens === 0
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => abrir(v.id)}
                      className="group flex items-stretch gap-4 overflow-hidden rounded-3xl border border-sage-200/70 bg-cream-50 p-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-card"
                    >
                      <img
                        src={v.capaUrl}
                        alt=""
                        className="h-20 w-20 shrink-0 rounded-2xl object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-display text-lg text-forest-900">
                          {v.nome}
                        </div>
                        <div className="mt-0.5 flex items-center gap-1 truncate text-[12px] text-ink-500">
                          <MapPin size={12} /> {v.destino}
                        </div>
                        <div className="mt-0.5 text-[12px] text-ink-400">
                          {formatPeriodoOpcional(v.dataInicio, v.dataFim)}
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          {semItens ? (
                            <span className="rounded-full bg-clay-100 px-2 py-0.5 text-[11px] font-semibold text-clay-700">
                              sem itens
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              <span className="text-[11px] font-medium text-ink-500">
                                {r.itensOrganizados}/{r.totalItens} no roteiro
                              </span>
                              <ProgressBar
                                valor={r.progresso}
                                className="h-1.5 w-16"
                              />
                            </span>
                          )}
                          <span className="shrink-0 text-[12px] font-bold tabular-nums text-forest-800">
                            {formatMoeda(r.orcamento.total, v.moeda)}
                          </span>
                        </div>
                      </div>
                      <ArrowRight
                        size={18}
                        className="mt-1 shrink-0 self-center text-ink-300 transition-transform group-hover:translate-x-0.5"
                      />
                    </button>
                  )
                })}
              </div>
            )}
          </section>

        </>
      )}
    </div>
  )
}

function Indicador({
  icone,
  valor,
  rotulo,
}: {
  icone: React.ReactNode
  valor: number
  rotulo: string
}) {
  return (
    <div className="rounded-2xl border border-sage-200/70 bg-cream-100/70 px-3 py-2.5 text-center">
      <span className="mx-auto mb-1 grid h-7 w-7 place-items-center rounded-lg bg-sage-100 text-forest-700">
        {icone}
      </span>
      <div className="font-display text-xl leading-none text-forest-900">
        {valor}
      </div>
      <div className="mt-0.5 text-[11px] font-medium text-ink-500">{rotulo}</div>
    </div>
  )
}
