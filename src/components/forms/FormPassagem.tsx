import { useState } from 'react'
import { Save } from 'lucide-react'
import type { ID, Moeda, TransporteTipo, TripPassagem } from '../../types'
import {
  TRANSPORTE_META,
  TRANSPORTE_TIPOS,
} from '../../types'
import { useTrip } from '../../store/TripStore'
import { uid } from '../../store/tripModel'
import { Campo, Entrada, LinhaCampos, Selecao } from '../ui/Field'
import { Button } from '../ui/Button'
import { cn } from '../../lib/cn'

interface Props {
  viagemId: ID
  item?: TripPassagem
  valoresIniciais?: Partial<TripPassagem>
  metadados?: {
    documentoHash?: string
    importadoDe?: TripPassagem['importadoDe']
  }
  rotuloAcao?: string
  /** quando true, não renderiza o botão de salvar (fica no rodapé do modal) */
  acoesExternas?: boolean
  formId?: string
  onSalvo: (passagem: TripPassagem) => void
}

const paraInput = (iso?: string) => (iso ? iso.slice(0, 16) : '')
const paraISO = (v: string) => (v && v.length === 16 ? `${v}:00` : v)

export function FormPassagem({
  viagemId,
  item,
  valoresIniciais,
  metadados,
  rotuloAcao = 'Salvar passagem',
  acoesExternas,
  formId,
  onSalvo,
}: Props) {
  const { dispatch } = useTrip()
  const inicial = item ?? valoresIniciais

  const [tipo, setTipo] = useState<TransporteTipo>(inicial?.tipo ?? 'aviao')
  const [origem, setOrigem] = useState(inicial?.origem ?? '')
  const [destino, setDestino] = useState(inicial?.destino ?? '')
  const [partida, setPartida] = useState(paraInput(inicial?.partida))
  const [chegada, setChegada] = useState(paraInput(inicial?.chegada))
  const [companhia, setCompanhia] = useState(inicial?.companhia ?? '')
  const [localizador, setLocalizador] = useState(inicial?.localizador ?? '')
  const [numeroBilhete, setNumeroBilhete] = useState(
    inicial?.numeroBilhete ?? '',
  )
  const [numeroVoo, setNumeroVoo] = useState(inicial?.numeroVoo ?? '')
  const [passageiro, setPassageiro] = useState(inicial?.passageiro ?? '')
  const [classe, setClasse] = useState(inicial?.classe ?? '')
  const [terminal, setTerminal] = useState(inicial?.terminal ?? '')
  const [assento, setAssento] = useState(inicial?.assento ?? '')
  const [moeda, setMoeda] = useState<Moeda>(inicial?.moeda ?? 'BRL')
  const [valor, setValor] = useState(
    inicial?.valor != null ? String(inicial.valor) : '',
  )
  const [erros, setErros] = useState<Record<string, string>>({})

  function salvar() {
    const novos: Record<string, string> = {}
    if (!origem.trim()) novos.origem = 'Informe a origem'
    if (!destino.trim()) novos.destino = 'Informe o destino'
    if (!partida) novos.partida = 'Informe a data e hora de partida'

    const valorNumero =
      valor.trim() === '' ? undefined : Number(valor.replace(',', '.'))
    if (valorNumero != null && (!Number.isFinite(valorNumero) || valorNumero < 0)) {
      novos.valor = 'Informe um valor válido'
    }

    setErros(novos)
    if (Object.keys(novos).length) return

    const passagem: TripPassagem = {
      id: item?.id ?? uid('p'),
      viagemId,
      tipo,
      origem: origem.trim(),
      destino: destino.trim(),
      partida: paraISO(partida),
      chegada: chegada ? paraISO(chegada) : undefined,
      companhia: companhia.trim() || undefined,
      localizador: localizador.trim() || undefined,
      numeroBilhete: numeroBilhete.trim() || undefined,
      numeroVoo: numeroVoo.trim() || undefined,
      passageiro: passageiro.trim() || undefined,
      classe: classe.trim() || undefined,
      terminal: terminal.trim() || undefined,
      assento: assento.trim() || undefined,
      moeda,
      valor: valorNumero,
      documentoHash: metadados?.documentoHash ?? item?.documentoHash,
      importadoDe:
        metadados?.importadoDe ?? item?.importadoDe ?? 'manual',
    }
    if (item) dispatch({ type: 'UPDATE_PASSAGEM', id: item.id, patch: passagem })
    else dispatch({ type: 'ADD_PASSAGEM', passagem })
    onSalvo(passagem)
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
      <div>
        <span className="mb-1.5 block text-[13px] font-semibold text-ink-700">
          Tipo de transporte <span className="text-clay-600">*</span>
        </span>
        <div className="grid grid-cols-3 gap-2">
          {TRANSPORTE_TIPOS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTipo(t)}
              className={cn(
                'flex flex-col items-center gap-1 rounded-2xl border px-2 py-3 text-[13px] font-semibold transition-colors',
                tipo === t
                  ? 'border-forest-700 bg-forest-700 text-cream-50'
                  : 'border-sage-200 bg-cream-50 text-ink-600 hover:border-sage-300',
              )}
            >
              <span className="text-lg" aria-hidden>
                {TRANSPORTE_META[t].emoji}
              </span>
              {TRANSPORTE_META[t].rotulo}
            </button>
          ))}
        </div>
      </div>

      <LinhaCampos>
        <Campo rotulo="Origem" obrigatorio erro={erros.origem}>
          <Entrada
            value={origem}
            erro={!!erros.origem}
            placeholder="Ex.: São Paulo (GRU)"
            onChange={(e) => setOrigem(e.target.value)}
          />
        </Campo>
        <Campo rotulo="Destino" obrigatorio erro={erros.destino}>
          <Entrada
            value={destino}
            erro={!!erros.destino}
            placeholder="Ex.: Porto Alegre (POA)"
            onChange={(e) => setDestino(e.target.value)}
          />
        </Campo>
      </LinhaCampos>

      <LinhaCampos>
        <Campo rotulo="Partida" obrigatorio erro={erros.partida}>
          <Entrada
            type="datetime-local"
            value={partida}
            erro={!!erros.partida}
            onChange={(e) => setPartida(e.target.value)}
          />
        </Campo>
        <Campo rotulo="Chegada">
          <Entrada
            type="datetime-local"
            value={chegada}
            onChange={(e) => setChegada(e.target.value)}
          />
        </Campo>
      </LinhaCampos>

      <LinhaCampos>
        <Campo rotulo="Companhia / operadora">
          <Entrada
            value={companhia}
            placeholder="Ex.: Exemplo Air"
            onChange={(e) => setCompanhia(e.target.value)}
          />
        </Campo>
        <Campo rotulo="Localizador">
          <Entrada
            value={localizador}
            placeholder="Código da reserva"
            onChange={(e) => setLocalizador(e.target.value)}
          />
        </Campo>
      </LinhaCampos>

      <fieldset className="space-y-4 rounded-3xl border border-sage-200/70 bg-cream-50/60 p-4">
        <legend className="px-1 text-[12px] font-bold uppercase tracking-wide text-ink-400">
          Bilhete
        </legend>

        <LinhaCampos>
          <Campo rotulo="Passageiro">
            <Entrada
              value={passageiro}
              placeholder="Nome no bilhete"
              onChange={(e) => setPassageiro(e.target.value)}
            />
          </Campo>
          <Campo rotulo="Número do bilhete">
            <Entrada
              value={numeroBilhete}
              inputMode="numeric"
              placeholder="Ex.: 1234567890123"
              onChange={(e) => setNumeroBilhete(e.target.value)}
            />
          </Campo>
        </LinhaCampos>

        <LinhaCampos>
          <Campo rotulo="Voo / transporte">
            <Entrada
              value={numeroVoo}
              placeholder="Ex.: EA 1234"
              onChange={(e) => setNumeroVoo(e.target.value)}
            />
          </Campo>
          <Campo rotulo="Classe">
            <Entrada
              value={classe}
              placeholder="Econômica, executiva…"
              onChange={(e) => setClasse(e.target.value)}
            />
          </Campo>
        </LinhaCampos>

        <LinhaCampos>
          <Campo rotulo="Terminal / aeroporto">
            <Entrada
              value={terminal}
              placeholder="Ex.: Terminal 2"
              onChange={(e) => setTerminal(e.target.value)}
            />
          </Campo>
          <Campo rotulo="Assento">
            <Entrada
              value={assento}
              placeholder="Ex.: 14A"
              onChange={(e) => setAssento(e.target.value)}
            />
          </Campo>
        </LinhaCampos>

        <LinhaCampos>
          <Campo rotulo="Moeda">
            <Selecao
              value={moeda}
              onChange={(e) => setMoeda(e.target.value as Moeda)}
            >
              <option value="BRL">Real (R$)</option>
              <option value="USD">Dólar (US$)</option>
              <option value="EUR">Euro (€)</option>
            </Selecao>
          </Campo>
          <Campo rotulo="Valor" erro={erros.valor}>
            <Entrada
              type="number"
              min={0}
              inputMode="decimal"
              value={valor}
              erro={!!erros.valor}
              placeholder="0"
              onChange={(e) => {
                setValor(e.target.value)
                if (erros.valor) {
                  setErros((anteriores) => ({ ...anteriores, valor: '' }))
                }
              }}
            />
          </Campo>
        </LinhaCampos>
      </fieldset>

      <p className="rounded-2xl bg-sage-100 px-3.5 py-3 text-[12px] leading-relaxed text-ink-600">
        Os dados ficam neste dispositivo. Revise as informações extraídas do
        comprovante antes de salvar e não compartilhe números de bilhete em
        canais públicos.
      </p>

      {acoesExternas ? null : (
        <Button type="submit" bloco tamanho="lg" icone={<Save size={17} />}>
          {rotuloAcao}
        </Button>
      )}
    </form>
  )
}
