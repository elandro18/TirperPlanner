import { useState } from 'react'
import {
  AlertTriangle,
  FileUp,
  Loader2,
  RotateCcw,
  Save,
  Upload,
} from 'lucide-react'
import type { ID, TripPassagem } from '../../types'
import { useTrip } from '../../store/TripStore'
import { formatDataHora } from '../../lib/format'
import {
  hashArquivo,
  validarArquivo,
  type TipoDocumento,
} from '../../lib/importacao/arquivo'
import { extrairDocumento } from '../../lib/importacao'
import { encontrarPassagemDuplicada } from '../../lib/importacao/duplicata'
import { parsePassagem } from '../../lib/importacao/parser'
import { Sheet } from '../ui/Sheet'
import { Button } from '../ui/Button'
import { FormPassagem } from '../forms/FormPassagem'

interface Props {
  viagemId: ID
  aberto: boolean
  aoFechar: () => void
  onSalvo?: (passagem: TripPassagem) => void
}

type Etapa = 'arquivo' | 'extraindo' | 'revisao' | 'duplicada'

const FORM_ID = 'form-importar-passagem'

export function ImportarPassagemSheet({
  viagemId,
  aberto,
  aoFechar,
  onSalvo,
}: Props) {
  const { state } = useTrip()
  const [etapa, setEtapa] = useState<Etapa>('arquivo')
  const [erro, setErro] = useState<string>()
  const [dados, setDados] = useState<Partial<TripPassagem>>({})
  const [faltando, setFaltando] = useState<string[]>([])
  const [hash, setHash] = useState<string>()
  const [tipo, setTipo] = useState<TipoDocumento>()
  const [duplicada, setDuplicada] = useState<TripPassagem>()
  const [nomeArquivo, setNomeArquivo] = useState<string>()
  const [chave, setChave] = useState(0)

  if (!aberto) return null

  async function processar(file: File) {
    setErro(undefined)
    const problema = validarArquivo(file)
    if (problema) {
      setErro(problema)
      return
    }

    setNomeArquivo(file.name)
    setEtapa('extraindo')

    try {
      const { texto, tipo: tipoDocumento } = await extrairDocumento(file)
      const resultado = parsePassagem(texto)
      const documentoHash = await hashArquivo(file)

      setDados(resultado.campos)
      setFaltando(resultado.faltando)
      setHash(documentoHash)
      setTipo(tipoDocumento)

      const existente = encontrarPassagemDuplicada(
        state.passagens,
        documentoHash,
        resultado.campos,
      )

      if (existente) {
        setDuplicada(existente)
        setEtapa('duplicada')
      } else {
        setChave((k) => k + 1)
        setEtapa('revisao')
      }
    } catch (e) {
      setErro(
        e instanceof Error
          ? e.message
          : 'Não foi possível ler o documento. Tente novamente ou cadastre manualmente.',
      )
      setEtapa('arquivo')
    }
  }

  function reiniciar() {
    setEtapa('arquivo')
    setErro(undefined)
    setDados({})
    setFaltando([])
    setHash(undefined)
    setTipo(undefined)
    setDuplicada(undefined)
    setNomeArquivo(undefined)
  }

  function aoSalvar(passagem: TripPassagem) {
    onSalvo?.(passagem)
    aoFechar()
  }

  const rodape =
    etapa === 'revisao' ? (
      <div className="flex flex-col gap-2.5 sm:flex-row sm:justify-end">
        <Button variante="creme" bloco className="sm:w-auto" onClick={aoFechar}>
          Cancelar
        </Button>
        <Button
          bloco
          className="sm:w-auto"
          type="submit"
          form={FORM_ID}
          icone={<Save size={16} />}
        >
          Salvar passagem
        </Button>
      </div>
    ) : etapa === 'duplicada' ? (
      <div className="flex flex-col gap-2.5 sm:flex-row sm:justify-end">
        <Button
          variante="creme"
          bloco
          className="sm:w-auto"
          onClick={aoFechar}
        >
          Cancelar
        </Button>
        <Button
          bloco
          className="sm:w-auto"
          onClick={() => {
            setChave((k) => k + 1)
            setEtapa('revisao')
          }}
        >
          Continuar mesmo assim
        </Button>
      </div>
    ) : (
      <Button variante="creme" bloco onClick={aoFechar}>
        Cancelar
      </Button>
    )

  return (
    <Sheet
      aberto={aberto}
      aoFechar={aoFechar}
      largura="lg"
      titulo="Importar passagem"
      subtitulo="PDF, imagem ou preenchimento manual — nada é salvo sem sua confirmação."
      rodape={rodape}
    >
      {etapa === 'arquivo' ? (
        <div className="space-y-5">
          <div className="rounded-3xl border border-dashed border-sage-300 bg-cream-50 p-6 text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-sage-100 text-forest-700">
              <FileUp size={22} />
            </span>
            <h3 className="mt-3 text-lg">Envie o comprovante</h3>
            <p className="mx-auto mt-1 max-w-md text-[13px] leading-relaxed text-ink-500">
              PDF, JPG, PNG ou WEBP, até 10 MB. O arquivo é processado no
              navegador e não é armazenado.
            </p>

            <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-full bg-forest-700 px-4 py-2.5 text-[13px] font-semibold text-cream-50 transition-colors hover:bg-forest-800">
              <Upload size={16} />
              Escolher arquivo
              <input
                type="file"
                accept=".pdf,image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  e.target.value = ''
                  if (file) void processar(file)
                }}
              />
            </label>

            {nomeArquivo ? (
              <p className="mt-3 text-[12px] text-ink-400">{nomeArquivo}</p>
            ) : null}
          </div>

          {erro ? (
            <p className="flex items-start gap-2 rounded-2xl bg-clay-100 px-3.5 py-2.5 text-[12px] font-semibold leading-relaxed text-clay-700">
              <AlertTriangle size={15} className="mt-0.5 shrink-0" />
              {erro}
            </p>
          ) : null}

          <p className="rounded-2xl bg-sage-100 px-3.5 py-3 text-[12px] leading-relaxed text-ink-600">
            Não conseguiu importar? Feche esta janela e use o cadastro manual.
            A importação por e-mail está documentada como evolução futura.
          </p>
        </div>
      ) : etapa === 'extraindo' ? (
        <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
          <Loader2 size={28} className="animate-spin text-forest-700" />
          <p className="text-[14px] font-semibold text-forest-900">
            Lendo o documento…
          </p>
          <p className="max-w-sm text-[12px] leading-relaxed text-ink-500">
            A extração de texto e o OCR podem levar alguns segundos. Nenhum dado
            é enviado para servidores.
          </p>
        </div>
      ) : etapa === 'duplicada' && duplicada ? (
        <div className="space-y-4">
          <p className="flex items-start gap-2 rounded-2xl bg-clay-100 px-3.5 py-3 text-[13px] font-semibold leading-relaxed text-clay-700">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            Este comprovante parece já ter sido importado. Para evitar
            duplicidade, confira o registro existente antes de continuar.
          </p>

          <div className="rounded-3xl border border-sage-200/70 bg-cream-50 p-4">
            <h3 className="text-[13px] font-bold uppercase tracking-wide text-ink-400">
              Passagem existente
            </h3>
            <p className="mt-2 font-display text-lg text-forest-900">
              {duplicada.origem} → {duplicada.destino}
            </p>
            <p className="mt-1 text-[13px] text-ink-600">
              {formatDataHora(duplicada.partida)}
              {duplicada.localizador ? ` · ${duplicada.localizador}` : ''}
              {duplicada.numeroBilhete ? ` · bilhete ${duplicada.numeroBilhete}` : ''}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[12px] font-semibold text-ink-500">
              {nomeArquivo ?? 'Documento importado'} · revise e confirme
            </p>
            <button
              type="button"
              onClick={reiniciar}
              className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-forest-700 transition-colors hover:text-forest-900"
            >
              <RotateCcw size={13} /> Escolher outro arquivo
            </button>
          </div>

          {faltando.length ? (
            <p className="flex items-start gap-2 rounded-2xl bg-clay-100 px-3.5 py-2.5 text-[12px] font-semibold leading-relaxed text-clay-700">
              <AlertTriangle size={15} className="mt-0.5 shrink-0" />
              Não identificamos: {faltando.join(', ')}. Corrija os campos
              obrigatórios antes de salvar.
            </p>
          ) : null}

          <FormPassagem
            key={chave}
            viagemId={viagemId}
            valoresIniciais={dados}
            metadados={{ documentoHash: hash, importadoDe: tipo }}
            acoesExternas
            formId={FORM_ID}
            onSalvo={aoSalvar}
          />
        </div>
      )}
    </Sheet>
  )
}
