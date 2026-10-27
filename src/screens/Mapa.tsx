import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  BedDouble,
  Compass,
  ExternalLink,
  Layers,
  MapPin,
  Pencil,
  Plus,
} from 'lucide-react'
import type { ID, LocalCategoria, RoteiroItemTipo } from '../types'
import { CATEGORIA_META, LOCAL_CATEGORIAS } from '../types'
import { useTrip } from '../store/TripStore'
import { viagemAtiva } from '../lib/derive'
import { formatDiaOuNumero } from '../lib/format'
import { linkOpenStreetMap } from '../lib/geocode'
import { Button } from '../components/ui/Button'
import { Chip } from '../components/ui/Chip'
import { EmptyState } from '../components/ui/EmptyState'
import { LocalCard } from '../components/cards/LocalCard'
import { HotelCard } from '../components/cards/HotelCard'
import { EditarItemSheet } from '../components/sheets/EditarItemSheet'

function icone(cor: string, emoji: string) {
  return L.divIcon({
    className: '',
    html: `<div class="tp-marker" style="background:${cor}"><span>${emoji}</span></div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -32],
  })
}

function AjustarView({ pontos }: { pontos: [number, number][] }) {
  const map = useMap()
  useEffect(() => {
    if (pontos.length === 0) return
    if (pontos.length === 1) {
      map.setView(pontos[0], 14)
      return
    }
    map.fitBounds(L.latLngBounds(pontos), { padding: [40, 40], maxZoom: 15 })
  }, [map, pontos])
  return null
}

export function Mapa() {
  const { state } = useTrip()
  const navigate = useNavigate()
  const viagem = viagemAtiva(state)

  const [categoria, setCategoria] = useState<LocalCategoria | 'todas'>('todas')
  const [diaFiltro, setDiaFiltro] = useState<string>('todos')
  const [mostrarHoteis, setMostrarHoteis] = useState(true)
  const [selecionado, setSelecionado] = useState<
    { tipo: 'LOCAL'; id: string } | { tipo: 'HOTEL'; id: string } | null
  >(null)
  const [editando, setEditando] = useState<{
    tipo: RoteiroItemTipo
    id: ID
  } | null>(null)

  const viagemId = viagem?.id
  const { dias: todosDias, locais: todosLocais, hoteis: todosHoteis, roteiro } = state

  const dias = useMemo(
    () =>
      todosDias
        .filter((d) => d.viagemId === viagemId)
        .sort((a, b) => a.numero - b.numero),
    [todosDias, viagemId],
  )
  const locais = useMemo(
    () => todosLocais.filter((l) => l.viagemId === viagemId),
    [todosLocais, viagemId],
  )
  const hoteis = useMemo(
    () => todosHoteis.filter((h) => h.viagemId === viagemId),
    [todosHoteis, viagemId],
  )

  /* mapa "TIPO:itemId" → números dos dias em que o item aparece */
  const diasPorItem = useMemo(() => {
    const mapa = new Map<string, number[]>()
    for (const r of roteiro) {
      const dia = dias.find((d) => d.id === r.diaId)
      if (!dia) continue
      const chave = `${r.tipoItem}:${r.itemId}`
      const atual = mapa.get(chave) ?? []
      if (!atual.includes(dia.numero)) atual.push(dia.numero)
      mapa.set(chave, atual)
    }
    return mapa
  }, [roteiro, dias])

  const locaisFiltrados = useMemo(() => {
    return locais.filter((l) => {
      if (categoria !== 'todas' && l.categoria !== categoria) return false
      if (diaFiltro === 'todos') return true
      const nums = diasPorItem.get(`LOCAL:${l.id}`) ?? []
      if (diaFiltro === 'sem-dia') return nums.length === 0
      return nums.includes(Number(diaFiltro.replace('d', '')))
    })
  }, [locais, categoria, diaFiltro, diasPorItem])

  const hoteisFiltrados = useMemo(
    () => (mostrarHoteis ? hoteis : []),
    [hoteis, mostrarHoteis],
  )

  const pontos = useMemo(() => {
    const out: [number, number][] = []
    for (const l of locaisFiltrados)
      if (l.lat != null && l.lng != null) out.push([l.lat, l.lng])
    for (const h of hoteisFiltrados)
      if (h.lat != null && h.lng != null) out.push([h.lat, h.lng])
    return out
  }, [locaisFiltrados, hoteisFiltrados])

  const centro: [number, number] = pontos[0] ?? [-29.3785, -50.8727]

  if (!viagem) {
    return (
      <EmptyState
        icone={<Compass size={22} />}
        titulo="Nenhuma viagem ativa"
        descricao="Crie uma viagem e cadastre locais para vê-los no mapa."
        acao={
          <Button icone={<Plus size={17} />} onClick={() => navigate('/nova-viagem')}>
            Criar viagem
          </Button>
        }
      />
    )
  }

  const localSel = selecionado?.tipo === 'LOCAL' ? locais.find((l) => l.id === selecionado.id) : null
  const hotelSel = selecionado?.tipo === 'HOTEL' ? hoteis.find((h) => h.id === selecionado.id) : null

  return (
    <div className="space-y-5">
      <header className="space-y-3">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-widest text-sage-700">
            Mapa
          </p>
          <h1 className="mt-1 text-2xl leading-tight sm:text-3xl">
            Locais de {viagem.nome}
          </h1>
          <p className="mt-1 text-[13px] text-ink-500">
            {locaisFiltrados.length} de {locais.length} locais visíveis · itens
            ainda não agendados continuam no mapa
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={diaFiltro}
            onChange={(e) => setDiaFiltro(e.target.value)}
            aria-label="Filtrar por dia do roteiro"
            className="h-10 rounded-full border border-sage-200 bg-cream-50 px-4 text-[13px] font-semibold text-ink-700 focus:border-forest-600 focus:outline-none"
          >
            <option value="todos">Todos os dias</option>
            <option value="sem-dia">Sem dia definido</option>
            {dias.map((d) => (
              <option key={d.id} value={`d${d.numero}`}>
                {formatDiaOuNumero(d.data, d.numero)}
              </option>
            ))}
          </select>

          <Chip
            ativo={mostrarHoteis}
            onClick={() => setMostrarHoteis((v) => !v)}
            icone={<BedDouble size={14} />}
          >
            Hospedagens
          </Chip>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-sage-100 px-3 py-1.5 text-[12px] font-semibold text-ink-600">
            <Layers size={14} /> OpenStreetMap
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          <Chip ativo={categoria === 'todas'} onClick={() => setCategoria('todas')}>
            Todas
          </Chip>
          {LOCAL_CATEGORIAS.map((c) => (
            <Chip
              key={c}
              ativo={categoria === c}
              onClick={() => setCategoria(categoria === c ? 'todas' : c)}
              icone={<span aria-hidden>{CATEGORIA_META[c].emoji}</span>}
            >
              {CATEGORIA_META[c].rotulo}
            </Chip>
          ))}
        </div>
      </header>

      <div className="overflow-hidden rounded-3xl border border-sage-200/70 bg-cream-50">
        <div className="h-[46svh] min-h-[320px] w-full lg:h-[60svh]">
          <MapContainer
            center={centro}
            zoom={13}
            scrollWheelZoom={false}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <AjustarView pontos={pontos} />

            {locaisFiltrados
              .filter((l) => l.lat != null && l.lng != null)
              .map((l) => {
                const meta = CATEGORIA_META[l.categoria]
                const nums = diasPorItem.get(`LOCAL:${l.id}`) ?? []
                return (
                  <Marker
                    key={l.id}
                    position={[l.lat!, l.lng!]}
                    icon={icone(meta.cor, meta.emoji)}
                    eventHandlers={{
                      click: () => setSelecionado({ tipo: 'LOCAL', id: l.id }),
                    }}
                  >
                    <Popup>
                      <strong className="block font-display text-[15px] text-forest-900">
                        {l.nome}
                      </strong>
                      <span className="mt-0.5 block text-[12px] text-ink-500">
                        {meta.rotulo}
                        {l.cidade ? ` · ${l.cidade}` : ''}
                      </span>
                      <span className="mt-1 block text-[12px] text-ink-600">
                        {nums.length
                          ? `Dia ${nums.join(', ')}`
                          : 'Ainda não agendado'}
                      </span>
                      {linkOpenStreetMap(l) ? (
                        <a
                          href={linkOpenStreetMap(l)!}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 inline-block text-[12px] font-semibold text-forest-700 underline"
                        >
                          Abrir no OpenStreetMap
                        </a>
                      ) : null}
                    </Popup>
                  </Marker>
                )
              })}

            {hoteisFiltrados
              .filter((h) => h.lat != null && h.lng != null)
              .map((h) => (
                <Marker
                  key={h.id}
                  position={[h.lat!, h.lng!]}
                  icon={icone('#1e4029', '🏨')}
                  eventHandlers={{
                    click: () => setSelecionado({ tipo: 'HOTEL', id: h.id }),
                  }}
                >
                  <Popup>
                    <strong className="block font-display text-[15px] text-forest-900">
                      {h.nome}
                    </strong>
                    <span className="mt-0.5 block text-[12px] text-ink-500">
                      Hospedagem · {h.noites ?? 0} noites
                    </span>
                    {linkOpenStreetMap(h) ? (
                      <a
                        href={linkOpenStreetMap(h)!}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-block text-[12px] font-semibold text-forest-700 underline"
                      >
                        Abrir no OpenStreetMap
                      </a>
                    ) : null}
                  </Popup>
                </Marker>
              ))}
          </MapContainer>
        </div>

        {/* Legenda */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 border-t border-sage-200/70 px-4 py-3">
          {LOCAL_CATEGORIAS.map((c) => (
            <span key={c} className="inline-flex items-center gap-1.5 text-[11px] font-medium text-ink-600">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: CATEGORIA_META[c].cor }}
              />
              {CATEGORIA_META[c].rotulo}
            </span>
          ))}
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-ink-600">
            <span className="h-2.5 w-2.5 rounded-full bg-forest-800" />
            Hospedagem
          </span>
        </div>
      </div>

      {/* Card do item selecionado */}
      {localSel || hotelSel ? (
        <section>
          <h2 className="mb-2 text-[13px] font-bold uppercase tracking-wide text-ink-400">
            Selecionado
          </h2>
          {localSel ? (
            <LocalCard local={localSel} />
          ) : hotelSel ? (
            <HotelCard hotel={hotelSel} dias={dias} />
          ) : null}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button
              tamanho="sm"
              icone={<Pencil size={15} />}
              onClick={() =>
                setEditando({
                  tipo: localSel ? 'LOCAL' : 'HOTEL',
                  id: (localSel ?? hotelSel)!.id,
                })
              }
            >
              Editar
            </Button>
            {(() => {
              const alvo = localSel ?? hotelSel
              const link = alvo ? linkOpenStreetMap(alvo) : null
              if (!link) return null
              return (
                <a
                  href={link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-9 items-center gap-1.5 rounded-full border border-sage-200 bg-cream-50 px-3.5 text-[13px] font-semibold text-forest-700 transition-colors hover:border-sage-300 hover:bg-sage-100"
                >
                  <ExternalLink size={15} /> Abrir no OpenStreetMap
                </a>
              )
            })()}
            {localSel ? (
              <Button
                tamanho="sm"
                variante="creme"
                onClick={() => navigate('/planejamento')}
              >
                Organizar no roteiro
              </Button>
            ) : null}
            <Button
              tamanho="sm"
              variante="fantasma"
              onClick={() => setSelecionado(null)}
            >
              Fechar
            </Button>
          </div>
        </section>
      ) : null}

      {locais.length === 0 ? (
        <EmptyState
          icone={<MapPin size={22} />}
          titulo="Nenhum local cadastrado"
          descricao="O mapa exibe os locais cadastrados. Cadastre um local informando a cidade — as coordenadas exatas são opcionais."
          acao={
            <Button icone={<Plus size={17} />} onClick={() => navigate('/cadastro/local')}>
              Cadastrar local
            </Button>
          }
        />
      ) : null}

      {/* Edição em modal — preserva o contexto do mapa (Task 7) */}
      <EditarItemSheet
        tipo={editando?.tipo ?? null}
        itemId={editando?.id ?? null}
        viagemId={viagem.id}
        aoFechar={() => setEditando(null)}
      />
    </div>
  )
}
