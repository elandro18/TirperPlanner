import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  CalendarPlus,
  CheckCircle2,
  Clock,
  Compass,
  GripVertical,
  Plus,
  Sparkles,
  Trash2,
  Wallet,
} from 'lucide-react'
import type { ID, TripDia } from '../types'
import { useTrip } from '../store/TripStore'
import {
  conflitoAoAdicionar,
  conflitosDoDia,
  custoEstimadoDoDia,
  destinosDaViagem,
  diasDaViagem,
  horarioDaEntrada,
  idsEmConflito,
  resumoViagem,
  roteiroDoDia,
  tituloDoItem,
  viagemAtiva,
  type ConflitoDia,
  type EntradaResolvida,
} from '../lib/derive'
import {
  formatDiaMes,
  formatDiaOuNumero,
  formatMoeda,
  hhmmToMin,
  minToHhmm,
} from '../lib/format'
import { Button } from '../components/ui/Button'
import { ProgressBar } from '../components/ui/ProgressBar'
import { EmptyState } from '../components/ui/EmptyState'
import { ItemCard } from '../components/cards/ItemCard'
import { CheckConclusao } from '../components/ui/CheckConclusao'
import { AdicionarItemSheet } from '../components/sheets/AdicionarItemSheet'
import { DetalheCardSheet } from '../components/sheets/DetalheCardSheet'
import { SugestaoRoteiroSheet } from '../components/sheets/SugestaoRoteiroSheet'
import { sugerirRoteiro, type SugestaoRoteiro } from '../lib/sugestaoRoteiro'
import { cn } from '../lib/cn'

interface MetricasDia {
  inicio?: string
  fim?: string
  duracaoMin: number
  custo: number
  conflitos: Set<ID>
  paresConflito: ConflitoDia[]
  concluidos: number
}

function metricasDia(entradas: EntradaResolvida[]): MetricasDia {
  let minIni: number | undefined
  let maxFim: number | undefined
  let duracao = 0
  let concluidos = 0
  const vistos = new Set<ID>()

  for (const { entrada, item } of entradas) {
    if (entrada.concluido) concluidos++
    if (item.tipo === 'HOTEL') continue
    const { inicio, fim } = horarioDaEntrada(entrada, item)
    const ini = hhmmToMin(inicio)
    const f = hhmmToMin(fim)
    if (item.tipo === 'LOCAL' && !vistos.has(item.local.id)) {
      vistos.add(item.local.id)
      if (item.local.duracaoMin) duracao += item.local.duracaoMin
    }
    if (ini != null) {
      minIni = minIni == null ? ini : Math.min(minIni, ini)
      if (f != null) maxFim = maxFim == null ? f : Math.max(maxFim, f)
    }
  }

  return {
    inicio: minIni != null ? minToHhmm(minIni) : undefined,
    fim: maxFim != null ? minToHhmm(maxFim) : undefined,
    duracaoMin: duracao,
    custo: custoEstimadoDoDia(entradas),
    conflitos: idsEmConflito(entradas),
    paresConflito: conflitosDoDia(entradas),
    concluidos,
  }
}

export function Roteiro() {
  const { state, dispatch } = useTrip()
  const navigate = useNavigate()
  const viagem = viagemAtiva(state)

  const [diaMobile, setDiaMobile] = useState(0)
  const [addDia, setAddDia] = useState<ID | null>(null)
  const [detalhe, setDetalhe] = useState<EntradaResolvida | null>(null)
  const [arrastando, setArrastando] = useState<ID | null>(null)
  const [sobreDia, setSobreDia] = useState<ID | null>(null)
  const [aviso, setAviso] = useState<string>()
  const [sugestao, setSugestao] = useState<SugestaoRoteiro | null>(null)

  const dias = viagem ? diasDaViagem(state, viagem.id) : []
  const destinos = viagem ? destinosDaViagem(state, viagem.id) : []
  const resumo = viagem ? resumoViagem(state, viagem.id) : null

  const totalNoRoteiro = state.roteiro.filter(
    (r) => r.viagemId === viagem?.id,
  ).length

  if (!viagem || !resumo) {
    return (
      <EmptyState
        icone={<Compass size={22} />}
        titulo="Nenhuma viagem ativa"
        descricao="Crie uma viagem para montar o roteiro dia a dia."
        acao={
          <Button icone={<Plus size={17} />} onClick={() => navigate('/nova-viagem')}>
            Criar viagem
          </Button>
        }
      />
    )
  }

  function soltarNoDia(diaId: ID) {
    if (!arrastando) return
    const r = state.roteiro.find((x) => x.id === arrastando)
    if (r && r.diaId !== diaId) {
      if (r.inicio) {
        const conflito = conflitoAoAdicionar(state, {
          id: r.id,
          diaId,
          tipoItem: r.tipoItem,
          itemId: r.itemId,
          inicio: r.inicio,
          fim: r.fim,
        })
        if (conflito) {
          setAviso(
            `Não foi possível mover: conflito com “${conflito.titulo}” (${minToHhmm(conflito.inicio)}–${minToHhmm(conflito.fim)}).`,
          )
          setArrastando(null)
          setSobreDia(null)
          return
        }
      }
      setAviso(undefined)
      dispatch({ type: 'MOVER_ROTEIRO', id: arrastando, paraDiaId: diaId })
    }
    setArrastando(null)
    setSobreDia(null)
  }

  function soltarNoCard(diaId: ID, alvoId: ID) {
    if (!arrastando || arrastando === alvoId) {
      setArrastando(null)
      setSobreDia(null)
      return
    }
    const ids = roteiroDoDia(state, diaId)
      .map((e) => e.entrada.id)
      .filter((id) => id !== arrastando)
    const idx = ids.indexOf(alvoId)
    if (idx < 0) return
    const novos = [...ids.slice(0, idx), arrastando, ...ids.slice(idx)]
    const arrastado = state.roteiro.find((x) => x.id === arrastando)
    if (arrastado && arrastado.diaId !== diaId) {
      if (arrastado.inicio) {
        const conflito = conflitoAoAdicionar(state, {
          id: arrastado.id,
          diaId,
          tipoItem: arrastado.tipoItem,
          itemId: arrastado.itemId,
          inicio: arrastado.inicio,
          fim: arrastado.fim,
        })
        if (conflito) {
          setAviso(
            `Não foi possível mover: conflito com “${conflito.titulo}” (${minToHhmm(conflito.inicio)}–${minToHhmm(conflito.fim)}).`,
          )
          setArrastando(null)
          setSobreDia(null)
          return
        }
      }
      setAviso(undefined)
      dispatch({ type: 'MOVER_ROTEIRO', id: arrastando, paraDiaId: diaId })
    }
    dispatch({ type: 'REORDENAR_DIA', diaId, ids: novos })
    setArrastando(null)
    setSobreDia(null)
  }

  function aplicarSugestao() {
    if (!sugestao) return
    for (const dia of sugestao.dias) {
      for (const item of dia.itens) {
        dispatch({
          type: 'ADD_ROTEIRO',
          entrada: {
            id: `r-LOCAL-${item.localId}-${dia.diaId}`,
            viagemId: viagem.id,
            diaId: dia.diaId,
            tipoItem: 'LOCAL',
            itemId: item.localId,
            inicio: item.inicio,
            fim: item.fim,
          },
        })
      }
    }
    setSugestao(null)
  }

  const colunaDia = (dia: TripDia) => {
    const entradas = roteiroDoDia(state, dia.id)
    const m = metricasDia(entradas)
    const emSobre = sobreDia === dia.id

    return (
      <section
        key={dia.id}
        onDragOver={(e) => {
          e.preventDefault()
          setSobreDia(dia.id)
        }}
        onDragLeave={() => setSobreDia((s) => (s === dia.id ? null : s))}
        onDrop={() => soltarNoDia(dia.id)}
        className={cn(
          'flex w-full shrink-0 flex-col rounded-3xl border bg-cream-100/60 transition-colors lg:w-80',
          emSobre ? 'border-forest-600 bg-sage-100/70' : 'border-sage-200/70',
        )}
      >
        {/* Cabeçalho do dia */}
        <header className="rounded-t-3xl border-b border-sage-200/70 bg-cream-50 px-4 py-3.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-2xl bg-forest-700 font-display text-sm font-bold text-cream-50">
                {dia.numero}
              </span>
              <div>
                <div className="font-display text-[17px] leading-none text-forest-900">
                  {formatDiaOuNumero(dia.data, dia.numero)}
                </div>
                <div className="mt-1 text-[11px] font-medium text-ink-400">
                  {entradas.length} {entradas.length === 1 ? 'item' : 'itens'}
                  {m.concluidos > 0 ? ` · ${m.concluidos} concluído${m.concluidos > 1 ? 's' : ''}` : ''}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {dias.length > 1 ? (
                <button
                  type="button"
                  aria-label={`Remover dia ${dia.numero}`}
                  title="Remover dia"
                  onClick={() => {
                    if (
                      window.confirm(
                        `Remover o Dia ${dia.numero}? As atividades deste dia voltam para o planejamento.`,
                      )
                    ) {
                      dispatch({ type: 'DELETE_DIA', id: dia.id })
                    }
                  }}
                  className="grid h-8 w-8 place-items-center rounded-full text-ink-400 transition-colors hover:bg-clay-100 hover:text-clay-700"
                >
                  <Trash2 size={15} />
                </button>
              ) : null}
              <button
                type="button"
                aria-label={`Adicionar item ao dia ${dia.numero}`}
                onClick={() => setAddDia(dia.id)}
                className="grid h-8 w-8 place-items-center rounded-full bg-sage-200 text-forest-800 transition-colors hover:bg-sage-300"
              >
                <CalendarPlus size={16} />
              </button>
            </div>
          </div>

          <input
            value={dia.titulo ?? ''}
            placeholder="Título do dia (opcional)"
            onChange={(e) =>
              dispatch({
                type: 'UPDATE_DIA',
                id: dia.id,
                patch: { titulo: e.target.value || undefined },
              })
            }
            className="mt-2.5 w-full rounded-xl border border-transparent bg-cream-100 px-3 py-1.5 text-[13px] font-medium text-ink-700 placeholder:text-ink-300 focus:border-sage-300 focus:bg-cream-50 focus:outline-none"
          />

          {destinos.length > 0 ? (
            <select
              value={dia.destinoId ?? ''}
              onChange={(e) =>
                dispatch({
                  type: 'UPDATE_DIA',
                  id: dia.id,
                  patch: { destinoId: e.target.value || undefined },
                })
              }
              aria-label={`Destino do dia ${dia.numero}`}
              className="mt-1.5 w-full rounded-xl border border-transparent bg-cream-100 px-3 py-1.5 text-[12px] font-semibold text-ink-600 focus:border-sage-300 focus:bg-cream-50 focus:outline-none"
            >
              <option value="">Sem destino</option>
              {destinos.map((destino) => (
                <option key={destino.id} value={destino.id}>
                  {destino.nome}
                </option>
              ))}
            </select>
          ) : null}

          {entradas.length > 0 ? (
            <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold text-ink-500">
              {m.inicio ? (
                <span className="inline-flex items-center gap-1 tabular-nums">
                  <Clock size={12} />
                  {m.inicio}
                  {m.fim ? `–${m.fim}` : ''}
                </span>
              ) : null}
              {m.duracaoMin ? (
                <span className="tabular-nums">
                  ≈ {Math.round(m.duracaoMin / 60)}h{m.duracaoMin % 60 || ''}
                </span>
              ) : null}
              {m.custo > 0 ? (
                <span className="inline-flex items-center gap-1 tabular-nums text-forest-700">
                  <Wallet size={12} /> {formatMoeda(m.custo, viagem.moeda)}
                </span>
              ) : null}
            </div>
          ) : null}

          {m.paresConflito.length > 0 ? (
            <div className="mt-2.5 rounded-xl bg-clay-100 px-2.5 py-1.5 text-[11px] text-clay-700">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle size={13} />
                {m.conflitos.size} itens com horários conflitantes
              </div>
              <ul className="mt-1 space-y-0.5 font-medium">
                {m.paresConflito.map(({ a, b }) => (
                  <li key={`${a.id}-${b.id}`}>
                    {a.titulo} ({minToHhmm(a.inicio)}–{minToHhmm(a.fim)}) ×{' '}
                    {b.titulo} ({minToHhmm(b.inicio)}–{minToHhmm(b.fim)})
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </header>

        {/* Cards */}
        <div className="flex flex-1 flex-col gap-2.5 p-3">
          {entradas.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-sage-300 px-4 py-8 text-center">
              <p className="text-[13px] font-semibold text-ink-600">Dia livre</p>
              <p className="text-[12px] leading-snug text-ink-400">
                Adicione um local, uma passagem ou a hospedagem para começar.
              </p>
              <Button
                variante="creme"
                tamanho="sm"
                icone={<Plus size={15} />}
                onClick={() => setAddDia(dia.id)}
              >
                Adicionar item
              </Button>
            </div>
          ) : (
            entradas.map((e) => {
              const concluido = !!e.entrada.concluido
              const emConflito = m.conflitos.has(e.entrada.id)
              const { inicio, fim } = horarioDaEntrada(e.entrada, e.item)
              const rotulo = concluido
                ? 'Desmarcar como concluído'
                : 'Marcar como concluído'

              return (
                <div
                  key={e.entrada.id}
                  draggable
                  onDragStart={(ev) => {
                    setArrastando(e.entrada.id)
                    ev.dataTransfer.effectAllowed = 'move'
                  }}
                  onDragEnd={() => {
                    setArrastando(null)
                    setSobreDia(null)
                  }}
                  onDragOver={(ev) => ev.preventDefault()}
                  onDrop={(ev) => {
                    ev.stopPropagation()
                    soltarNoCard(dia.id, e.entrada.id)
                  }}
                  className={cn(
                    'relative transition-opacity',
                    arrastando === e.entrada.id && 'opacity-40',
                  )}
                >
                  {concluido ? (
                    /* Card recolhido: apenas nome + horário + indicador */
                    <button
                      type="button"
                      onClick={() => setDetalhe(e)}
                      className="flex w-full items-center gap-2.5 rounded-2xl border border-sage-200 bg-cream-100/80 px-3 py-2.5 text-left transition-colors hover:border-sage-300"
                    >
                      <CheckConclusao
                        concluido
                        rotulo={rotulo}
                        onToggle={() =>
                          dispatch({
                            type: 'UPDATE_ROTEIRO',
                            id: e.entrada.id,
                            patch: { concluido: false },
                          })
                        }
                      />
                      <CheckCircle2 size={16} className="shrink-0 text-forest-600" />
                      <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-ink-600">
                        {tituloDoItem(e.item)}
                      </span>
                      {inicio ? (
                        <span className="shrink-0 text-[12px] font-bold tabular-nums text-ink-500">
                          {inicio}
                          {fim ? `–${fim}` : ''}
                        </span>
                      ) : null}
                    </button>
                  ) : (
                    <>
                      <span
                        className="absolute left-1 top-1/2 z-10 hidden -translate-y-1/2 cursor-grab text-ink-300 lg:block"
                        aria-hidden
                      >
                        <GripVertical size={15} />
                      </span>
                      <CheckConclusao
                        concluido={false}
                        rotulo={rotulo}
                        className="absolute right-3 top-3 z-10"
                        onToggle={() =>
                          dispatch({
                            type: 'UPDATE_ROTEIRO',
                            id: e.entrada.id,
                            patch: { concluido: true },
                          })
                        }
                      />
                      <ItemCard
                        item={e.item}
                        dias={dias}
                        modo="roteiro"
                        inicio={inicio}
                        fim={fim}
                        emConflito={emConflito}
                        onClick={() => setDetalhe(e)}
                        className="lg:pl-5"
                      />
                    </>
                  )}
                </div>
              )
            })
          )}

          {entradas.length > 0 ? (
            <button
              type="button"
              onClick={() => setAddDia(dia.id)}
              className="mt-0.5 flex items-center justify-center gap-1.5 rounded-2xl border border-dashed border-sage-300 py-2.5 text-[13px] font-semibold text-ink-500 transition-colors hover:border-forest-600 hover:text-forest-700"
            >
              <Plus size={15} /> Adicionar item
            </button>
          ) : null}
        </div>
      </section>
    )
  }

  const diaSelecionado = dias[Math.min(diaMobile, dias.length - 1)]

  return (
    <div className="space-y-5">
      {aviso ? (
        <div className="flex items-start gap-2 rounded-2xl bg-clay-100 px-3.5 py-2.5 text-[12px] font-semibold leading-relaxed text-clay-700">
          <AlertTriangle size={15} className="mt-0.5 shrink-0" />
          <span className="flex-1">{aviso}</span>
          <button
            type="button"
            onClick={() => setAviso(undefined)}
            className="text-[11px] font-bold uppercase tracking-wide"
          >
            Fechar
          </button>
        </div>
      ) : null}

      <header className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[12px] font-bold uppercase tracking-widest text-sage-700">
              Roteiro
            </p>
            <h1 className="mt-1 text-2xl leading-tight sm:text-3xl">
              {viagem.nome}
            </h1>
            <p className="mt-1 text-[13px] text-ink-500">
              {dias.length} {dias.length === 1 ? 'dia' : 'dias'} ·{' '}
              {totalNoRoteiro}{' '}
              {totalNoRoteiro === 1 ? 'item organizado' : 'itens organizados'}
              {!viagem.comDatas ? ' · datas a definir' : ''}
            </p>
          </div>
          <div className="flex flex-wrap items-end justify-end gap-3">
            <div className="w-full max-w-[180px]">
              <div className="mb-1 flex items-baseline justify-between">
                <span className="text-[12px] font-semibold text-ink-500">
                  organização
                </span>
                <span className="text-[12px] font-bold tabular-nums text-forest-800">
                  {resumo.progresso}%
                </span>
              </div>
              <ProgressBar valor={resumo.progresso} />
            </div>
            <Button
              tamanho="sm"
              variante="creme"
              icone={<Sparkles size={15} />}
              onClick={() => setSugestao(sugerirRoteiro(state, viagem.id))}
            >
              Sugerir roteiro
            </Button>
            <Button
              tamanho="sm"
              variante="creme"
              icone={<Plus size={15} />}
              onClick={() => dispatch({ type: 'ADD_DIA', viagemId: viagem.id })}
            >
              Adicionar dia
            </Button>
          </div>
        </div>

        {resumo.totalItens === 0 ? (
          <div className="rounded-2xl border border-sage-200/70 bg-cream-50 px-4 py-3 text-[13px] text-ink-600">
            Ainda não há registros cadastrados. Comece pelo{' '}
            <button
              type="button"
              onClick={() => navigate('/planejamento')}
              className="font-semibold text-forest-700 underline-offset-2 hover:underline"
            >
              planejamento
            </button>
            .
          </div>
        ) : null}

        {/* Seletor de dias — mobile */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar lg:hidden">
          {dias.map((d, i) => {
            const entradas = roteiroDoDia(state, d.id)
            const ativo = i === Math.min(diaMobile, dias.length - 1)
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => setDiaMobile(i)}
                className={cn(
                  'flex shrink-0 flex-col items-center rounded-2xl border px-3.5 py-2 transition-colors',
                  ativo
                    ? 'border-forest-700 bg-forest-700 text-cream-50'
                    : 'border-sage-200 bg-cream-50 text-ink-600',
                )}
              >
                <span className="text-[11px] font-bold uppercase tracking-wide">
                  Dia {d.numero}
                </span>
                <span className="text-[12px] font-medium">
                  {d.data ? formatDiaMes(d.data).replace(' de ', ' ') : 'sem data'}
                </span>
                <span
                  className={cn(
                    'mt-0.5 text-[10px] font-semibold',
                    ativo ? 'text-sage-200' : 'text-ink-400',
                  )}
                >
                  {entradas.length} itens
                </span>
              </button>
            )
          })}
          <button
            type="button"
            onClick={() => dispatch({ type: 'ADD_DIA', viagemId: viagem.id })}
            className="flex shrink-0 flex-col items-center justify-center rounded-2xl border border-dashed border-sage-300 px-3.5 py-2 text-ink-500"
          >
            <Plus size={16} />
            <span className="mt-0.5 text-[10px] font-semibold">Dia</span>
          </button>
        </div>
      </header>

      {/* Mobile: um dia por vez */}
      <div className="lg:hidden">
        {diaSelecionado ? (
          <div className="[&>section]:w-full">{colunaDia(diaSelecionado)}</div>
        ) : null}
      </div>

      {/* Desktop: kanban horizontal */}
      <div className="hidden gap-4 overflow-x-auto pb-4 lg:flex">
        {dias.map((d) => colunaDia(d))}

        {/* Coluna fantasma — adicionar dia */}
        <button
          type="button"
          onClick={() => dispatch({ type: 'ADD_DIA', viagemId: viagem.id })}
          className="flex w-40 shrink-0 flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-sage-300 text-ink-500 transition-colors hover:border-forest-600 hover:text-forest-700"
        >
          <Plus size={22} />
          <span className="text-[13px] font-semibold">Adicionar dia</span>
        </button>
      </div>

      {addDia ? (
        <AdicionarItemSheet
          aberto
          aoFechar={() => setAddDia(null)}
          viagemId={viagem.id}
          diaId={addDia}
        />
      ) : null}

      <DetalheCardSheet
        key={detalhe?.entrada.id ?? 'nenhum'}
        entrada={detalhe}
        viagemId={viagem.id}
        aberto={!!detalhe}
        aoFechar={() => setDetalhe(null)}
      />

      {sugestao ? (
        <SugestaoRoteiroSheet
          aberto
          sugestao={sugestao}
          aoFechar={() => setSugestao(null)}
          onAplicar={aplicarSugestao}
        />
      ) : null}
    </div>
  )
}
