import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CalendarRange,
  CalendarX,
  ChevronDown,
  ChevronUp,
  MapPin,
  Plus,
  Sparkles,
  Trash2,
  Wand2,
} from 'lucide-react'
import type { Moeda } from '../types'
import { useTrip } from '../store/TripStore'
import { novaViagem } from '../store/tripModel'
import { foto } from '../data/seed'
import { diasEntre, formatPeriodoOpcional } from '../lib/format'
import {
  validarPeriodo,
  validarPeriodoCampos,
  validarPeriodoParcial,
} from '../lib/validacao'
import { PageHeader } from '../components/layout/PageHeader'
import { Campo, Entrada, LinhaCampos, Selecao } from '../components/ui/Field'
import { Button } from '../components/ui/Button'
import { cn } from '../lib/cn'

interface DestinoForm {
  chave: string
  nome: string
  dataInicio: string
  dataFim: string
}

function novoDestino(chave: string): DestinoForm {
  return { chave, nome: '', dataInicio: '', dataFim: '' }
}

export function CriarViagem() {
  const { state, dispatch } = useTrip()
  const navigate = useNavigate()

  const [nome, setNome] = useState('')
  const [destinos, setDestinos] = useState<DestinoForm[]>([novoDestino('d1')])
  const [comDatas, setComDatas] = useState(true)
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [moeda, setMoeda] = useState<Moeda>('BRL')
  const [capa, setCapa] = useState('')
  const [erros, setErros] = useState<Record<string, string | undefined>>({})

  const dias = useMemo(() => {
    if (!comDatas || !dataInicio || !dataFim) return 0
    return Math.max(0, diasEntre(dataInicio, dataFim) + 1)
  }, [comDatas, dataInicio, dataFim])

  const destinoResumo = destinos
    .map((d) => d.nome.trim())
    .filter(Boolean)
    .join(' · ')

  const capaSugerida =
    capa || foto(destinoResumo || 'viagem', 1600, 1000)

  function atualizarDestino(indice: number, patch: Partial<DestinoForm>) {
    setDestinos((atuais) =>
      atuais.map((d, i) => (i === indice ? { ...d, ...patch } : d)),
    )
  }

  function adicionarDestino() {
    setDestinos((atuais) => [
      ...atuais,
      novoDestino(`d-${Date.now()}-${atuais.length}`),
    ])
  }

  function removerDestino(indice: number) {
    setDestinos((atuais) =>
      atuais.length > 1 ? atuais.filter((_, i) => i !== indice) : atuais,
    )
  }

  function moverDestino(indice: number, direcao: -1 | 1) {
    setDestinos((atuais) => {
      const destino = indice + direcao
      if (destino < 0 || destino >= atuais.length) return atuais
      const copia = [...atuais]
      const [item] = copia.splice(indice, 1)
      copia.splice(destino, 0, item)
      return copia
    })
  }

  function validarParcialmente(inicio: string, fim: string) {
    const parciais = validarPeriodoParcial(inicio, fim)
    setErros((anteriores) => ({
      ...anteriores,
      dataInicio: parciais.dataInicio,
      dataFim: parciais.dataFim,
    }))
  }

  function salvar() {
    const e: Record<string, string> = {}
    if (!nome.trim()) e.nome = 'Dê um nome para a viagem'

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
            (dataInicio && destino.dataInicio < dataInicio) ||
            (dataFim && destino.dataFim > dataFim)
          ) {
            e[`periodo-${i}`] =
              'O período do destino deve estar dentro do período da viagem'
          }
        }
      }
    })

    if (comDatas) {
      const periodo = validarPeriodoCampos(dataInicio, dataFim)
      if (periodo.dataInicio) e.dataInicio = periodo.dataInicio
      if (periodo.dataFim) e.dataFim = periodo.dataFim
    }

    setErros(e)
    if (Object.keys(e).length) return

    const destinosDados = destinos.map((destino) => ({
      nome: destino.nome.trim(),
      cidade: destino.nome.trim(),
      dataInicio: comDatas && destino.dataInicio ? destino.dataInicio : undefined,
      dataFim: comDatas && destino.dataFim ? destino.dataFim : undefined,
    }))

    const resumo = destinosDados.map((destino) => destino.nome).join(' · ')
    const {
      viagem,
      dias: novosDias,
      destinos: novosDestinos,
    } = novaViagem(state.usuario.id, {
      nome: nome.trim(),
      destino: resumo,
      comDatas,
      dataInicio: comDatas ? dataInicio : undefined,
      dataFim: comDatas ? dataFim : undefined,
      moeda,
      capaUrl: capaSugerida,
      destinos: destinosDados,
    })
    dispatch({
      type: 'ADD_VIAGEM',
      viagem,
      dias: novosDias,
      destinos: novosDestinos,
    })
    navigate('/roteiro')
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        sobre="Nova viagem"
        titulo="Vamos planejar"
        subtitulo="Você pode definir o período agora ou criar a viagem sem datas e montar o roteiro aos poucos."
      />

      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault()
          salvar()
        }}
      >
        <Campo rotulo="Nome da viagem" obrigatorio erro={erros.nome}>
          <Entrada
            value={nome}
            erro={!!erros.nome}
            placeholder="Ex.: Gramado & Canela"
            onChange={(e) => setNome(e.target.value)}
          />
        </Campo>

        <section className="space-y-3 rounded-3xl border border-sage-200/70 bg-cream-50/60 p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="text-[13px] font-bold uppercase tracking-wide text-ink-400">
                Destinos
              </h2>
              <p className="mt-0.5 text-[12px] text-ink-500">
                A ordem define a sequência da viagem.
              </p>
            </div>
            <Button
              type="button"
              variante="creme"
              tamanho="sm"
              icone={<Plus size={15} />}
              onClick={adicionarDestino}
            >
              Adicionar
            </Button>
          </div>

          {destinos.map((destino, i) => (
            <div
              key={destino.chave}
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
                    onClick={() => moverDestino(i, -1)}
                    className="grid h-8 w-8 place-items-center rounded-full text-ink-400 transition-colors hover:bg-sage-100 hover:text-forest-700 disabled:opacity-30"
                  >
                    <ChevronUp size={14} />
                  </button>
                  <button
                    type="button"
                    aria-label="Mover destino para baixo"
                    disabled={i === destinos.length - 1}
                    onClick={() => moverDestino(i, 1)}
                    className="grid h-8 w-8 place-items-center rounded-full text-ink-400 transition-colors hover:bg-sage-100 hover:text-forest-700 disabled:opacity-30"
                  >
                    <ChevronDown size={14} />
                  </button>
                  <button
                    type="button"
                    aria-label="Remover destino"
                    disabled={destinos.length === 1}
                    onClick={() => removerDestino(i)}
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
                    atualizarDestino(i, { nome: e.target.value })
                    if (erros[`destino-${i}`]) {
                      setErros((anteriores) => ({
                        ...anteriores,
                        [`destino-${i}`]: undefined,
                      }))
                    }
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
                          atualizarDestino(i, { dataInicio: e.target.value })
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
                          atualizarDestino(i, { dataFim: e.target.value })
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

          <p className="text-[12px] leading-relaxed text-ink-500">
            Você pode adicionar, remover e reordenar destinos depois, nos
            detalhes da viagem. Os dias do roteiro podem ser associados a cada
            destino.
          </p>
        </section>

        {/* Tipo de viagem */}
        <div>
          <span className="mb-1.5 block text-[13px] font-semibold text-ink-700">
            Datas da viagem
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setComDatas(true)
                setErros((anteriores) => ({
                  ...anteriores,
                  dataInicio: undefined,
                  dataFim: undefined,
                }))
              }}
              className={cn(
                'flex items-center gap-2.5 rounded-2xl border px-3.5 py-3 text-left transition-colors',
                comDatas
                  ? 'border-forest-700 bg-forest-700 text-cream-50'
                  : 'border-sage-200 bg-cream-50 text-ink-600 hover:border-sage-300',
              )}
            >
              <CalendarRange size={18} className="shrink-0" />
              <span className="min-w-0">
                <span className="block text-[13px] font-semibold">
                  Com datas
                </span>
                <span
                  className={cn(
                    'block text-[11px]',
                    comDatas ? 'text-sage-200' : 'text-ink-400',
                  )}
                >
                  Informe o período
                </span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                setComDatas(false)
                setErros((anteriores) => ({
                  ...anteriores,
                  dataInicio: undefined,
                  dataFim: undefined,
                }))
              }}
              className={cn(
                'flex items-center gap-2.5 rounded-2xl border px-3.5 py-3 text-left transition-colors',
                !comDatas
                  ? 'border-forest-700 bg-forest-700 text-cream-50'
                  : 'border-sage-200 bg-cream-50 text-ink-600 hover:border-sage-300',
              )}
            >
              <CalendarX size={18} className="shrink-0" />
              <span className="min-w-0">
                <span className="block text-[13px] font-semibold">
                  Sem datas
                </span>
                <span
                  className={cn(
                    'block text-[11px]',
                    !comDatas ? 'text-sage-200' : 'text-ink-400',
                  )}
                >
                  Decido depois
                </span>
              </span>
            </button>
          </div>
        </div>

        {comDatas ? (
          <LinhaCampos>
            <Campo rotulo="Início" obrigatorio erro={erros.dataInicio}>
              <Entrada
                type="date"
                value={dataInicio}
                erro={!!erros.dataInicio}
                onChange={(e) => {
                  const valor = e.target.value
                  setDataInicio(valor)
                  validarParcialmente(valor, dataFim)
                }}
              />
            </Campo>
            <Campo rotulo="Fim" obrigatorio erro={erros.dataFim}>
              <Entrada
                type="date"
                value={dataFim}
                erro={!!erros.dataFim}
                onChange={(e) => {
                  const valor = e.target.value
                  setDataFim(valor)
                  validarParcialmente(dataInicio, valor)
                }}
              />
            </Campo>
          </LinhaCampos>
        ) : (
          <p className="rounded-2xl bg-sage-100 px-3.5 py-3 text-[12px] leading-relaxed text-ink-600">
            Sem datas, o roteiro é montado com dias identificados como{' '}
            <strong>Dia 1, Dia 2, Dia 3…</strong> Você pode definir o período
            depois, sem perder nada do que já organizou.
          </p>
        )}

        <Campo rotulo="Moeda">
          <Selecao value={moeda} onChange={(e) => setMoeda(e.target.value as Moeda)}>
            <option value="BRL">Real (R$)</option>
            <option value="USD">Dólar (US$)</option>
            <option value="EUR">Euro (€)</option>
          </Selecao>
        </Campo>

        <Campo
          rotulo="Imagem de capa"
          dica="Deixe vazio para sugerirmos uma imagem a partir do destino"
        >
          <div className="flex gap-2">
            <Entrada
              value={capa}
              placeholder="https://…"
              onChange={(e) => setCapa(e.target.value)}
            />
            <Button
              variante="creme"
              tamanho="md"
              className="shrink-0"
              icone={<Wand2 size={16} />}
              onClick={() =>
                setCapa(foto(destinoResumo || nome || 'viagem', 1600, 1000))
              }
            >
              Sugerir
            </Button>
          </div>
        </Campo>

        {/* Pré-visualização */}
        <div className="overflow-hidden rounded-3xl border border-sage-200/70 bg-cream-50">
          <img src={capaSugerida} alt="" className="h-40 w-full object-cover" />
          <div className="space-y-2 p-4">
            <div className="flex items-center gap-1.5 text-[12px] font-semibold text-sage-700">
              <Sparkles size={13} /> Pré-visualização
            </div>
            <div className="font-display text-xl text-forest-900">
              {nome || 'Nome da viagem'}
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-ink-500">
              <span className="inline-flex items-center gap-1">
                <MapPin size={13} /> {destinoResumo || 'Destino'}
              </span>
              <span className="inline-flex items-center gap-1">
                <CalendarRange size={13} />
                {comDatas
                  ? dataInicio && dataFim && dias > 0
                    ? `${formatPeriodoOpcional(dataInicio, dataFim)} · ${dias} dias`
                    : 'Período'
                  : 'Datas a definir'}
              </span>
            </div>
          </div>
        </div>

        <p className="rounded-2xl bg-sage-100 px-3.5 py-3 text-[12px] leading-relaxed text-ink-600">
          O roteiro começa com <strong>um único dia</strong>. Adicione novos
          dias conforme organiza as atividades — nada é gerado
          automaticamente.
        </p>

        <Button type="submit" bloco tamanho="lg">
          Criar viagem
        </Button>
      </form>
    </div>
  )
}
