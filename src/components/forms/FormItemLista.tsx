import { useState } from 'react'
import { ChevronDown, Image as ImageIcon, MapPin, Save, Utensils } from 'lucide-react'
import type { TripListaItem } from '../../types'
import { LISTA_TIPOS_SUGERIDOS } from '../../types'
import { linkOpenStreetMap } from '../../lib/geocode'
import {
  parseValorMonetario,
  validarUrlImagem,
} from '../../lib/validacao'
import { AreaTexto, Campo, Entrada, LinhaCampos } from '../ui/Field'
import { Button } from '../ui/Button'
import { cn } from '../../lib/cn'

export interface DadosItemLista {
  nome: string
  tipo?: string
  valorPrevisto?: number
  fotoUrl?: string
  refeicao: boolean
  endereco?: string
  cidade?: string
  lat?: number
  lng?: number
  fotoPratoUrl?: string
  fotoLocalUrl?: string
  observacoes?: string
}

function numeroOuUndefined(valor: string): number | undefined {
  if (!valor.trim()) return undefined
  const numero = Number(valor.replace(',', '.'))
  return Number.isFinite(numero) ? numero : undefined
}

interface Props {
  item?: TripListaItem
  onSalvar: (dados: DadosItemLista) => void
  onCancelar?: () => void
  rotuloAcao?: string
}

export function FormItemLista({
  item,
  onSalvar,
  onCancelar,
  rotuloAcao = 'Adicionar item',
}: Props) {
  const [nome, setNome] = useState(item?.nome ?? '')
  const [tipo, setTipo] = useState(item?.tipo ?? '')
  const [valor, setValor] = useState(
    item?.valorPrevisto != null
      ? String(item.valorPrevisto)
      : item?.valor != null
        ? String(item.valor)
        : '',
  )
  const [fotoUrl, setFotoUrl] = useState(item?.fotoUrl ?? '')
  const [refeicao, setRefeicao] = useState(item?.refeicao ?? false)
  const [endereco, setEndereco] = useState(item?.endereco ?? '')
  const [cidade, setCidade] = useState(item?.cidade ?? '')
  const [lat, setLat] = useState(item?.lat != null ? String(item.lat) : '')
  const [lng, setLng] = useState(item?.lng != null ? String(item.lng) : '')
  const [fotoPratoUrl, setFotoPratoUrl] = useState(item?.fotoPratoUrl ?? '')
  const [fotoLocalUrl, setFotoLocalUrl] = useState(item?.fotoLocalUrl ?? '')
  const [observacoes, setObservacoes] = useState(item?.observacoes ?? '')
  const [detalhes, setDetalhes] = useState(
    !!(
      item?.fotoUrl ||
      item?.refeicao ||
      item?.endereco ||
      item?.cidade ||
      item?.observacoes
    ),
  )
  const [erros, setErros] = useState<Record<string, string | undefined>>({})

  const latNumero = numeroOuUndefined(lat)
  const lngNumero = numeroOuUndefined(lng)

  const mapa = refeicao
    ? linkOpenStreetMap({
        endereco,
        cidade,
        lat: latNumero,
        lng: lngNumero,
      })
    : null

  function salvar() {
    const e: Record<string, string | undefined> = {}
    if (!nome.trim()) e.nome = 'Informe o nome do item'

    const valorConvertido = parseValorMonetario(valor)
    if (valorConvertido === 'erro') {
      e.valor = 'Informe um valor monetário válido'
    }

    const erroFoto = validarUrlImagem(fotoUrl)
    if (erroFoto) e.fotoUrl = erroFoto

    if (refeicao) {
      if ((latNumero == null) !== (lngNumero == null)) {
        e.coordenadas = 'Informe latitude e longitude juntas'
      } else if (
        (latNumero != null && (latNumero < -90 || latNumero > 90)) ||
        (lngNumero != null && (lngNumero < -180 || lngNumero > 180))
      ) {
        e.coordenadas = 'Latitude deve estar entre -90 e 90 e longitude entre -180 e 180'
      }

      const erroPrato = validarUrlImagem(fotoPratoUrl)
      if (erroPrato) e.fotoPratoUrl = erroPrato
      const erroLocal = validarUrlImagem(fotoLocalUrl)
      if (erroLocal) e.fotoLocalUrl = erroLocal
    }

    setErros(e)
    if (Object.keys(e).length) return

    onSalvar({
      nome: nome.trim(),
      tipo: tipo.trim() || undefined,
      valorPrevisto: valorConvertido === 'erro' ? undefined : valorConvertido,
      fotoUrl: fotoUrl.trim() || undefined,
      refeicao,
      endereco: refeicao ? endereco.trim() || undefined : undefined,
      cidade: refeicao ? cidade.trim() || undefined : undefined,
      lat: refeicao ? latNumero : undefined,
      lng: refeicao ? lngNumero : undefined,
      fotoPratoUrl: refeicao ? fotoPratoUrl.trim() || undefined : undefined,
      fotoLocalUrl: refeicao ? fotoLocalUrl.trim() || undefined : undefined,
      observacoes: observacoes.trim() || undefined,
    })
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-[1.4fr_1fr_0.7fr]">
        <Entrada
          value={nome}
          erro={!!erros.nome}
          placeholder="Nome do item *"
          aria-label="Nome do item"
          onChange={(e) => {
            setNome(e.target.value)
            if (erros.nome) setErros((x) => ({ ...x, nome: undefined }))
          }}
        />
        <Entrada
          value={tipo}
          list="tipos-item"
          placeholder="Tipo (livre)"
          aria-label="Tipo do item"
          onChange={(e) => setTipo(e.target.value)}
        />
        <Entrada
          type="number"
          min={0}
          inputMode="decimal"
          value={valor}
          erro={!!erros.valor}
          placeholder="Valor previsto"
          aria-label="Valor previsto do item"
          onChange={(e) => {
            setValor(e.target.value)
            if (erros.valor) setErros((x) => ({ ...x, valor: undefined }))
          }}
        />
        <datalist id="tipos-item">
          {LISTA_TIPOS_SUGERIDOS.map((t) => (
            <option key={t} value={t} />
          ))}
        </datalist>
      </div>

      <button
        type="button"
        onClick={() => setDetalhes((v) => !v)}
        aria-expanded={detalhes}
        className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-forest-700 transition-colors hover:text-forest-900"
      >
        <ChevronDown
          size={14}
          className={cn('transition-transform', detalhes && 'rotate-180')}
        />
        Foto, endereço e detalhes
      </button>

      {detalhes ? (
        <div className="space-y-3 rounded-2xl border border-sage-200/70 bg-cream-100/60 p-3">
          <Campo
            rotulo="URL da foto"
            dica="Use um link público http(s) da imagem"
            erro={erros.fotoUrl}
          >
            <Entrada
              value={fotoUrl}
              erro={!!erros.fotoUrl}
              placeholder="https://…/foto.jpg"
              onChange={(e) => {
                setFotoUrl(e.target.value)
                if (erros.fotoUrl) setErros((x) => ({ ...x, fotoUrl: undefined }))
              }}
            />
            <PreviaImagem url={fotoUrl} onRemover={() => setFotoUrl('')} />
          </Campo>

          <label className="flex cursor-pointer items-center gap-2 rounded-2xl border border-sage-200 bg-cream-50 px-3 py-2.5 text-[13px] font-semibold text-ink-700">
            <input
              type="checkbox"
              checked={refeicao}
              onChange={(e) => setRefeicao(e.target.checked)}
              className="h-4 w-4 accent-forest-700"
            />
            <Utensils size={15} className="text-forest-700" />
            Refeição / restaurante
          </label>

          {refeicao ? (
            <>
              <LinhaCampos>
                <Campo rotulo="Endereço">
                  <Entrada
                    value={endereco}
                    placeholder="Rua, número, bairro"
                    onChange={(e) => setEndereco(e.target.value)}
                  />
                </Campo>
                <Campo rotulo="Cidade">
                  <Entrada
                    value={cidade}
                    placeholder="Ex.: Lisboa"
                    onChange={(e) => setCidade(e.target.value)}
                  />
                </Campo>
              </LinhaCampos>

              <LinhaCampos>
                <Campo
                  rotulo="Latitude"
                  dica="Opcional — ex.: -29.3785"
                  erro={erros.coordenadas}
                >
                  <Entrada
                    type="number"
                    step="any"
                    inputMode="decimal"
                    value={lat}
                    erro={!!erros.coordenadas}
                    placeholder="-29.3785"
                    onChange={(e) => {
                      setLat(e.target.value)
                      if (erros.coordenadas)
                        setErros((x) => ({ ...x, coordenadas: undefined }))
                    }}
                  />
                </Campo>
                <Campo rotulo="Longitude" dica="Opcional — ex.: -50.8727">
                  <Entrada
                    type="number"
                    step="any"
                    inputMode="decimal"
                    value={lng}
                    erro={!!erros.coordenadas}
                    placeholder="-50.8727"
                    onChange={(e) => {
                      setLng(e.target.value)
                      if (erros.coordenadas)
                        setErros((x) => ({ ...x, coordenadas: undefined }))
                    }}
                  />
                </Campo>
              </LinhaCampos>

              {mapa ? (
                <a
                  href={mapa}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-sage-200 bg-cream-50 px-3 py-1.5 text-[12px] font-semibold text-forest-700 transition-colors hover:bg-sage-100"
                >
                  <MapPin size={13} /> Abrir endereço no mapa
                </a>
              ) : null}

              <Campo
                rotulo="Foto do prato"
                dica="Link público da imagem"
                erro={erros.fotoPratoUrl}
              >
                <Entrada
                  value={fotoPratoUrl}
                  erro={!!erros.fotoPratoUrl}
                  placeholder="https://…/prato.jpg"
                  onChange={(e) => {
                    setFotoPratoUrl(e.target.value)
                    if (erros.fotoPratoUrl)
                      setErros((x) => ({ ...x, fotoPratoUrl: undefined }))
                  }}
                />
                <PreviaImagem
                  url={fotoPratoUrl}
                  onRemover={() => setFotoPratoUrl('')}
                />
              </Campo>

              <Campo
                rotulo="Foto do restaurante"
                dica="Link público da imagem"
                erro={erros.fotoLocalUrl}
              >
                <Entrada
                  value={fotoLocalUrl}
                  erro={!!erros.fotoLocalUrl}
                  placeholder="https://…/restaurante.jpg"
                  onChange={(e) => {
                    setFotoLocalUrl(e.target.value)
                    if (erros.fotoLocalUrl)
                      setErros((x) => ({ ...x, fotoLocalUrl: undefined }))
                  }}
                />
                <PreviaImagem
                  url={fotoLocalUrl}
                  onRemover={() => setFotoLocalUrl('')}
                />
              </Campo>
            </>
          ) : null}

          <Campo rotulo="Observações">
            <AreaTexto
              value={observacoes}
              placeholder="Reserva, horário, dicas…"
              onChange={(e) => setObservacoes(e.target.value)}
            />
          </Campo>
        </div>
      ) : null}

      {erros.nome || erros.valor ? (
        <p className="text-[12px] font-semibold text-clay-700">
          {erros.nome ?? erros.valor}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {onCancelar ? (
          <Button tamanho="sm" variante="creme" onClick={onCancelar}>
            Cancelar
          </Button>
        ) : null}
        <Button tamanho="sm" icone={<Save size={15} />} onClick={salvar}>
          {rotuloAcao}
        </Button>
      </div>
    </div>
  )
}

function PreviaImagem({
  url,
  onRemover,
}: {
  url: string
  onRemover: () => void
}) {
  const [urlComErro, setUrlComErro] = useState<string | null>(null)
  if (!url.trim()) return null

  const falhou = urlComErro === url

  return (
    <div className="mt-2 flex items-center gap-2 rounded-2xl border border-sage-200 bg-cream-50 p-2">
      {falhou ? (
        <span className="flex items-center gap-1.5 text-[12px] font-medium text-clay-700">
          <ImageIcon size={14} /> Não foi possível carregar esta imagem.
        </span>
      ) : (
        <img
          src={url}
          alt=""
          className="h-16 w-16 rounded-xl object-cover"
          onError={() => setUrlComErro(url)}
        />
      )}
      <button
        type="button"
        onClick={onRemover}
        className="text-[12px] font-semibold text-ink-500 underline-offset-2 hover:text-clay-700 hover:underline"
      >
        Remover
      </button>
    </div>
  )
}
