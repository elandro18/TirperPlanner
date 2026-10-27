import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronRight,
  ClipboardList,
  ListTodo,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react'
import type { TripLista } from '../types'
import { useTrip } from '../store/TripStore'
import { progressoLista, resumoFinanceiroLista } from '../lib/listas'
import { viagemAtiva } from '../lib/derive'
import { formatMoeda } from '../lib/format'
import { PageHeader } from '../components/layout/PageHeader'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { SegmentedControl } from '../components/ui/SegmentedControl'
import { ProgressBar } from '../components/ui/ProgressBar'
import { EmptyState } from '../components/ui/EmptyState'
import { ListaFormSheet } from '../components/sheets/ListaFormSheet'
import { ListaItensSheet } from '../components/sheets/ListaItensSheet'

type AbaLista = 'ativa' | 'historico' | 'sem-vinculo'

export function Listas() {
  const { state, dispatch } = useTrip()
  const navigate = useNavigate()

  /* isolamento por usuário: só as listas do usuário logado */
  const listas = state.listas.filter((l) => l.usuarioId === state.usuario.id)
  const ativa = viagemAtiva(state)

  const daAtiva = ativa ? listas.filter((l) => l.viagemId === ativa.id) : []
  const semVinculo = listas.filter(
    (l) => !l.viagemId || !state.viagens.some((v) => v.id === l.viagemId),
  )
  const historicas = listas.filter(
    (l) =>
      !!l.viagemId &&
      l.viagemId !== ativa?.id &&
      state.viagens.some((v) => v.id === l.viagemId),
  )

  const [aba, setAba] = useState<AbaLista>('ativa')
  const [formAberto, setFormAberto] = useState(false)
  const [editando, setEditando] = useState<TripLista | null>(null)
  const [abertaId, setAbertaId] = useState<string | null>(null)

  const visiveis =
    aba === 'ativa' ? daAtiva : aba === 'historico' ? historicas : semVinculo

  function abrirNova() {
    setEditando(null)
    setFormAberto(true)
  }

  function abrirEdicao(lista: TripLista) {
    setEditando(lista)
    setFormAberto(true)
  }

  function excluir(lista: TripLista) {
    if (
      window.confirm(
        `Excluir a lista “${lista.nome}” e todos os seus itens? Esta ação não pode ser desfeita.`,
      )
    ) {
      dispatch({ type: 'DELETE_LISTA', id: lista.id })
      if (abertaId === lista.id) setAbertaId(null)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        voltar={false}
        sobre="Listas"
        titulo="Minhas listas"
        subtitulo={
          ativa
            ? `Listas da viagem ativa: ${ativa.nome}. O histórico das viagens anteriores fica preservado.`
            : 'Checklists vinculados a cada viagem. Crie uma viagem para começar.'
        }
        acao={
          <Button icone={<Plus size={17} />} onClick={abrirNova}>
            Nova lista
          </Button>
        }
      />

      <SegmentedControl<AbaLista>
        valor={aba}
        onChange={setAba}
        className="w-full justify-between sm:w-auto"
        opcoes={[
          { valor: 'ativa', rotulo: 'Viagem ativa', contagem: daAtiva.length },
          { valor: 'historico', rotulo: 'Histórico', contagem: historicas.length },
          {
            valor: 'sem-vinculo',
            rotulo: 'Sem vínculo',
            contagem: semVinculo.length,
          },
        ]}
      />

      {visiveis.length === 0 ? (
        <EmptyState
          icone={<ListTodo size={22} />}
          titulo={
            aba === 'ativa'
              ? ativa
                ? 'Nenhuma lista nesta viagem'
                : 'Nenhuma viagem ativa'
              : aba === 'historico'
                ? 'Nenhuma lista no histórico'
                : 'Nenhuma lista sem vínculo'
          }
          descricao={
            aba === 'ativa'
              ? ativa
                ? 'Crie uma lista para organizar o que levar nesta viagem.'
                : 'Crie ou ative uma viagem para vincular novas listas.'
              : aba === 'historico'
                ? 'As listas de viagens anteriores aparecem aqui, preservadas.'
                : 'Listas criadas antes do vínculo com viagens ficam aqui.'
          }
          acao={
            aba === 'ativa' || listas.length === 0 ? (
              <Button icone={<Plus size={17} />} onClick={abrirNova}>
                Criar lista
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {visiveis.map((lista) => {
            const itens = state.listaItens.filter((i) => i.listaId === lista.id)
            const prog = progressoLista(itens)
            const fin = resumoFinanceiroLista(itens)
            const moeda = state.viagens.find((v) => v.id === lista.viagemId)?.moeda
            return (
              <div
                key={lista.id}
                role="button"
                tabIndex={0}
                onClick={() => setAbertaId(lista.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setAbertaId(lista.id)
                  }
                }}
                className="group flex cursor-pointer flex-col rounded-3xl border border-sage-200/70 bg-cream-50 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-sage-300 hover:shadow-card focus-visible:outline-2 focus-visible:outline-forest-600"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="grid h-10 w-10 place-items-center rounded-2xl bg-sage-100 text-forest-700">
                    <ClipboardList size={19} />
                  </span>
                  <div
                    className="flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      aria-label={`Editar lista ${lista.nome}`}
                      onClick={() => abrirEdicao(lista)}
                      className="grid h-8 w-8 place-items-center rounded-full text-ink-400 transition-colors hover:bg-sage-100 hover:text-forest-700"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      aria-label={`Excluir lista ${lista.nome}`}
                      onClick={() => excluir(lista)}
                      className="grid h-8 w-8 place-items-center rounded-full text-ink-400 transition-colors hover:bg-clay-100 hover:text-clay-700"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <h3 className="mt-3 font-display text-lg leading-tight text-forest-900">
                  {lista.nome}
                </h3>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <Badge tom="neutro">{lista.categoria}</Badge>
                  {lista.viagemId && state.viagens.some((v) => v.id === lista.viagemId) ? (
                    <Badge tom={lista.viagemId === ativa?.id ? 'floresta' : 'creme'}>
                      {state.viagens.find((v) => v.id === lista.viagemId)?.nome}
                    </Badge>
                  ) : (
                    <Badge tom="argila">Sem vínculo</Badge>
                  )}
                </div>

                <div className="mt-4">
                  <div className="mb-1 flex items-baseline justify-between text-[12px]">
                    <span className="font-medium text-ink-500">
                      {prog.concluidos} de {prog.total} concluídos
                    </span>
                    <span className="font-bold tabular-nums text-forest-800">
                      {prog.pct}%
                    </span>
                  </div>
                  <ProgressBar valor={prog.pct} className="h-1.5" />
                </div>

                <div className="mt-2 flex items-center justify-between text-[11px] text-ink-500">
                  <span>
                    Previsto{' '}
                    <strong className="font-semibold text-ink-700">
                      {formatMoeda(fin.previsto, moeda)}
                    </strong>
                  </span>
                  <span>
                    Pago{' '}
                    <strong className="font-semibold text-forest-700">
                      {formatMoeda(fin.pago, moeda)}
                    </strong>
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-end text-[12px] font-semibold text-forest-700">
                  Abrir lista
                  <ChevronRight
                    size={15}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}

      <p className="text-center text-[12px] text-ink-400">
        {listas.length} {listas.length === 1 ? 'lista' : 'listas'} ·{' '}
        {state.listaItens.filter((i) => i.listaId && listas.some((l) => l.id === i.listaId)).length}{' '}
        itens no total
      </p>

      {listas.length === 0 ? (
        <div className="rounded-3xl border border-sage-200/70 bg-cream-50 p-5">
          <h2 className="text-lg">Como funciona</h2>
          <p className="mt-1 text-[13px] leading-relaxed text-ink-500">
            Cada lista é independente do roteiro da viagem. Marque itens como
            concluídos: eles ficam riscados e são movidos para o fim, abaixo dos
            pendentes. As alterações são salvas automaticamente.
          </p>
          <Button
            tamanho="sm"
            variante="creme"
            className="mt-3"
            onClick={() => navigate('/roteiro')}
          >
            Ir para o roteiro
          </Button>
        </div>
      ) : null}

      {formAberto ? (
        <ListaFormSheet
          aberto
          lista={editando}
          aoFechar={() => {
            setFormAberto(false)
            setEditando(null)
          }}
        />
      ) : null}

      <ListaItensSheet
        key={abertaId ?? 'nenhuma'}
        listaId={abertaId}
        aoFechar={() => setAbertaId(null)}
      />
    </div>
  )
}
