import { useState } from 'react'
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react'
import type { ID } from '../../types'
import { useTrip } from '../../store/TripStore'
import { uid } from '../../store/tripModel'
import { destinosDaViagem } from '../../lib/derive'
import { validarPeriodo } from '../../lib/validacao'
import { Sheet } from '../ui/Sheet'
import { Button } from '../ui/Button'
import { Campo, Entrada, LinhaCampos } from '../ui/Field'

interface Props {
  viagemId: ID
  aberto: boolean
  aoFechar: () => void
}

interface DestinoDraft {
  id: ID
  nome: string
  dataInicio: string
  dataFim: string
}

export function DestinosSheet({ viagemId, aberto, aoFechar }: Props) {
  const { state, dispatch } = useTrip()
  const viagem = state.viagens.find((v) => v.id === viagemId)
  const existentes = destinosDaViagem(state, viagemId)

  const [destinos, setDestinos] = useState<DestinoDraft[]>(() => {
    if (!existentes.length) {
      return [
        {
          id: uid('dest'),
          nome: viagem?.destino ?? '',
          dataInicio: viagem?.dataInicio ?? '',
          dataFim: viagem?.dataFim ?? '',
        },
      ]
    }
    return existentes.map((d) => ({
      id: d.id,
      nome: d.nome,
      dataInicio: d.dataInicio ?? '',
      dataFim: d.dataFim ?? '',
    }))
  })
  const [erros, setErros] = useState<Record<string, string | undefined>>({})

  if (!viagem || !aberto) return null

  const comDatas = viagem.comDatas

  function atualizar(indice: number, patch: Partial<DestinoDraft>) {
    setDestinos((atuais) =>
      atuais.map((d, i) => (i === indice ? { ...d, ...patch } : d)),
    )
  }

  function adicionar() {
    setDestinos((atuais) => [
      ...atuais,
      { id: uid('dest'), nome: '', dataInicio: '', dataFim: '' },
    ])
  }

  function remover(indice: number) {
    setDestinos((atuais) =>
      atuais.length > 1 ? atuais.filter((_, i) => i !== indice) : atuais,
    )
  }

  function mover(indice: number, direcao: -1 | 1) {
    setDestinos((atuais) => {
      const alvo = indice + direcao
      if (alvo < 0 || alvo >= atuais.length) return atuais
      const copia = [...atuais]
      const [item] = copia.splice(indice, 1)
      copia.splice(alvo, 0, item)
      return copia
    })
  }

  function salvar() {
    const e: Record<string, string> = {}
    if (!destinos.length) e.geral = 'Mantenha ao menos um destino'

    destinos.forEach((destino, i) => {
      if (!destino.nome.trim()) {
        e[`destino-${i}`] = 'Informe a cidade ou destino'
      }
      if (comDatas && (destino.dataInicio || destino.dataFim)) {
        if (!destino.dataInicio || !destino.dataFim) {
          e[`periodo-${i}`] = 'Informe a chegada e a saída do destino'
        } else {
          const erroPeriodo = validarPeriodo(
            destino.dataInicio,
            destino.dataFim,
          )
          if (erroPeriodo) e[`periodo-${i}`] = erroPeriodo
          else if (
            (viagem?.dataInicio && destino.dataInicio < viagem.dataInicio) ||
            (viagem?.dataFim && destino.dataFim > viagem.dataFim)
          ) {
            e[`periodo-${i}`] =
              'O período do destino deve estar dentro do período da viagem'
          }
        }
      }
    })

    setErros(e)
    if (Object.keys(e).length) return

    const idsMantidos = new Set(destinos.map((d) => d.id))
    for (const atual of existentes) {
      if (!idsMantidos.has(atual.id)) {
        dispatch({ type: 'DELETE_DESTINO', id: atual.id })
      }
    }

    const idsExistentes = new Set(existentes.map((d) => d.id))
    destinos.forEach((destino, i) => {
      const dados = {
        viagemId,
        nome: destino.nome.trim(),
        cidade: destino.nome.trim(),
        ordem: i,
        dataInicio:
          comDatas && destino.dataInicio ? destino.dataInicio : undefined,
        dataFim: comDatas && destino.dataFim ? destino.dataFim : undefined,
      }

      if (idsExistentes.has(destino.id)) {
        dispatch({
          type: 'UPDATE_DESTINO',
          id: destino.id,
          patch: dados,
        })
      } else {
        dispatch({
          type: 'ADD_DESTINO',
          destino: { id: destino.id, ...dados },
        })
      }
    })

    dispatch({
      type: 'REORDENAR_DESTINOS',
      viagemId,
      ids: destinos.map((d) => d.id),
    })
    aoFechar()
  }

  return (
    <Sheet
      aberto={aberto}
      aoFechar={aoFechar}
      largura="lg"
      titulo="Destinos da viagem"
      subtitulo="A ordem define a sequência das cidades."
      rodape={
        <div className="flex flex-col gap-2.5 sm:flex-row sm:justify-end">
          <Button variante="creme" bloco className="sm:w-auto" onClick={aoFechar}>
            Cancelar
          </Button>
          <Button bloco className="sm:w-auto" onClick={salvar}>
            Salvar destinos
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        {erros.geral ? (
          <p className="rounded-2xl bg-clay-100 px-3.5 py-2.5 text-[12px] font-semibold text-clay-700">
            {erros.geral}
          </p>
        ) : null}

        {destinos.map((destino, i) => (
          <div
            key={destino.id}
            className="space-y-3 rounded-2xl border border-sage-200 bg-cream-50 p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[12px] font-bold text-forest-800">
                Destino {i + 1}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label="Mover destino para cima"
                  disabled={i === 0}
                  onClick={() => mover(i, -1)}
                  className="grid h-8 w-8 place-items-center rounded-full text-ink-400 transition-colors hover:bg-sage-100 hover:text-forest-700 disabled:opacity-30"
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  type="button"
                  aria-label="Mover destino para baixo"
                  disabled={i === destinos.length - 1}
                  onClick={() => mover(i, 1)}
                  className="grid h-8 w-8 place-items-center rounded-full text-ink-400 transition-colors hover:bg-sage-100 hover:text-forest-700 disabled:opacity-30"
                >
                  <ChevronDown size={14} />
                </button>
                <button
                  type="button"
                  aria-label="Remover destino"
                  disabled={destinos.length === 1}
                  onClick={() => remover(i)}
                  className="grid h-8 w-8 place-items-center rounded-full text-ink-400 transition-colors hover:bg-clay-100 hover:text-clay-700 disabled:opacity-30"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <Campo
              rotulo="Cidade / destino"
              obrigatorio
              erro={erros[`destino-${i}`]}
            >
              <Entrada
                value={destino.nome}
                erro={!!erros[`destino-${i}`]}
                placeholder="Ex.: Lisboa"
                onChange={(e) => {
                  atualizar(i, { nome: e.target.value })
                  setErros((anteriores) => ({
                    ...anteriores,
                    [`destino-${i}`]: undefined,
                  }))
                }}
              />
            </Campo>

            {comDatas ? (
              <>
                <LinhaCampos>
                  <Campo rotulo="Chegada">
                    <Entrada
                      type="date"
                      value={destino.dataInicio}
                      erro={!!erros[`periodo-${i}`]}
                      onChange={(e) => {
                        atualizar(i, { dataInicio: e.target.value })
                        setErros((anteriores) => ({
                          ...anteriores,
                          [`periodo-${i}`]: undefined,
                        }))
                      }}
                    />
                  </Campo>
                  <Campo rotulo="Saída">
                    <Entrada
                      type="date"
                      value={destino.dataFim}
                      erro={!!erros[`periodo-${i}`]}
                      onChange={(e) => {
                        atualizar(i, { dataFim: e.target.value })
                        setErros((anteriores) => ({
                          ...anteriores,
                          [`periodo-${i}`]: undefined,
                        }))
                      }}
                    />
                  </Campo>
                </LinhaCampos>
                {erros[`periodo-${i}`] ? (
                  <p className="text-[12px] font-medium text-clay-700">
                    {erros[`periodo-${i}`]}
                  </p>
                ) : null}
              </>
            ) : null}
          </div>
        ))}

        <Button
          variante="creme"
          bloco
          icone={<Plus size={16} />}
          onClick={adicionar}
        >
          Adicionar destino
        </Button>
      </div>
    </Sheet>
  )
}
