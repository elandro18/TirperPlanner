import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, BedDouble, MapPin, Plus, Ticket } from 'lucide-react'
import type { ID, RoteiroItemTipo } from '../../types'
import { useTrip } from '../../store/TripStore'
import {
  conflitoAoAdicionar,
  hoteisDaViagem,
  locaisDaViagem,
  passagensDaViagem,
  viagemPorId,
} from '../../lib/derive'
import { formatMoeda, minToHhmm } from '../../lib/format'
import { Sheet } from '../ui/Sheet'
import { SegmentedControl } from '../ui/SegmentedControl'
import { Button } from '../ui/Button'

interface Props {
  aberto: boolean
  aoFechar: () => void
  viagemId: ID
  diaId: ID
}

export function AdicionarItemSheet({
  aberto,
  aoFechar,
  viagemId,
  diaId,
}: Props) {
  const { state, dispatch } = useTrip()
  const navigate = useNavigate()
  const [tipo, setTipo] = useState<RoteiroItemTipo>('LOCAL')
  const [erro, setErro] = useState<string>()
  const [pendente, setPendente] = useState<{
    tipoItem: RoteiroItemTipo
    itemId: ID
    titulo: string
  } | null>(null)

  const locais = locaisDaViagem(state, viagemId)
  const passagens = passagensDaViagem(state, viagemId)
  const hoteis = hoteisDaViagem(state, viagemId)

  const jaNoDia = useMemo(
    () =>
      new Set(
        state.roteiro
          .filter((r) => r.diaId === diaId)
          .map((r) => `${r.tipoItem}:${r.itemId}`),
      ),
    [state.roteiro, diaId],
  )

  function executarVinculo(tipoItem: RoteiroItemTipo, itemId: ID) {
    const viagem = viagemPorId(state, viagemId)
    /* Sem datas não há como saber os dias da hospedagem — vincula só ao dia. */
    if (tipoItem === 'HOTEL' && viagem?.comDatas) {
      dispatch({ type: 'ADD_HOTEL_AOS_DIAS', hotelId: itemId })
    } else {
      dispatch({
        type: 'ADD_ROTEIRO',
        entrada: {
          id: `r-${tipoItem}-${itemId}-${diaId}`,
          viagemId,
          diaId,
          tipoItem,
          itemId,
        },
      })
    }
    aoFechar()
  }

  function vincular(tipoItem: RoteiroItemTipo, itemId: ID, titulo: string) {
    setErro(undefined)

    if (tipoItem === 'PASSAGEM') {
      const conflito = conflitoAoAdicionar(state, { diaId, tipoItem, itemId })
      if (conflito) {
        setErro(
          `Conflito com “${conflito.titulo}” (${minToHhmm(conflito.inicio)}–${minToHhmm(conflito.fim)}) neste dia. Ajuste o horário da passagem antes de adicioná-la.`,
        )
        return
      }
    }

    const emOutroDia = state.roteiro.some(
      (r) =>
        r.tipoItem === tipoItem && r.itemId === itemId && r.diaId !== diaId,
    )

    if (emOutroDia && tipoItem !== 'HOTEL') {
      setPendente({ tipoItem, itemId, titulo })
      return
    }

    executarVinculo(tipoItem, itemId)
  }

  const contagens = {
    LOCAL: locais.length,
    PASSAGEM: passagens.length,
    HOTEL: hoteis.length,
  }

  const criarNovo =
    tipo === 'LOCAL'
      ? '/cadastro/local'
      : tipo === 'PASSAGEM'
        ? '/cadastro/passagem'
        : '/cadastro/hotel'

  return (
    <>
      <Sheet
        aberto={aberto}
        aoFechar={aoFechar}
        titulo="Adicionar item ao dia"
        subtitulo="Escolha um registro já cadastrado ou crie um novo."
      >
        <SegmentedControl<RoteiroItemTipo>
          valor={tipo}
          onChange={setTipo}
          className="mb-4 w-full justify-between"
          opcoes={[
            { valor: 'LOCAL', rotulo: 'Locais', contagem: contagens.LOCAL },
            { valor: 'PASSAGEM', rotulo: 'Passagens', contagem: contagens.PASSAGEM },
            { valor: 'HOTEL', rotulo: 'Hotéis', contagem: contagens.HOTEL },
          ]}
        />

        {erro ? (
          <p className="mb-3 flex items-start gap-2 rounded-2xl bg-clay-100 px-3.5 py-2.5 text-[12px] font-semibold leading-relaxed text-clay-700">
            <AlertTriangle size={15} className="mt-0.5 shrink-0" />
            {erro}
          </p>
        ) : null}

        <ul className="space-y-2">
        {tipo === 'LOCAL' &&
          locais.map((l) => (
            <Linha
              key={l.id}
              icone={<MapPin size={16} />}
              titulo={l.nome}
              detalhe={[l.cidade, l.duracaoMin ? `${l.duracaoMin} min` : null]
                .filter(Boolean)
                .join(' · ')}
              valor={l.custo ? formatMoeda(l.custo) : 'Grátis'}
              incluido={jaNoDia.has(`LOCAL:${l.id}`)}
              onAdicionar={() => vincular('LOCAL', l.id, l.nome)}
            />
          ))}

        {tipo === 'PASSAGEM' &&
          passagens.map((p) => (
            <Linha
              key={p.id}
              icone={<Ticket size={16} />}
              titulo={`${p.origem} → ${p.destino}`}
              detalhe={p.companhia ?? ''}
              valor={p.valor ? formatMoeda(p.valor) : ''}
              incluido={jaNoDia.has(`PASSAGEM:${p.id}`)}
              onAdicionar={() =>
                vincular('PASSAGEM', p.id, `${p.origem} → ${p.destino}`)
              }
            />
          ))}

        {tipo === 'HOTEL' &&
          hoteis.map((h) => (
            <Linha
              key={h.id}
              icone={<BedDouble size={16} />}
              titulo={h.nome}
              detalhe={`${h.noites ?? 0} noites · vigora em todos os dias do período`}
              valor={formatMoeda(h.valorTotal)}
              incluido={jaNoDia.has(`HOTEL:${h.id}`)}
              onAdicionar={() => vincular('HOTEL', h.id, h.nome)}
            />
          ))}

        {contagens[tipo] === 0 ? (
          <li className="rounded-2xl border border-dashed border-sage-300 px-4 py-6 text-center text-[13px] text-ink-500">
            Nenhum registro deste tipo cadastrado ainda.
          </li>
        ) : null}
      </ul>

      <div className="mt-5 border-t border-sage-200/70 pt-4">
        <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-ink-400">
          Ou crie um novo
        </p>
        <Button
          bloco
          variante="creme"
          icone={<Plus size={17} />}
          onClick={() => navigate(`${criarNovo}?viagem=${viagemId}&dia=${diaId}`)}
        >
          {tipo === 'LOCAL'
            ? 'Novo local'
            : tipo === 'PASSAGEM'
              ? 'Nova passagem'
              : 'Nova hospedagem'}
        </Button>
        <p className="mt-2 text-[12px] text-ink-500">
          Ao salvar, o item entra automaticamente neste dia.
        </p>
      </div>
      </Sheet>

      <Sheet
        aberto={!!pendente}
        aoFechar={() => setPendente(null)}
        titulo="Item já usado em outro dia"
        subtitulo={pendente?.titulo}
        rodape={
          <div className="flex flex-col gap-2.5 sm:flex-row sm:justify-end">
            <Button
              variante="creme"
              bloco
              className="sm:w-auto"
              onClick={() => setPendente(null)}
            >
              Cancelar
            </Button>
            <Button
              bloco
              className="sm:w-auto"
              onClick={() => {
                if (pendente) executarVinculo(pendente.tipoItem, pendente.itemId)
                setPendente(null)
              }}
            >
              Adicionar mesmo assim
            </Button>
          </div>
        }
      >
        <p className="text-[14px] leading-relaxed text-ink-700">
          Este item já está adicionado ao roteiro de outro dia. Deseja
          adicioná-lo também a este dia?
        </p>
      </Sheet>
    </>
  )
}

function Linha({
  icone,
  titulo,
  detalhe,
  valor,
  incluido,
  onAdicionar,
}: {
  icone: React.ReactNode
  titulo: string
  detalhe?: string
  valor?: string
  incluido: boolean
  onAdicionar: () => void
}) {
  return (
    <li className="flex items-center gap-3 rounded-2xl border border-sage-200 bg-cream-50 p-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-sage-100 text-forest-700">
        {icone}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[14px] font-semibold text-forest-900">
          {titulo}
        </span>
        {detalhe ? (
          <span className="block truncate text-[12px] text-ink-500">{detalhe}</span>
        ) : null}
      </span>
      {valor ? (
        <span className="hidden shrink-0 text-[13px] font-semibold tabular-nums text-ink-700 sm:block">
          {valor}
        </span>
      ) : null}
      {incluido ? (
        <span className="shrink-0 rounded-full bg-sage-200 px-2.5 py-1 text-[11px] font-bold text-forest-800">
          no dia
        </span>
      ) : (
        <button
          type="button"
          onClick={onAdicionar}
          className="shrink-0 rounded-full bg-forest-700 px-3 py-1.5 text-[12px] font-semibold text-cream-50 transition-colors hover:bg-forest-800"
        >
          Adicionar
        </button>
      )}
    </li>
  )
}
