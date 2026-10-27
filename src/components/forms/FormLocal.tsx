import { useState } from 'react'
import type { GeoStatus, ID, LocalCategoria, TripLocal } from '../../types'
import { CATEGORIA_META, LOCAL_CATEGORIAS } from '../../types'
import { useTrip } from '../../store/TripStore'
import { uid } from '../../store/tripModel'
import { foto } from '../../data/seed'
import type { Coordenada } from '../../lib/geocode'
import { validarIntervaloHorario } from '../../lib/validacao'
import { AreaTexto, Campo, Entrada, LinhaCampos, Selecao } from '../ui/Field'
import { CampoEndereco } from './CampoEndereco'
import { Button } from '../ui/Button'
import { Save } from 'lucide-react'

interface Props {
  viagemId: ID
  item?: TripLocal
  rotuloAcao?: string
  /** quando true, não renderiza o botão de salvar (fica no rodapé do modal) */
  acoesExternas?: boolean
  formId?: string
  onSalvo: (local: TripLocal) => void
}

function numeroOuUndefined(v: string): number | undefined {
  if (v.trim() === '') return undefined
  const n = Number(v.replace(',', '.'))
  return Number.isNaN(n) ? undefined : n
}

export function FormLocal({
  viagemId,
  item,
  rotuloAcao = 'Salvar local',
  acoesExternas,
  formId,
  onSalvo,
}: Props) {
  const { dispatch } = useTrip()
  const [nome, setNome] = useState(item?.nome ?? '')
  const [categoria, setCategoria] = useState<LocalCategoria>(
    item?.categoria ?? 'ponto-turistico',
  )
  const [endereco, setEndereco] = useState(item?.endereco ?? '')
  const [cidade, setCidade] = useState(item?.cidade ?? '')
  const [coords, setCoords] = useState<Coordenada | undefined>(
    item?.lat != null && item?.lng != null
      ? { lat: item.lat, lng: item.lng }
      : undefined,
  )
  const [geoStatus, setGeoStatus] = useState<GeoStatus | undefined>(item?.geoStatus)
  const [horarioPrevisto, setHorario] = useState(item?.horarioPrevisto ?? '')
  const [horarioFim, setHorarioFim] = useState(item?.horarioFim ?? '')
  const [horarioAbertura, setAbertura] = useState(item?.horarioAbertura ?? '')
  const [horarioFechamento, setFechamento] = useState(
    item?.horarioFechamento ?? '',
  )
  const [duracao, setDuracao] = useState(
    item?.duracaoMin != null ? String(item.duracaoMin) : '',
  )
  const [custo, setCusto] = useState(item?.custo != null ? String(item.custo) : '')
  const [observacoes, setObservacoes] = useState(item?.observacoes ?? '')
  const [erroNome, setErroNome] = useState<string>()
  const [erroHorario, setErroHorario] = useState<string>()
  const [erroFuncionamento, setErroFuncionamento] = useState<string>()

  function salvar() {
    if (!nome.trim()) {
      setErroNome('Informe o nome do local')
      return
    }
    const problemaHorario = validarIntervaloHorario(horarioPrevisto, horarioFim)
    if (problemaHorario) {
      setErroHorario(problemaHorario)
      return
    }
    const problemaFuncionamento = validarIntervaloHorario(
      horarioAbertura,
      horarioFechamento,
    )
    if (problemaFuncionamento) {
      setErroFuncionamento(problemaFuncionamento)
      return
    }
    const local: TripLocal = {
      id: item?.id ?? uid('l'),
      viagemId,
      nome: nome.trim(),
      categoria,
      endereco: endereco.trim() || undefined,
      cidade: cidade.trim() || undefined,
      horarioPrevisto: horarioPrevisto || undefined,
      horarioFim: horarioFim || undefined,
      horarioAbertura: horarioAbertura || undefined,
      horarioFechamento: horarioFechamento || undefined,
      duracaoMin: numeroOuUndefined(duracao),
      custo: numeroOuUndefined(custo),
      observacoes: observacoes.trim() || undefined,
      fotoUrl: item?.fotoUrl ?? foto(nome.trim() || 'local', 900, 700),
      lat: coords?.lat,
      lng: coords?.lng,
      geoStatus: coords ? geoStatus : undefined,
    }
    if (item) dispatch({ type: 'UPDATE_LOCAL', id: item.id, patch: local })
    else dispatch({ type: 'ADD_LOCAL', local })
    onSalvo(local)
  }

  return (
    <form
      id={formId}
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault()
        salvar()
      }}
    >
      <div className="space-y-4">
        <Campo rotulo="Nome do local" obrigatorio erro={erroNome}>
          <Entrada
            value={nome}
            erro={!!erroNome}
            placeholder="Ex.: Lago Negro"
            onChange={(e) => {
              setNome(e.target.value)
              if (erroNome) setErroNome(undefined)
            }}
          />
        </Campo>

        <Campo rotulo="Categoria" obrigatorio>
          <Selecao
            value={categoria}
            onChange={(e) => setCategoria(e.target.value as LocalCategoria)}
          >
            {LOCAL_CATEGORIAS.map((c) => (
              <option key={c} value={c}>
                {CATEGORIA_META[c].emoji} {CATEGORIA_META[c].rotulo}
              </option>
            ))}
          </Selecao>
        </Campo>
      </div>

      <fieldset className="space-y-4 rounded-3xl border border-sage-200/70 bg-cream-50/60 p-4">
        <legend className="px-1 text-[12px] font-bold uppercase tracking-wide text-ink-400">
          Localização
        </legend>
        <CampoEndereco
          endereco={endereco}
          cidade={cidade}
          coords={coords}
          geoStatus={geoStatus}
          onEnderecoChange={setEndereco}
          onCidadeChange={setCidade}
          onCoordsChange={(c, status) => {
            setCoords(c)
            setGeoStatus(status)
          }}
        />
      </fieldset>

      <fieldset className="space-y-4 rounded-3xl border border-sage-200/70 bg-cream-50/60 p-4">
        <legend className="px-1 text-[12px] font-bold uppercase tracking-wide text-ink-400">
          Estimativas
        </legend>
        <LinhaCampos>
          <Campo rotulo="Início previsto" dica="Sugerido ao organizar no roteiro">
            <Entrada
              type="time"
              value={horarioPrevisto}
              erro={!!erroHorario}
              onChange={(e) => {
                setHorario(e.target.value)
                setErroHorario(undefined)
              }}
            />
          </Campo>
          <Campo rotulo="Fim previsto" erro={erroHorario}>
            <Entrada
              type="time"
              value={horarioFim}
              erro={!!erroHorario}
              onChange={(e) => {
                setHorarioFim(e.target.value)
                setErroHorario(undefined)
              }}
            />
          </Campo>
        </LinhaCampos>
        <LinhaCampos>
          <Campo rotulo="Duração estimada (min)">
            <Entrada
              type="number"
              min={0}
              inputMode="numeric"
              value={duracao}
              placeholder="90"
              onChange={(e) => setDuracao(e.target.value)}
            />
          </Campo>
          <Campo rotulo="Custo (R$)">
            <Entrada
              type="number"
              min={0}
              inputMode="decimal"
              value={custo}
              placeholder="0"
              onChange={(e) => setCusto(e.target.value)}
            />
          </Campo>
        </LinhaCampos>
      </fieldset>

      <fieldset className="space-y-4 rounded-3xl border border-sage-200/70 bg-cream-50/60 p-4">
        <legend className="px-1 text-[12px] font-bold uppercase tracking-wide text-ink-400">
          Funcionamento
        </legend>
        <LinhaCampos>
          <Campo rotulo="Abre às">
            <Entrada
              type="time"
              value={horarioAbertura}
              erro={!!erroFuncionamento}
              onChange={(e) => {
                setAbertura(e.target.value)
                setErroFuncionamento(undefined)
              }}
            />
          </Campo>
          <Campo rotulo="Fecha às" erro={erroFuncionamento}>
            <Entrada
              type="time"
              value={horarioFechamento}
              erro={!!erroFuncionamento}
              onChange={(e) => {
                setFechamento(e.target.value)
                setErroFuncionamento(undefined)
              }}
            />
          </Campo>
        </LinhaCampos>
        <p className="text-[12px] leading-relaxed text-ink-500">
          Usado pela sugestão de roteiro para evitar visitas fora do horário de
          funcionamento.
        </p>
      </fieldset>

      <Campo rotulo="Observações">
        <AreaTexto
          value={observacoes}
          placeholder="Dicas, reservas, o que levar…"
          onChange={(e) => setObservacoes(e.target.value)}
        />
      </Campo>

      <p className="rounded-2xl bg-sage-100 px-3.5 py-3 text-[12px] leading-relaxed text-ink-600">
        A <strong>data</strong> e o <strong>dia do roteiro</strong> não são
        definidos aqui — isso acontece na etapa de organização do roteiro.
      </p>

      {acoesExternas ? null : (
        <Button
          type="submit"
          bloco
          tamanho="lg"
          icone={<Save size={17} />}
          className="mt-1"
        >
          {rotuloAcao}
        </Button>
      )}
    </form>
  )
}
