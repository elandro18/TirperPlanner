import { useState } from 'react'
import { AlertTriangle, CalendarRange, CalendarX } from 'lucide-react'
import type { ID } from '../../types'
import { useTrip } from '../../store/TripStore'
import { diasDaViagem } from '../../lib/derive'
import { diasEntre } from '../../lib/format'
import { validarPeriodo, validarPeriodoParcial } from '../../lib/validacao'
import { Sheet } from '../ui/Sheet'
import { Button } from '../ui/Button'
import { Campo, Entrada } from '../ui/Field'
import { cn } from '../../lib/cn'

interface Props {
  viagemId: ID
  aberto: boolean
  aoFechar: () => void
}

/**
 * Define/altera o período da viagem sem perder dias e atividades já
 * cadastrados (Task 5.4). As datas dos dias existentes são recalculadas a
 * partir do novo início; nada é excluído.
 */
export function PeriodoSheet({ viagemId, aberto, aoFechar }: Props) {
  const { state, dispatch } = useTrip()
  const viagem = state.viagens.find((v) => v.id === viagemId)
  const dias = viagem ? diasDaViagem(state, viagemId) : []

  const [comDatas, setComDatas] = useState(viagem?.comDatas ?? false)
  const [dataInicio, setDataInicio] = useState(viagem?.dataInicio ?? '')
  const [dataFim, setDataFim] = useState(viagem?.dataFim ?? '')
  const [erro, setErro] = useState<string>()

  if (!viagem) return null

  const diasPeriodo =
    comDatas && dataInicio && dataFim
      ? Math.max(0, diasEntre(dataInicio, dataFim) + 1)
      : 0

  function validarParcialmente(inicio: string, fim: string) {
    const erros = validarPeriodoParcial(inicio, fim)
    setErro(erros.dataInicio ?? erros.dataFim)
  }

  function salvar() {
    if (comDatas) {
      const erroPeriodo = validarPeriodo(dataInicio, dataFim)
      if (erroPeriodo) {
        setErro(erroPeriodo)
        return
      }
    }
    dispatch({
      type: 'SET_DATAS',
      viagemId,
      comDatas,
      dataInicio: comDatas ? dataInicio : undefined,
      dataFim: comDatas ? dataFim : undefined,
    })
    aoFechar()
  }

  return (
    <Sheet
      aberto={aberto}
      aoFechar={aoFechar}
      titulo="Período da viagem"
      subtitulo="Você pode definir ou alterar as datas quando quiser."
      rodape={
        <div className="flex flex-col gap-2.5 sm:flex-row sm:justify-end">
          <Button variante="creme" bloco className="sm:w-auto" onClick={aoFechar}>
            Cancelar
          </Button>
          <Button bloco className="sm:w-auto" onClick={salvar}>
            Salvar período
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              setComDatas(true)
              setErro(undefined)
            }}
            className={cn(
              'flex items-center gap-2.5 rounded-2xl border px-3.5 py-3 text-left transition-colors',
              comDatas
                ? 'border-forest-700 bg-forest-700 text-cream-50'
                : 'border-sage-200 bg-cream-50 text-ink-600',
            )}
          >
            <CalendarRange size={18} />
            <span className="text-[13px] font-semibold">Com datas</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setComDatas(false)
              setErro(undefined)
            }}
            className={cn(
              'flex items-center gap-2.5 rounded-2xl border px-3.5 py-3 text-left transition-colors',
              !comDatas
                ? 'border-forest-700 bg-forest-700 text-cream-50'
                : 'border-sage-200 bg-cream-50 text-ink-600',
            )}
          >
            <CalendarX size={18} />
            <span className="text-[13px] font-semibold">Sem datas</span>
          </button>
        </div>

        {comDatas ? (
          <div className="grid grid-cols-2 gap-3">
            <Campo rotulo="Início" obrigatorio>
              <Entrada
                type="date"
                value={dataInicio}
                onChange={(e) => {
                  const valor = e.target.value
                  setDataInicio(valor)
                  validarParcialmente(valor, dataFim)
                }}
              />
            </Campo>
            <Campo rotulo="Fim" obrigatorio>
              <Entrada
                type="date"
                value={dataFim}
                onChange={(e) => {
                  const valor = e.target.value
                  setDataFim(valor)
                  validarParcialmente(dataInicio, valor)
                }}
              />
            </Campo>
          </div>
        ) : null}

        {erro ? (
          <p className="rounded-2xl bg-clay-100 px-3.5 py-2.5 text-[12px] font-semibold text-clay-700">
            {erro}
          </p>
        ) : null}

        <p className="rounded-2xl bg-sage-100 px-3.5 py-3 text-[12px] leading-relaxed text-ink-600">
          Seus <strong>{dias.length} {dias.length === 1 ? 'dia' : 'dias'}</strong>{' '}
          e todas as atividades já cadastradas serão preservados. As datas dos
          dias existentes são recalculadas a partir do novo início.
        </p>

        {comDatas && diasPeriodo > 0 && diasPeriodo < dias.length ? (
          <p className="flex items-start gap-2 rounded-2xl bg-clay-100 px-3.5 py-2.5 text-[12px] font-semibold leading-relaxed text-clay-700">
            <AlertTriangle size={15} className="mt-0.5 shrink-0" />
            O período informado comporta {diasPeriodo}{' '}
            {diasPeriodo === 1 ? 'dia' : 'dias'}, mas o roteiro já tem{' '}
            {dias.length}. Os dias extras continuarão existindo com datas
            sequenciais — nada será excluído.
          </p>
        ) : null}
      </div>
    </Sheet>
  )
}
