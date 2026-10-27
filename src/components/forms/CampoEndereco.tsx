import { useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Loader2,
  MapPin,
  Search,
  Unlink,
} from 'lucide-react'
import type { GeoStatus } from '../../types'
import {
  buscarEnderecos,
  linkOpenStreetMap,
  type Coordenada,
  type SugestaoEndereco,
} from '../../lib/geocode'
import { coordAproximada } from '../../lib/geo'
import { Entrada } from '../ui/Field'
import { Button } from '../ui/Button'

interface Props {
  endereco: string
  cidade: string
  coords?: Coordenada
  geoStatus?: GeoStatus
  erroEndereco?: string
  onEnderecoChange: (valor: string) => void
  onCidadeChange: (valor: string) => void
  onCoordsChange: (coords: Coordenada | undefined, status?: GeoStatus) => void
}

/**
 * Campo de endereço com sugestões do serviço de mapas e confirmação explícita
 * da localização. Reutilizado por hotéis e locais.
 */
export function CampoEndereco({
  endereco,
  cidade,
  coords,
  geoStatus,
  erroEndereco,
  onEnderecoChange,
  onCidadeChange,
  onCoordsChange,
}: Props) {
  const [sugestoes, setSugestoes] = useState<SugestaoEndereco[]>([])
  const [buscando, setBuscando] = useState(false)
  const [erro, setErro] = useState<string>()

  const mapa = linkOpenStreetMap({ ...coords, endereco, cidade })

  async function buscar() {
    setErro(undefined)
    setSugestoes([])
    const consulta = [endereco, cidade].filter(Boolean).join(', ')
    if (consulta.trim().length < 3) {
      setErro('Informe o endereço e a cidade para localizar.')
      return
    }
    setBuscando(true)
    try {
      const resultados = await buscarEnderecos(consulta)
      setSugestoes(resultados)
      if (!resultados.length) {
        setErro(
          'Não encontramos este endereço. Corrija os campos e tente novamente — ou informe a localização aproximada.',
        )
      }
    } catch (e) {
      setErro(
        e instanceof Error
          ? e.message
          : 'Não foi possível localizar o endereço agora.',
      )
    } finally {
      setBuscando(false)
    }
  }

  function escolher(s: SugestaoEndereco) {
    onEnderecoChange(s.rotulo)
    if (s.cidade) onCidadeChange(s.cidade)
    /* a coordenada só é associada após a escolha explícita da sugestão */
    onCoordsChange({ lat: s.lat, lng: s.lng }, 'confirmado')
    setSugestoes([])
    setErro(undefined)
  }

  function usarCidadeAproximada() {
    const aprox = coordAproximada(cidade, endereco)
    if (!aprox) {
      setErro('Não conhecemos esta cidade. Busque o endereço para obter a localização.')
      return
    }
    onCoordsChange(aprox, 'aproximado')
    setErro(undefined)
    setSugestoes([])
  }

  return (
    <div className="space-y-3">
      <div>
        <span className="mb-1.5 block text-[13px] font-semibold text-ink-700">
          Endereço
        </span>
        <div className="flex gap-2">
          <Entrada
            value={endereco}
            erro={!!erroEndereco}
            placeholder="Rua, número, bairro"
            onChange={(e) => onEnderecoChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                buscar()
              }
            }}
          />
          <Button
            type="button"
            variante="creme"
            className="shrink-0"
            icone={
              buscando ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Search size={16} />
              )
            }
            disabled={buscando}
            onClick={buscar}
          >
            Localizar
          </Button>
        </div>
        {erroEndereco ? (
          <span className="mt-1 block text-[12px] font-medium text-clay-700">
            {erroEndereco}
          </span>
        ) : null}
      </div>

      <div>
        <span className="mb-1.5 block text-[13px] font-semibold text-ink-700">
          Cidade
        </span>
        <Entrada
          value={cidade}
          placeholder="Ex.: Gramado"
          onChange={(e) => onCidadeChange(e.target.value)}
        />
      </div>

      {sugestoes.length ? (
        <div className="rounded-2xl border border-sage-200 bg-cream-50 p-1.5">
          <p className="px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-ink-400">
            Selecione o endereço correto
          </p>
          <ul className="space-y-0.5">
            {sugestoes.map((s, i) => (
              <li key={`${s.lat}-${s.lng}-${i}`}>
                <button
                  type="button"
                  onClick={() => escolher(s)}
                  className="flex w-full items-start gap-2 rounded-xl px-2 py-2 text-left transition-colors hover:bg-sage-100"
                >
                  <MapPin size={15} className="mt-0.5 shrink-0 text-forest-600" />
                  <span className="text-[13px] leading-snug text-ink-800">
                    {s.rotulo}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {erro ? (
        <p className="flex items-start gap-2 rounded-2xl bg-clay-100 px-3.5 py-2.5 text-[12px] font-semibold leading-relaxed text-clay-700">
          <AlertTriangle size={15} className="mt-0.5 shrink-0" />
          {erro}
        </p>
      ) : null}

      {coords ? (
        <div className="rounded-2xl border border-forest-700/20 bg-forest-700/5 px-3.5 py-3">
          <div className="flex items-start gap-2">
            <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-forest-600" />
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-semibold text-forest-900">
                Localização confirmada
                {geoStatus === 'aproximado' ? ' (aproximada)' : ''}
              </div>
              <div className="text-[12px] tabular-nums text-ink-500">
                {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
              </div>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {mapa ? (
              <a
                href={mapa}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-full bg-cream-50 px-3 py-1.5 text-[12px] font-semibold text-forest-700 transition-colors hover:bg-sage-100"
              >
                <ExternalLink size={13} /> Abrir no OpenStreetMap
              </a>
            ) : null}
            <button
              type="button"
              onClick={() => onCoordsChange(undefined, undefined)}
              className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-semibold text-ink-500 transition-colors hover:bg-clay-100 hover:text-clay-700"
            >
              <Unlink size={13} /> Remover localização
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2 text-[12px] text-ink-500">
          <span>
            Nenhuma coordenada associada. Busque e selecione um endereço — nada
            é gravado automaticamente.
          </span>
          <button
            type="button"
            onClick={usarCidadeAproximada}
            className="font-semibold text-forest-700 underline-offset-2 hover:underline"
          >
            Usar centro da cidade
          </button>
        </div>
      )}

      <p className="text-[11px] text-ink-400">
        Busca de endereços via OpenStreetMap (Photon / Nominatim) — público e
        sem chave de API.
      </p>
    </div>
  )
}
