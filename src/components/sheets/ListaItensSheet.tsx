import { useState } from 'react'
import {
  CheckCircle2,
  MapPin,
  Pencil,
  Trash2,
  Utensils,
  Wallet,
} from 'lucide-react'
import type { ID, TripListaItem } from '../../types'
import { useTrip } from '../../store/TripStore'
import { uid } from '../../store/tripModel'
import { agoraISO, formatMoeda } from '../../lib/format'
import { linkOpenStreetMap } from '../../lib/geocode'
import {
  ordenarItensLista,
  progressoLista,
  proximaOrdemItem,
  resumoFinanceiroLista,
  valorPrevistoItem,
} from '../../lib/listas'
import { Sheet } from '../ui/Sheet'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { CheckConclusao } from '../ui/CheckConclusao'
import { ProgressBar } from '../ui/ProgressBar'
import {
  FormItemLista,
  type DadosItemLista,
} from '../forms/FormItemLista'
import { ConclusaoItemSheet } from './ConclusaoItemSheet'
import { cn } from '../../lib/cn'

interface Props {
  listaId: ID | null
  aoFechar: () => void
}

export function ListaItensSheet({ listaId, aoFechar }: Props) {
  const { state, dispatch } = useTrip()
  const lista = state.listas.find((l) => l.id === listaId)
  const viagem = state.viagens.find((v) => v.id === lista?.viagemId)
  const itens = state.listaItens.filter((i) => i.listaId === listaId)
  const ordenados = ordenarItensLista(itens)
  const prog = progressoLista(itens)
  const financeiro = resumoFinanceiroLista(itens)

  const [editandoId, setEditandoId] = useState<ID | null>(null)
  const [concluindo, setConcluindo] = useState<TripListaItem | null>(null)
  const [formKey, setFormKey] = useState(0)

  if (!lista) return null

  function adicionar(dados: DadosItemLista) {
    const item: TripListaItem = {
      id: uid('li'),
      listaId: lista!.id,
      nome: dados.nome,
      tipo: dados.tipo,
      valorPrevisto: dados.valorPrevisto,
      fotoUrl: dados.fotoUrl,
      refeicao: dados.refeicao,
      endereco: dados.endereco,
      cidade: dados.cidade,
      lat: dados.lat,
      lng: dados.lng,
      fotoPratoUrl: dados.fotoPratoUrl,
      fotoLocalUrl: dados.fotoLocalUrl,
      observacoes: dados.observacoes,
      concluido: false,
      ordem: proximaOrdemItem(itens),
      criadaEm: agoraISO(),
    }
    dispatch({ type: 'ADD_LISTA_ITEM', item })
    setFormKey((k) => k + 1)
  }

  function salvarEdicao(item: TripListaItem, dados: DadosItemLista) {
    dispatch({
      type: 'UPDATE_LISTA_ITEM',
      id: item.id,
      patch: dados,
    })
    setEditandoId(null)
  }

  function alternar(item: TripListaItem) {
    if (item.concluido) {
      dispatch({
        type: 'TOGGLE_LISTA_ITEM',
        id: item.id,
        concluido: false,
        em: agoraISO(),
      })
      return
    }
    setConcluindo(item)
  }

  function confirmarConclusao(valorPago?: number) {
    if (!concluindo) return

    if (concluindo.concluido) {
      dispatch({
        type: 'UPDATE_LISTA_ITEM',
        id: concluindo.id,
        patch: {
          valorPago,
          pagoEm: valorPago != null ? agoraISO() : undefined,
        },
      })
    } else {
      dispatch({
        type: 'CONCLUIR_LISTA_ITEM',
        id: concluindo.id,
        valorPago,
        em: agoraISO(),
      })
    }
    setConcluindo(null)
  }

  return (
    <>
      <Sheet
        aberto
        aoFechar={aoFechar}
        largura="lg"
        titulo={lista.nome}
        subtitulo={lista.categoria}
      >
        <div className="space-y-5">
          <div className="rounded-3xl border border-sage-200/70 bg-cream-50 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-700">
                <CheckCircle2 size={15} className="text-forest-600" />
                {prog.concluidos} de {prog.total} concluídos
              </span>
              <span className="text-[13px] font-bold tabular-nums text-forest-800">
                {prog.pct}%
              </span>
            </div>
            <ProgressBar valor={prog.pct} />
            <p className="mt-2 text-[12px] text-ink-500">
              {prog.pendentes}{' '}
              {prog.pendentes === 1 ? 'item pendente' : 'itens pendentes'} ·
              concluídos aparecem sempre abaixo dos pendentes.
            </p>

            <div className="mt-3 grid grid-cols-2 gap-2 text-[12px]">
              <div className="rounded-2xl bg-cream-100 px-3 py-2">
                <span className="block text-[11px] font-semibold uppercase tracking-wide text-ink-400">
                  Previsto
                </span>
                <span className="font-display text-[16px] text-forest-900">
                  {formatMoeda(financeiro.previsto, viagem?.moeda)}
                </span>
              </div>
              <div className="rounded-2xl bg-forest-700/10 px-3 py-2">
                <span className="block text-[11px] font-semibold uppercase tracking-wide text-ink-400">
                  Pago
                </span>
                <span className="font-display text-[16px] text-forest-900">
                  {formatMoeda(financeiro.pago, viagem?.moeda)}
                </span>
              </div>
            </div>
            {financeiro.itensSemValor > 0 ? (
              <p className="mt-2 text-[11px] text-ink-400">
                {financeiro.itensSemValor}{' '}
                {financeiro.itensSemValor === 1
                  ? 'item concluído sem valor informado'
                  : 'itens concluídos sem valor informado'}
                .
              </p>
            ) : null}
          </div>

          <div className="rounded-3xl border border-sage-200/70 bg-cream-50 p-4">
            <h3 className="mb-3 text-[13px] font-bold uppercase tracking-wide text-ink-400">
              Adicionar item
            </h3>
            <FormItemLista key={formKey} onSalvar={adicionar} />
          </div>

          {ordenados.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-sage-300 px-4 py-8 text-center text-[13px] text-ink-500">
              Nenhum item nesta lista ainda. Adicione o primeiro acima.
            </p>
          ) : (
            <ul className="space-y-2">
              {ordenados.map((item) =>
                editandoId === item.id ? (
                  <li key={item.id}>
                    <div className="rounded-2xl border border-forest-600/40 bg-forest-700/5 p-3">
                      <FormItemLista
                        item={item}
                        rotuloAcao="Salvar item"
                        onCancelar={() => setEditandoId(null)}
                        onSalvar={(dados) => salvarEdicao(item, dados)}
                      />
                    </div>
                  </li>
                ) : (
                  <li
                    key={item.id}
                    className={cn(
                      'flex items-start gap-2.5 rounded-2xl border px-3 py-2.5 transition-colors',
                      item.concluido
                        ? 'border-sage-200 bg-cream-100/70'
                        : 'border-sage-200 bg-cream-50',
                    )}
                  >
                    <CheckConclusao
                      concluido={item.concluido}
                      rotulo={
                        item.concluido
                          ? `Reabrir ${item.nome}`
                          : `Concluir ${item.nome}`
                      }
                      onToggle={() => alternar(item)}
                      className="mt-0.5"
                    />

                    <ItemFoto item={item} />

                    <div className="min-w-0 flex-1">
                      <div
                        className={cn(
                          'text-[14px] font-semibold',
                          item.concluido
                            ? 'text-ink-400 line-through'
                            : 'text-forest-900',
                        )}
                      >
                        {item.nome}
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        {item.tipo ? (
                          <Badge tom="neutro" className="py-0.5">
                            {item.tipo}
                          </Badge>
                        ) : null}
                        {item.refeicao ? (
                          <Badge tom="argila" className="py-0.5">
                            <Utensils size={11} /> refeição
                          </Badge>
                        ) : null}
                        {valorPrevistoItem(item) > 0 ? (
                          <span className="text-[11px] font-semibold tabular-nums text-ink-600">
                            previsto {formatMoeda(valorPrevistoItem(item), viagem?.moeda)}
                          </span>
                        ) : null}
                        {item.concluido || item.valorPago != null ? (
                          <button
                            type="button"
                            onClick={() => setConcluindo(item)}
                            className="inline-flex items-center gap-1 rounded-full bg-forest-700/10 px-2 py-0.5 text-[11px] font-bold tabular-nums text-forest-700 transition-colors hover:bg-forest-700/20"
                          >
                            <Wallet size={11} />
                            {item.valorPago != null
                              ? `pago ${formatMoeda(item.valorPago, viagem?.moeda)}`
                              : 'definir valor pago'}
                          </button>
                        ) : null}
                      </div>

                      {item.refeicao && (item.endereco || item.cidade) ? (
                        <div className="mt-1 flex items-center gap-1 text-[12px] text-ink-500">
                          <MapPin size={12} className="shrink-0" />
                          <span className="truncate">
                            {[item.endereco, item.cidade].filter(Boolean).join(' · ')}
                          </span>
                          {linkOpenStreetMap(item) ? (
                            <a
                              href={linkOpenStreetMap(item)!}
                              target="_blank"
                              rel="noreferrer"
                              className="shrink-0 font-semibold text-forest-700 underline-offset-2 hover:underline"
                            >
                              mapa
                            </a>
                          ) : null}
                        </div>
                      ) : null}

                      {item.observacoes ? (
                        <p className="mt-1 text-[12px] leading-snug text-ink-500">
                          {item.observacoes}
                        </p>
                      ) : null}

                      {item.refeicao &&
                      (item.fotoPratoUrl || item.fotoLocalUrl) ? (
                        <div className="mt-2 flex gap-2">
                          {item.fotoPratoUrl ? (
                            <MiniFoto url={item.fotoPratoUrl} rotulo="Prato" />
                          ) : null}
                          {item.fotoLocalUrl ? (
                            <MiniFoto url={item.fotoLocalUrl} rotulo="Local" />
                          ) : null}
                        </div>
                      ) : null}
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        aria-label={`Editar ${item.nome}`}
                        onClick={() => setEditandoId(item.id)}
                        className="grid h-8 w-8 place-items-center rounded-full text-ink-400 transition-colors hover:bg-sage-100 hover:text-forest-700"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        aria-label={`Excluir ${item.nome}`}
                        onClick={() => {
                          if (window.confirm(`Excluir o item “${item.nome}”?`)) {
                            dispatch({ type: 'DELETE_LISTA_ITEM', id: item.id })
                          }
                        }}
                        className="grid h-8 w-8 place-items-center rounded-full text-ink-400 transition-colors hover:bg-clay-100 hover:text-clay-700"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </li>
                ),
              )}
            </ul>
          )}

          <Button variante="creme" bloco onClick={aoFechar}>
            Fechar lista
          </Button>
        </div>
      </Sheet>

      <ConclusaoItemSheet
        key={concluindo?.id ?? 'nenhum'}
        item={concluindo}
        moeda={viagem?.moeda}
        aoFechar={() => setConcluindo(null)}
        onConfirmar={confirmarConclusao}
      />
    </>
  )
}

function ItemFoto({ item }: { item: TripListaItem }) {
  const url =
    item.fotoUrl ?? item.fotoPratoUrl ?? item.fotoLocalUrl ?? undefined
  const [urlComErro, setUrlComErro] = useState<string | null>(null)

  if (!url || urlComErro === url) {
    return (
      <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sage-100 text-forest-700">
        {item.refeicao ? <Utensils size={17} /> : <CheckCircle2 size={17} />}
      </span>
    )
  }

  return (
    <img
      src={url}
      alt=""
      onError={() => setUrlComErro(url)}
      className="mt-0.5 h-10 w-10 shrink-0 rounded-xl object-cover"
    />
  )
}

function MiniFoto({ url, rotulo }: { url: string; rotulo: string }) {
  const [urlComErro, setUrlComErro] = useState<string | null>(null)

  if (urlComErro === url) return null
  return (
    <figure className="flex items-center gap-1.5 rounded-xl border border-sage-200 bg-cream-50 p-1">
      <img
        src={url}
        alt={rotulo}
        onError={() => setUrlComErro(url)}
        className="h-8 w-8 rounded-lg object-cover"
      />
      <figcaption className="pr-1 text-[10px] font-semibold uppercase tracking-wide text-ink-400">
        {rotulo}
      </figcaption>
    </figure>
  )
}
