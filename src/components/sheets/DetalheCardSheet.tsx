import { useState } from 'react'
import { AlertTriangle, Clock, Pencil, Save, Trash2 } from 'lucide-react'
import type { ID } from '../../types'
import { CATEGORIA_META, ROTEIRO_TIPO_ROTULO, TRANSPORTE_META } from '../../types'
import { useTrip } from '../../store/TripStore'
import {
  diasDaViagem,
  encontrarConflito,
  horarioDaEntrada,
  roteiroDoDia,
  type EntradaResolvida,
} from '../../lib/derive'
import {
  formatDataHora,
  formatDiaOuNumero,
  formatDuracao,
  formatMoeda,
  hhmmToMin,
  minToHhmm,
} from '../../lib/format'
import { validarIntervaloHorario } from '../../lib/validacao'
import { linkOpenStreetMap } from '../../lib/geocode'
import { Sheet } from '../ui/Sheet'
import { Button } from '../ui/Button'
import { CheckConclusao } from '../ui/CheckConclusao'
import { Campo, Entrada, Selecao } from '../ui/Field'
import { ItemCard } from '../cards/ItemCard'
import { EditarItemSheet } from './EditarItemSheet'

interface Props {
  entrada: EntradaResolvida | null
  viagemId: ID
  aberto: boolean
  aoFechar: () => void
}

export function DetalheCardSheet({ entrada, viagemId, aberto, aoFechar }: Props) {
  const { state, dispatch } = useTrip()
  const [inicio, setInicio] = useState(entrada?.entrada.inicio ?? '')
  const [fim, setFim] = useState(entrada?.entrada.fim ?? '')
  const [erroHorario, setErroHorario] = useState<string>()
  const [erroMover, setErroMover] = useState<string>()
  const [editando, setEditando] = useState(false)

  if (!entrada) return null
  const { entrada: r, item } = entrada
  const dias = diasDaViagem(state, viagemId)

  /* Task 6 — salva horários validando conflitos; impede o salvamento. */
  function salvarHorarios() {
    const problema = validarIntervaloHorario(inicio, fim)
    if (problema) {
      setErroHorario(problema)
      return
    }

    const ini = hhmmToMin(inicio)
    const f = hhmmToMin(fim)

    if (ini != null && f != null) {
      const conflito = encontrarConflito(roteiroDoDia(state, r.diaId), {
        id: r.id,
        inicio: ini,
        fim: f,
      })
      if (conflito) {
        const hIni = String(Math.floor(conflito.inicio / 60)).padStart(2, '0')
        const mIni = String(conflito.inicio % 60).padStart(2, '0')
        const hFim = String(Math.floor(conflito.fim / 60)).padStart(2, '0')
        const mFim = String(conflito.fim % 60).padStart(2, '0')
        setErroHorario(
          `Conflito com “${conflito.titulo}” (${hIni}:${mIni}–${hFim}:${mFim}). ` +
            'Ajuste o horário e tente novamente.',
        )
        return
      }
    }

    dispatch({
      type: 'UPDATE_ROTEIRO',
      id: r.id,
      patch: {
        inicio: inicio || undefined,
        fim: fim || undefined,
      },
    })
    setErroHorario(undefined)
  }

  function moverPara(novoDiaId: string) {
    if (novoDiaId === r.diaId) return
    setErroMover(undefined)

    if (r.inicio) {
      const horario = horarioDaEntrada(r, item)
      const ini = hhmmToMin(horario.inicio)
      const f = hhmmToMin(horario.fim)
      if (ini != null) {
        const conflito = encontrarConflito(roteiroDoDia(state, novoDiaId), {
          id: r.id,
          inicio: ini,
          fim: f ?? ini,
        })
        if (conflito) {
          setErroMover(
            `Conflito com “${conflito.titulo}” (${minToHhmm(conflito.inicio)}–${minToHhmm(conflito.fim)}) no dia de destino.`,
          )
          return
        }
      }
    }

    dispatch({ type: 'MOVER_ROTEIRO', id: r.id, paraDiaId: novoDiaId })
  }

  const concluido = !!r.concluido

  return (
    <>
      <Sheet
        aberto={aberto}
        aoFechar={aoFechar}
        largura="lg"
        titulo={
          item.tipo === 'LOCAL'
            ? item.local.nome
            : item.tipo === 'PASSAGEM'
              ? `${item.passagem.origem} → ${item.passagem.destino}`
              : item.hotel.nome
        }
        subtitulo={`${ROTEIRO_TIPO_ROTULO[item.tipo]} no roteiro`}
      >
        <div className="space-y-5">
          {/* Conclusão (Task 4) */}
          <div className="flex items-center gap-3 rounded-3xl border border-sage-200/70 bg-cream-50 px-4 py-3">
            <CheckConclusao
              concluido={concluido}
              rotulo={concluido ? 'Desmarcar conclusão' : 'Marcar como concluído'}
              onToggle={() =>
                dispatch({
                  type: 'UPDATE_ROTEIRO',
                  id: r.id,
                  patch: { concluido: !concluido },
                })
              }
            />
            <div className="min-w-0">
              <div className="text-[13px] font-semibold text-forest-900">
                {concluido ? 'Evento concluído' : 'Marcar como concluído'}
              </div>
              <div className="text-[12px] text-ink-500">
                Cards concluídos ficam recolhidos no roteiro.
              </div>
            </div>
          </div>

          <ItemCard item={item} dias={dias} modo="roteiro" />

          {/* Detalhes do tipo */}
          <div className="rounded-3xl border border-sage-200/70 bg-cream-50 p-4">
            <h3 className="mb-3 text-[13px] font-bold uppercase tracking-wide text-ink-400">
              Detalhes do registro
            </h3>
            <dl className="space-y-2.5 text-[13px]">
              {item.tipo === 'LOCAL' ? (
                <>
                  <Linha termo="Categoria" valor={`${CATEGORIA_META[item.local.categoria].emoji} ${CATEGORIA_META[item.local.categoria].rotulo}`} />
                  <Linha termo="Cidade" valor={item.local.cidade ?? '—'} />
                  <Linha termo="Endereço" valor={item.local.endereco ?? '—'} />
                  <Linha termo="Duração" valor={formatDuracao(item.local.duracaoMin) ?? '—'} />
                  <Linha termo="Custo" valor={item.local.custo ? formatMoeda(item.local.custo) : 'Grátis'} />
                  {item.local.observacoes ? (
                    <Linha termo="Observações" valor={item.local.observacoes} />
                  ) : null}
                </>
              ) : null}

              {item.tipo === 'PASSAGEM' ? (
                <>
                  <Linha termo="Transporte" valor={`${TRANSPORTE_META[item.passagem.tipo].emoji} ${TRANSPORTE_META[item.passagem.tipo].rotulo}`} />
                  <Linha termo="Partida" valor={formatDataHora(item.passagem.partida)} />
                  <Linha
                    termo="Chegada"
                    valor={item.passagem.chegada ? formatDataHora(item.passagem.chegada) : '—'}
                  />
                  <Linha termo="Companhia" valor={item.passagem.companhia ?? '—'} />
                  <Linha termo="Localizador" valor={item.passagem.localizador ?? '—'} />
                  <Linha termo="Passageiro" valor={item.passagem.passageiro ?? '—'} />
                  <Linha termo="Voo" valor={item.passagem.numeroVoo ?? '—'} />
                  <Linha termo="Bilhete" valor={item.passagem.numeroBilhete ?? '—'} />
                  <Linha termo="Classe" valor={item.passagem.classe ?? '—'} />
                  <Linha termo="Terminal" valor={item.passagem.terminal ?? '—'} />
                  <Linha termo="Assento" valor={item.passagem.assento ?? '—'} />
                  <Linha
                    termo="Valor"
                    valor={
                      item.passagem.valor
                        ? formatMoeda(item.passagem.valor, item.passagem.moeda)
                        : '—'
                    }
                  />
                </>
              ) : null}

              {item.tipo === 'HOTEL' ? (
                <>
                  <Linha termo="Cidade" valor={item.hotel.cidade ?? '—'} />
                  <Linha termo="Endereço" valor={item.hotel.endereco ?? '—'} />
                  <Linha termo="Check-in" valor={formatDataHora(item.hotel.checkin)} />
                  <Linha termo="Check-out" valor={formatDataHora(item.hotel.checkout)} />
                  <Linha termo="Noites" valor={String(item.hotel.noites ?? '—')} />
                  <Linha termo="Valor total" valor={formatMoeda(item.hotel.valorTotal)} />
                  <Linha termo="Reserva" valor={item.hotel.codigoReserva ?? '—'} />
                </>
              ) : null}
            </dl>

            {(() => {
              const alvo =
                item.tipo === 'LOCAL'
                  ? item.local
                  : item.tipo === 'HOTEL'
                    ? item.hotel
                    : null
              if (!alvo) return null
              const link = linkOpenStreetMap(alvo)
              if (!link) return null
              return (
                <a
                  href={link}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-sage-200 bg-cream-100 px-3 py-1.5 text-[12px] font-semibold text-forest-700 transition-colors hover:bg-sage-100"
                >
                  Abrir no OpenStreetMap
                </a>
              )
            })()}
          </div>

          {/* Horários (Task 6 — salvar com validação de conflito) */}
          {item.tipo !== 'HOTEL' ? (
            <div className="rounded-3xl border border-sage-200/70 bg-cream-50 p-4">
              <h3 className="mb-3 flex items-center gap-1.5 text-[13px] font-bold uppercase tracking-wide text-ink-400">
                <Clock size={14} /> Horários neste dia
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <Campo rotulo="Início">
                  <Entrada
                    type="time"
                    value={inicio}
                    onChange={(e) => {
                      setInicio(e.target.value)
                      setErroHorario(undefined)
                    }}
                  />
                </Campo>
                <Campo rotulo="Fim">
                  <Entrada
                    type="time"
                    value={fim}
                    onChange={(e) => {
                      setFim(e.target.value)
                      setErroHorario(undefined)
                    }}
                  />
                </Campo>
              </div>

              {erroHorario ? (
                <p className="mt-3 flex items-start gap-2 rounded-2xl bg-clay-100 px-3.5 py-2.5 text-[12px] font-semibold leading-relaxed text-clay-700">
                  <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                  {erroHorario}
                </p>
              ) : null}

              <Button
                tamanho="sm"
                variante="creme"
                icone={<Save size={15} />}
                className="mt-3"
                onClick={salvarHorarios}
              >
                Salvar horários
              </Button>
              <p className="mt-2 text-[12px] text-ink-500">
                As atividades do dia ficam ordenadas pelo horário de início.
              </p>
            </div>
          ) : null}

          {/* Mover entre dias */}
          <Campo rotulo="Mover para outro dia">
            <Selecao value={r.diaId} onChange={(e) => moverPara(e.target.value)}>
              {dias.map((d) => (
                <option key={d.id} value={d.id}>
                  {formatDiaOuNumero(d.data, d.numero)}
                  {d.titulo ? ` — ${d.titulo}` : ''}
                </option>
              ))}
            </Selecao>
            {erroMover ? (
              <p className="mt-2 flex items-start gap-2 rounded-2xl bg-clay-100 px-3.5 py-2.5 text-[12px] font-semibold leading-relaxed text-clay-700">
                <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                {erroMover}
              </p>
            ) : null}
          </Campo>

          <div className="flex flex-col gap-2.5 sm:flex-row">
            <Button
              bloco
              variante="creme"
              icone={<Pencil size={16} />}
              onClick={() => setEditando(true)}
            >
              Editar registro original
            </Button>
            <Button
              bloco
              variante="perigo"
              icone={<Trash2 size={16} />}
              onClick={() => {
                dispatch({ type: 'REMOVE_ROTEIRO', id: r.id })
                aoFechar()
              }}
            >
              Remover do dia
            </Button>
          </div>

          <p className="text-[12px] leading-relaxed text-ink-500">
            Remover do dia não apaga o registro — ele continua no inventário do
            planejamento, pronto para ser organizado em outro dia.
          </p>
        </div>
      </Sheet>

      {/* Edição em modal sobreposta — mantém o contexto do roteiro (Task 7) */}
      {editando ? (
        <EditarItemSheet
          tipo={r.tipoItem}
          itemId={r.itemId}
          viagemId={viagemId}
          aoFechar={() => setEditando(false)}
        />
      ) : null}
    </>
  )
}

function Linha({ termo, valor }: { termo: string; valor: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="shrink-0 text-ink-400">{termo}</dt>
      <dd className="text-right font-medium text-ink-800">{valor}</dd>
    </div>
  )
}
