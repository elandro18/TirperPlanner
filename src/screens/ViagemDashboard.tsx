import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BedDouble,
  CalendarDays,
  Compass,
  MapPin,
  Pencil,
  Plus,
  Receipt,
  Ticket,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import type { ID, RoteiroItemTipo } from '../types'
import { useTrip } from '../store/TripStore'
import {
  destinoDoDia,
  destinosDaViagem,
  diasDaViagem,
  hoteisDaViagem,
  passagensDaViagem,
  proximosItens,
  resumoViagem,
  viagemAtiva,
} from '../lib/derive'
import {
  formatDataLonga,
  formatDiaOuNumero,
  formatMoeda,
  formatPeriodo,
  formatPeriodoOpcional,
  horaDe,
} from '../lib/format'
import { Button } from '../components/ui/Button'
import { ProgressBar } from '../components/ui/ProgressBar'
import { StatTile } from '../components/ui/StatTile'
import { EmptyState } from '../components/ui/EmptyState'
import { SegmentedControl } from '../components/ui/SegmentedControl'
import { PassagemCard } from '../components/cards/PassagemCard'
import { HotelCard } from '../components/cards/HotelCard'
import { EditarItemSheet } from '../components/sheets/EditarItemSheet'
import { PeriodoSheet } from '../components/sheets/PeriodoSheet'
import { DestinosSheet } from '../components/sheets/DestinosSheet'

type Aba = 'geral' | 'passagens' | 'hoteis' | 'dados'

export function ViagemDashboard() {
  const { state, dispatch } = useTrip()
  const navigate = useNavigate()
  const viagem = viagemAtiva(state)
  const [aba, setAba] = useState<Aba>('geral')
  const [editando, setEditando] = useState<{ tipo: RoteiroItemTipo; id: ID } | null>(
    null,
  )
  const [periodoAberto, setPeriodoAberto] = useState(false)
  const [destinosAberto, setDestinosAberto] = useState(false)

  if (!viagem) {
    return (
      <EmptyState
        icone={<Compass size={22} />}
        titulo="Nenhuma viagem ativa"
        descricao="Crie uma viagem para ver o painel, as passagens e as hospedagens."
        acao={
          <Button icone={<Plus size={17} />} onClick={() => navigate('/nova-viagem')}>
            Criar viagem
          </Button>
        }
      />
    )
  }

  const resumo = resumoViagem(state, viagem.id)
  const dias = diasDaViagem(state, viagem.id)
  const destinos = destinosDaViagem(state, viagem.id)
  const passagens = passagensDaViagem(state, viagem.id)
  const hoteis = hoteisDaViagem(state, viagem.id)
  const proximos = proximosItens(state, viagem.id, 5)
  const moeda = viagem.moeda

  const barras = [
    { rotulo: 'Locais', valor: resumo.orcamento.locais, cor: 'bg-forest-600' },
    { rotulo: 'Passagens', valor: resumo.orcamento.passagens, cor: 'bg-sage-500' },
    { rotulo: 'Hospedagens', valor: resumo.orcamento.hoteis, cor: 'bg-clay-500' },
  ]

  return (
    <div className="space-y-6">
      {/* Capa */}
      <section className="overflow-hidden rounded-3xl border border-sage-200/70 bg-cream-50 shadow-soft">
        <div className="relative">
          <img src={viagem.capaUrl} alt="" className="h-44 w-full object-cover sm:h-56" />
          <div className="absolute inset-0 bg-gradient-to-t from-forest-950/85 via-forest-950/25 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5">
            <div className="flex items-center gap-1.5 text-[12px] font-semibold text-sage-200">
              <MapPin size={14} /> {viagem.destino}
            </div>
            <h1 className="mt-1 text-3xl leading-tight text-cream-50 sm:text-4xl">
              {viagem.nome}
            </h1>
            <div className="mt-1.5 flex items-center gap-1.5 text-[13px] text-cream-100">
              <CalendarDays size={14} />
              {formatPeriodoOpcional(viagem.dataInicio, viagem.dataFim)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4">
          <StatTile
            icone={<CalendarDays size={16} />}
            valor={resumo.dias}
            rotulo="Dias no roteiro"
          />
          <StatTile icone={<MapPin size={16} />} valor={resumo.locais} rotulo="Locais" />
          <StatTile icone={<Ticket size={16} />} valor={resumo.passagens} rotulo="Passagens" />
          <StatTile icone={<BedDouble size={16} />} valor={resumo.hoteis} rotulo="Hospedagens" />
        </div>

        {/* Valor total previsto (Task 2.2) — mesma fonte do resumo da home */}
        <div className="flex items-center justify-between gap-3 border-t border-sage-200/70 bg-forest-700/5 px-4 py-3">
          <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-700">
            <Wallet size={15} /> Valor total previsto
          </span>
          <span className="font-display text-2xl text-forest-900">
            {formatMoeda(resumo.orcamento.total, moeda)}
          </span>
        </div>

        <div className="border-t border-sage-200/70 p-4">
          <div className="mb-2 flex items-baseline justify-between">
            <span className="text-[13px] font-semibold text-ink-700">
              Progresso de organização
            </span>
            <span className="text-[13px] font-bold tabular-nums text-forest-800">
              {resumo.progresso}%
            </span>
          </div>
          <ProgressBar valor={resumo.progresso} />
          <div className="mt-3 flex flex-wrap gap-2">
            <Button tamanho="sm" onClick={() => navigate('/roteiro')}>
              Abrir roteiro
            </Button>
            <Button
              tamanho="sm"
              variante="creme"
              onClick={() => navigate('/planejamento')}
            >
              Planejamento
            </Button>
            <Button
              tamanho="sm"
              variante="creme"
              onClick={() => navigate('/mapa')}
            >
              Ver no mapa
            </Button>
          </div>
        </div>
      </section>

      <SegmentedControl<Aba>
        valor={aba}
        onChange={setAba}
        className="w-full justify-between sm:w-auto"
        opcoes={[
          { valor: 'geral', rotulo: 'Visão geral' },
          { valor: 'passagens', rotulo: 'Passagens', contagem: passagens.length },
          { valor: 'hoteis', rotulo: 'Hotéis', contagem: hoteis.length },
          { valor: 'dados', rotulo: 'Dados' },
        ]}
      />

      {aba === 'geral' ? (
        <div className="grid gap-5 lg:grid-cols-2">
          {/* Orçamento */}
          <section className="rounded-3xl border border-sage-200/70 bg-cream-50 p-5">
            <h2 className="flex items-center gap-2 text-lg">
              <Receipt size={18} className="text-forest-700" /> Orçamento previsto
            </h2>
            <p className="mt-1 text-[12px] text-ink-500">
              Cada custo aparece uma única vez, na sua categoria.
            </p>

            <div className="mt-4 space-y-3">
              {barras.map((b) => {
                const pct = resumo.orcamento.total
                  ? Math.round((b.valor / resumo.orcamento.total) * 100)
                  : 0
                return (
                  <div key={b.rotulo}>
                    <div className="mb-1 flex items-baseline justify-between text-[13px]">
                      <span className="font-medium text-ink-700">{b.rotulo}</span>
                      <span className="font-semibold tabular-nums text-ink-800">
                        {formatMoeda(b.valor, moeda)}
                      </span>
                    </div>
                    <ProgressBar valor={pct} cor={b.cor} className="h-1.5" />
                  </div>
                )
              })}
            </div>

            <div className="mt-5 flex items-center justify-between rounded-2xl bg-forest-700 px-4 py-3 text-cream-50">
              <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold">
                <TrendingUp size={16} /> Total previsto
              </span>
              <span className="font-display text-2xl">
                {formatMoeda(resumo.orcamento.total, moeda)}
              </span>
            </div>
          </section>

          {/* Próximos itens */}
          <section className="rounded-3xl border border-sage-200/70 bg-cream-50 p-5">
            <h2 className="text-lg">Próximos itens do roteiro</h2>
            <p className="mt-1 text-[12px] text-ink-500">
              Na ordem dos dias da viagem.
            </p>

            {proximos.length === 0 ? (
              <div className="mt-4">
                <EmptyState
                  compacto
                  icone={<CalendarDays size={20} />}
                  titulo="Roteiro ainda vazio"
                  descricao="Organize os registros do planejamento nos dias para ver os próximos itens aqui."
                  acao={
                    <Button
                      tamanho="sm"
                      variante="creme"
                      onClick={() => navigate('/roteiro')}
                    >
                      Montar roteiro
                    </Button>
                  }
                />
              </div>
            ) : (
              <ul className="mt-4 space-y-2.5">
                {proximos.map(({ dia, entrada }) => {
                  const { item } = entrada
                  const titulo =
                    item.tipo === 'LOCAL'
                      ? item.local.nome
                      : item.tipo === 'PASSAGEM'
                        ? `${item.passagem.origem} → ${item.passagem.destino}`
                        : item.hotel.nome
                  const emoji =
                    item.tipo === 'LOCAL'
                      ? '📍'
                      : item.tipo === 'PASSAGEM'
                        ? '✈️'
                        : '🏨'
                  const horario =
                    entrada.entrada.inicio ??
                    (item.tipo === 'LOCAL' ? item.local.horarioPrevisto : undefined) ??
                    (item.tipo === 'PASSAGEM'
                      ? horaDe(item.passagem.partida)
                      : undefined)
                  return (
                    <li
                      key={entrada.entrada.id}
                      className="flex items-center gap-3 rounded-2xl border border-sage-200/70 bg-cream-100/60 px-3.5 py-2.5"
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-sage-100 text-base">
                        {emoji}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14px] font-semibold text-forest-900">
                          {titulo}
                        </span>
                        <span className="block text-[12px] text-ink-500">
                          {formatDiaOuNumero(dia.data, dia.numero)}
                        </span>
                      </span>
                      {horario ? (
                        <span className="shrink-0 rounded-full bg-forest-700 px-2 py-0.5 text-[11px] font-bold tabular-nums text-cream-50">
                          {horario}
                        </span>
                      ) : null}
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        </div>
      ) : null}

      {aba === 'passagens' ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg">Passagens</h2>
            <Button
              tamanho="sm"
              variante="creme"
              icone={<Plus size={15} />}
              onClick={() => navigate('/cadastro/passagem')}
            >
              Nova
            </Button>
          </div>
          {passagens.length === 0 ? (
            <EmptyState
              compacto
              icone={<Ticket size={20} />}
              titulo="Nenhuma passagem cadastrada"
              descricao="Cadastre os trechos de avião, trem ou ônibus da viagem."
              acao={
                <Button
                  tamanho="sm"
                  onClick={() => navigate('/cadastro/passagem')}
                  icone={<Plus size={15} />}
                >
                  Cadastrar passagem
                </Button>
              }
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {passagens.map((p) => (
                <div key={p.id} className="flex flex-col gap-2">
                  <PassagemCard passagem={p} />
                  <Button
                    variante="fantasma"
                    tamanho="sm"
                    className="self-end"
                    icone={<Pencil size={14} />}
                    onClick={() => setEditando({ tipo: 'PASSAGEM', id: p.id })}
                  >
                    Editar passagem
                  </Button>
                </div>
              ))}
            </div>
          )}
        </section>
      ) : null}

      {aba === 'hoteis' ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg">Hospedagens</h2>
            <Button
              tamanho="sm"
              variante="creme"
              icone={<Plus size={15} />}
              onClick={() => navigate('/cadastro/hotel')}
            >
              Nova
            </Button>
          </div>
          {hoteis.length === 0 ? (
            <EmptyState
              compacto
              icone={<BedDouble size={20} />}
              titulo="Nenhuma hospedagem cadastrada"
              descricao="Cadastre onde você vai ficar — o período define os dias de vigência."
              acao={
                <Button
                  tamanho="sm"
                  onClick={() => navigate('/cadastro/hotel')}
                  icone={<Plus size={15} />}
                >
                  Cadastrar hospedagem
                </Button>
              }
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {hoteis.map((h) => (
                <div key={h.id} className="flex flex-col gap-2">
                  <HotelCard hotel={h} dias={dias} />
                  <Button
                    variante="fantasma"
                    tamanho="sm"
                    className="self-end"
                    icone={<Pencil size={14} />}
                    onClick={() => setEditando({ tipo: 'HOTEL', id: h.id })}
                  >
                    Editar hospedagem
                  </Button>
                </div>
              ))}
            </div>
          )}
        </section>
      ) : null}

      {aba === 'dados' ? (
        <div className="space-y-4">
          <section className="rounded-3xl border border-sage-200/70 bg-cream-50 p-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg">Destinos</h2>
              <Button
                tamanho="sm"
                variante="creme"
                onClick={() => setDestinosAberto(true)}
              >
                Editar destinos
              </Button>
            </div>
            <ul className="mt-4 space-y-2">
              {destinos.map((destino, i) => (
                <li
                  key={destino.id}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-cream-100/60 px-3.5 py-2.5 text-[13px]"
                >
                  <span className="flex items-center gap-2.5">
                    <span className="grid h-7 w-7 place-items-center rounded-lg bg-forest-700 font-display text-[12px] font-bold text-cream-50">
                      {i + 1}
                    </span>
                    <span className="font-medium text-ink-800">{destino.nome}</span>
                  </span>
                  <span className="text-[12px] text-ink-500">
                    {destino.dataInicio && destino.dataFim
                      ? formatPeriodo(destino.dataInicio, destino.dataFim)
                      : 'sem período'}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-3xl border border-sage-200/70 bg-cream-50 p-5">
              <h2 className="text-lg">Dados importantes</h2>
            <dl className="mt-4 space-y-3 text-[13px]">
              <Dado termo="Destino" valor={viagem.destino} />
              <Dado
                termo="Período"
                valor={formatPeriodoOpcional(viagem.dataInicio, viagem.dataFim)}
              />
              {viagem.comDatas && viagem.dataInicio && viagem.dataFim ? (
                <>
                  <Dado termo="Início" valor={formatDataLonga(viagem.dataInicio)} />
                  <Dado termo="Fim" valor={formatDataLonga(viagem.dataFim)} />
                </>
              ) : null}
              <Dado
                termo="Dias no roteiro"
                valor={`${resumo.dias} ${resumo.dias === 1 ? 'dia' : 'dias'}`}
              />
              <Dado termo="Valor total" valor={formatMoeda(resumo.orcamento.total, moeda)} />
              <Dado termo="Moeda" valor={viagem.moeda} />
              <Dado
                termo="Criada em"
                valor={formatDataLonga(viagem.criadaEm.slice(0, 10))}
              />
              <Dado termo="Responsável" valor={state.usuario.nome} />
            </dl>
          </div>

          <div className="rounded-3xl border border-sage-200/70 bg-cream-50 p-5">
            <h2 className="text-lg">Dias da viagem</h2>
            <ul className="mt-4 space-y-2">
              {dias.map((d) => (
                <li
                  key={d.id}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-cream-100/60 px-3.5 py-2.5 text-[13px]"
                >
                  <span className="flex items-center gap-2.5">
                    <span className="grid h-7 w-7 place-items-center rounded-lg bg-forest-700 font-display text-[12px] font-bold text-cream-50">
                      {d.numero}
                    </span>
                    <span className="font-medium text-ink-800">
                      {formatDiaOuNumero(d.data, d.numero)}
                    </span>
                  </span>
                  <span className="text-ink-500">
                    {destinoDoDia(state, d)?.nome ?? 'Sem destino'}
                    {d.titulo ? ` · ${d.titulo}` : ''}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-5 flex flex-wrap gap-2">
              <Button
                tamanho="sm"
                variante="creme"
                onClick={() => setPeriodoAberto(true)}
              >
                {viagem.comDatas ? 'Alterar datas' : 'Definir datas'}
              </Button>
              <Button
                tamanho="sm"
                variante="creme"
                onClick={() =>
                  dispatch({ type: 'UPDATE_VIAGEM', id: viagem.id, patch: { ativa: true } })
                }
              >
                Manter como viagem ativa
              </Button>
              <Button
                tamanho="sm"
                variante="fantasma"
                onClick={() => navigate('/estados')}
              >
                Ver estados do sistema
              </Button>
            </div>
          </div>
        </section>
        </div>
      ) : null}

      {/* Edição de registros em modal — preserva o contexto (Task 7) */}
      <EditarItemSheet
        tipo={editando?.tipo ?? null}
        itemId={editando?.id ?? null}
        viagemId={viagem.id}
        aoFechar={() => setEditando(null)}
      />

      {/* Definir/alterar período preservando o roteiro (Task 5.4) */}
      {periodoAberto ? (
        <PeriodoSheet
          viagemId={viagem.id}
          aberto
          aoFechar={() => setPeriodoAberto(false)}
        />
      ) : null}

      {destinosAberto ? (
        <DestinosSheet
          viagemId={viagem.id}
          aberto
          aoFechar={() => setDestinosAberto(false)}
        />
      ) : null}
    </div>
  )
}

function Dado({ termo, valor }: { termo: string; valor: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-sage-200/60 pb-2 last:border-0 last:pb-0">
      <dt className="text-ink-400">{termo}</dt>
      <dd className="text-right font-semibold text-ink-800">{valor}</dd>
    </div>
  )
}
