import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BedDouble,
  CalendarPlus,
  CheckCircle2,
  ChevronDown,
  Compass,
  LayoutGrid,
  List,
  MapPin,
  Pencil,
  Plus,
  Search,
  SearchX,
  SlidersHorizontal,
  Ticket,
  X,
} from 'lucide-react'
import type { ID, LocalCategoria, RoteiroItemTipo } from '../types'
import { CATEGORIA_META, LOCAL_CATEGORIAS } from '../types'
import { useTrip } from '../store/TripStore'
import {
  diasDoItem,
  itemOrganizado,
  resumoViagem,
  viagemAtiva,
} from '../lib/derive'
import { formatDiaOuNumero, formatPeriodoOpcional } from '../lib/format'
import { Button } from '../components/ui/Button'
import { ProgressBar } from '../components/ui/ProgressBar'
import { EmptyState } from '../components/ui/EmptyState'
import { Sheet } from '../components/ui/Sheet'
import { Selecao } from '../components/ui/Field'
import { ItemCard } from '../components/cards/ItemCard'
import { SeletorDia } from '../components/sheets/SeletorDia'
import { EditarItemSheet } from '../components/sheets/EditarItemSheet'
import { cn } from '../lib/cn'

type FiltroTipo = 'todos' | 'local' | 'passagem' | 'hotel'
type Situacao = 'todas' | 'pendentes' | 'organizados'
type Modo = 'cartoes' | 'lista'

interface Registro {
  tipo: RoteiroItemTipo
  id: ID
  organizado: boolean
  nome: string
  categoria?: LocalCategoria
}

export function Planejamento() {
  const { state, dispatch } = useTrip()
  const navigate = useNavigate()
  const viagem = viagemAtiva(state)

  const [tipo, setTipo] = useState<FiltroTipo>('todos')
  const [categoria, setCategoria] = useState<LocalCategoria | 'todas'>('todas')
  const [situacao, setSituacao] = useState<Situacao>('todas')
  const [busca, setBusca] = useState('')
  const [modo, setModo] = useState<Modo>('cartoes')
  const [filtrosAbertos, setFiltrosAbertos] = useState(true)
  const [menu, setMenu] = useState(false)
  const [seletor, setSeletor] = useState<Registro | null>(null)
  const [editando, setEditando] = useState<Registro | null>(null)

  const resumo = viagem ? resumoViagem(state, viagem.id) : null

  const registros = useMemo<Registro[]>(() => {
    if (!viagem) return []
    const locais = state.locais
      .filter((l) => l.viagemId === viagem.id)
      .map<Registro>((l) => ({
        tipo: 'LOCAL',
        id: l.id,
        organizado: itemOrganizado(state, 'LOCAL', l.id),
        nome: l.nome,
        categoria: l.categoria,
      }))
    const passagens = state.passagens
      .filter((p) => p.viagemId === viagem.id)
      .map<Registro>((p) => ({
        tipo: 'PASSAGEM',
        id: p.id,
        organizado: itemOrganizado(state, 'PASSAGEM', p.id),
        nome: `${p.origem} → ${p.destino}`,
      }))
    const hoteis = state.hoteis
      .filter((h) => h.viagemId === viagem.id)
      .map<Registro>((h) => ({
        tipo: 'HOTEL',
        id: h.id,
        organizado: itemOrganizado(state, 'HOTEL', h.id),
        nome: h.nome,
      }))
    return [...locais, ...passagens, ...hoteis]
  }, [state, viagem])

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase()
    return registros.filter((r) => {
      if (tipo === 'local' && r.tipo !== 'LOCAL') return false
      if (tipo === 'passagem' && r.tipo !== 'PASSAGEM') return false
      if (tipo === 'hotel' && r.tipo !== 'HOTEL') return false
      if (categoria !== 'todas' && r.categoria !== categoria) return false
      if (situacao === 'pendentes' && r.organizado) return false
      if (situacao === 'organizados' && !r.organizado) return false
      if (q && !r.nome.toLowerCase().includes(q)) return false
      return true
    })
  }, [registros, tipo, categoria, situacao, busca])

  const pendentes = filtrados.filter((r) => !r.organizado)
  const organizados = filtrados.filter((r) => r.organizado)

  const contagem = {
    todos: registros.length,
    local: registros.filter((r) => r.tipo === 'LOCAL').length,
    passagem: registros.filter((r) => r.tipo === 'PASSAGEM').length,
    hotel: registros.filter((r) => r.tipo === 'HOTEL').length,
  }

  const filtrosAtivos =
    (tipo !== 'todos' ? 1 : 0) +
    (categoria !== 'todas' ? 1 : 0) +
    (situacao !== 'todas' ? 1 : 0)

  function limparFiltros() {
    setBusca('')
    setTipo('todos')
    setCategoria('todas')
    setSituacao('todas')
  }

  if (!viagem || !resumo) {
    return (
      <EmptyState
        icone={<Compass size={22} />}
        titulo="Nenhuma viagem ativa"
        descricao="Crie uma viagem para começar a cadastrar locais, passagens e hospedagens."
        acao={
          <Button icone={<Plus size={17} />} onClick={() => navigate('/nova-viagem')}>
            Criar viagem
          </Button>
        }
      />
    )
  }

  function confirmarDia(diaId: ID) {
    if (!seletor) return
    /* Com datas, a hospedagem vigora em todos os dias do período. */
    if (seletor.tipo === 'HOTEL' && viagem.comDatas) {
      dispatch({ type: 'ADD_HOTEL_AOS_DIAS', hotelId: seletor.id })
    } else {
      dispatch({
        type: 'ADD_ROTEIRO',
        entrada: {
          id: `r-${seletor.tipo}-${seletor.id}-${diaId}`,
          viagemId: viagem.id,
          diaId,
          tipoItem: seletor.tipo,
          itemId: seletor.id,
        },
      })
    }
    setSeletor(null)
    navigate('/roteiro')
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <header className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[12px] font-bold uppercase tracking-widest text-sage-700">
              Planejamento
            </p>
            <h1 className="mt-1 text-2xl leading-tight sm:text-3xl">
              {viagem.nome}
            </h1>
            <p className="mt-1 flex flex-wrap items-center gap-x-2 text-[13px] text-ink-500">
              <span className="inline-flex items-center gap-1">
                <MapPin size={13} /> {viagem.destino}
              </span>
              <span aria-hidden>·</span>
              <span>{formatPeriodoOpcional(viagem.dataInicio, viagem.dataFim)}</span>
              <span aria-hidden>·</span>
              <span>
                {resumo.dias} {resumo.dias === 1 ? 'dia' : 'dias'} no roteiro
              </span>
            </p>
          </div>
          <Button icone={<Plus size={17} />} onClick={() => setMenu(true)}>
            Adicionar
          </Button>
        </div>

        {/* Busca + resumo */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              size={17}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400"
            />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar em locais, passagens e hotéis…"
              aria-label="Buscar itens"
              className="h-11 w-full rounded-2xl border border-sage-200 bg-cream-50 pl-10 pr-4 text-[15px] text-ink-900 placeholder:text-ink-300 focus:border-forest-600 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-sage-200/70 bg-cream-50 px-3.5 py-2">
            <div className="min-w-[92px]">
              <div className="flex items-baseline justify-between">
                <span className="text-[11px] font-semibold text-ink-500">
                  roteiro
                </span>
                <span className="text-[12px] font-bold tabular-nums text-forest-800">
                  {resumo.progresso}%
                </span>
              </div>
              <ProgressBar valor={resumo.progresso} className="mt-1 h-1.5" />
            </div>
          </div>
        </div>

        {/* Barra de controles: filtros (recolhível) + modo de visualização */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setFiltrosAbertos((v) => !v)}
            aria-expanded={filtrosAbertos}
            className={cn(
              'inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-[13px] font-semibold transition-colors',
              filtrosAbertos || filtrosAtivos
                ? 'border-forest-700 bg-forest-700 text-cream-50'
                : 'border-sage-200 bg-cream-50 text-ink-600 hover:border-sage-300 hover:text-forest-700',
            )}
          >
            <SlidersHorizontal size={15} />
            Filtros
            {filtrosAtivos ? (
              <span className="rounded-full bg-cream-50/25 px-1.5 text-[11px] font-bold tabular-nums">
                {filtrosAtivos}
              </span>
            ) : null}
            <ChevronDown
              size={15}
              className={cn('transition-transform', filtrosAbertos && 'rotate-180')}
            />
          </button>

          <div className="flex rounded-full border border-sage-200 bg-cream-50 p-1">
            <button
              type="button"
              aria-label="Visualizar em cartões"
              aria-pressed={modo === 'cartoes'}
              onClick={() => setModo('cartoes')}
              className={cn(
                'grid h-8 w-8 place-items-center rounded-full transition-colors',
                modo === 'cartoes'
                  ? 'bg-forest-700 text-cream-50'
                  : 'text-ink-400 hover:text-forest-700',
              )}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              type="button"
              aria-label="Visualizar em lista"
              aria-pressed={modo === 'lista'}
              onClick={() => setModo('lista')}
              className={cn(
                'grid h-8 w-8 place-items-center rounded-full transition-colors',
                modo === 'lista'
                  ? 'bg-forest-700 text-cream-50'
                  : 'text-ink-400 hover:text-forest-700',
              )}
            >
              <List size={16} />
            </button>
          </div>
        </div>

        {/* Seção de filtros recolhível */}
        {filtrosAbertos ? (
          <div className="rounded-3xl border border-sage-200/70 bg-cream-50 p-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="block">
                <span className="mb-1.5 block text-[12px] font-semibold text-ink-600">
                  Tipo
                </span>
                <Selecao
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value as FiltroTipo)}
                >
                  <option value="todos">Todos os tipos ({contagem.todos})</option>
                  <option value="local">Locais ({contagem.local})</option>
                  <option value="passagem">
                    Passagens ({contagem.passagem})
                  </option>
                  <option value="hotel">Hotéis ({contagem.hotel})</option>
                </Selecao>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-[12px] font-semibold text-ink-600">
                  Categoria do local
                </span>
                <Selecao
                  value={categoria}
                  onChange={(e) =>
                    setCategoria(e.target.value as LocalCategoria | 'todas')
                  }
                >
                  <option value="todas">Todas as categorias</option>
                  {LOCAL_CATEGORIAS.map((c) => (
                    <option key={c} value={c}>
                      {CATEGORIA_META[c].emoji} {CATEGORIA_META[c].rotulo}
                    </option>
                  ))}
                </Selecao>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-[12px] font-semibold text-ink-600">
                  Situação
                </span>
                <Selecao
                  value={situacao}
                  onChange={(e) => setSituacao(e.target.value as Situacao)}
                >
                  <option value="todas">Todos</option>
                  <option value="pendentes">Ainda não no roteiro</option>
                  <option value="organizados">Já no roteiro</option>
                </Selecao>
              </label>
            </div>

            {filtrosAtivos || busca ? (
              <button
                type="button"
                onClick={limparFiltros}
                className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-semibold text-ink-500 transition-colors hover:text-forest-700"
              >
                <X size={13} /> Limpar filtros e busca
              </button>
            ) : null}
          </div>
        ) : null}
      </header>

      {registros.length === 0 ? (
        <EmptyState
          icone={<MapPin size={22} />}
          titulo="Nada cadastrado ainda"
          descricao="Cadastre os locais que você quer visitar, as passagens e a hospedagem. Você organiza tudo no roteiro depois, com calma."
          acao={
            <div className="flex flex-wrap justify-center gap-2">
              <Button onClick={() => navigate('/cadastro/local')} icone={<MapPin size={16} />}>
                Local
              </Button>
              <Button
                variante="creme"
                onClick={() => navigate('/cadastro/passagem')}
                icone={<Ticket size={16} />}
              >
                Passagem
              </Button>
              <Button
                variante="creme"
                onClick={() => navigate('/cadastro/hotel')}
                icone={<BedDouble size={16} />}
              >
                Hotel
              </Button>
            </div>
          }
        />
      ) : filtrados.length === 0 ? (
        <EmptyState
          compacto
          icone={<SearchX size={20} />}
          titulo="Busca sem resultados"
          descricao="Nenhum item corresponde aos filtros atuais. Tente outra busca ou limpe os filtros."
          acao={
            <Button variante="creme" tamanho="sm" onClick={limparFiltros}>
              Limpar filtros
            </Button>
          }
        />
      ) : (
        <div className="space-y-8">
          {/* Área A — ainda não no roteiro */}
          <section>
            <div className="mb-3 flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-clay-100 text-clay-700">
                <CalendarPlus size={15} />
              </span>
              <h2 className="text-lg">Ainda não incluídos no roteiro</h2>
              <span className="rounded-full bg-cream-200 px-2 py-0.5 text-[12px] font-bold tabular-nums text-ink-600">
                {pendentes.length}
              </span>
            </div>

            {pendentes.length === 0 ? (
              <EmptyState
                compacto
                icone={<CheckCircle2 size={20} />}
                titulo="Tudo organizado!"
                descricao="Todos os registros que combinam com os filtros já estão distribuídos nos dias da viagem."
              />
            ) : (
              <div
                className={
                  modo === 'cartoes'
                    ? 'grid gap-3 sm:grid-cols-2 xl:grid-cols-3'
                    : 'space-y-2'
                }
              >
                {pendentes.map((r) => (
                  <ItemInventario
                    key={`${r.tipo}-${r.id}`}
                    registro={r}
                    modo={modo}
                    onAdicionar={() => setSeletor(r)}
                    onEditar={() => setEditando(r)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Área B — já no roteiro */}
          <section>
            <div className="mb-3 flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-sage-200 text-forest-800">
                <CheckCircle2 size={15} />
              </span>
              <h2 className="text-lg">Já incluídos no roteiro</h2>
              <span className="rounded-full bg-cream-200 px-2 py-0.5 text-[12px] font-bold tabular-nums text-ink-600">
                {organizados.length}
              </span>
            </div>

            {organizados.length === 0 ? (
              <EmptyState
                compacto
                icone={<CalendarPlus size={20} />}
                titulo="Nenhum item no roteiro ainda"
                descricao="Use “Adicionar ao roteiro” nos itens acima para distribuí-los nos dias da viagem."
              />
            ) : (
              <div
                className={
                  modo === 'cartoes'
                    ? 'grid gap-3 sm:grid-cols-2 xl:grid-cols-3'
                    : 'space-y-2'
                }
              >
                {organizados.map((r) => (
                  <ItemInventario
                    key={`${r.tipo}-${r.id}`}
                    registro={r}
                    modo={modo}
                    dias={diasDoItem(state, r.tipo, r.id).map((d) => ({
                      numero: d.numero,
                      data: d.data,
                    }))}
                    onAbrirDia={() => navigate('/roteiro')}
                    onEditar={() => setEditando(r)}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* Menu Adicionar */}
      <Sheet
        aberto={menu}
        aoFechar={() => setMenu(false)}
        titulo="Adicionar ao planejamento"
        subtitulo="Cada tipo tem seu próprio formulário"
      >
        <div className="space-y-2.5">
          <OpcaoAdicionar
            icone={<MapPin size={20} />}
            titulo="Local ou atividade"
            descricao="Pontos turísticos, museus, restaurantes, natureza, compras…"
            onClick={() => navigate('/cadastro/local')}
          />
          <OpcaoAdicionar
            icone={<Ticket size={20} />}
            titulo="Passagem"
            descricao="Avião, trem ou ônibus com origem, destino e horários."
            onClick={() => navigate('/cadastro/passagem')}
          />
          <OpcaoAdicionar
            icone={<BedDouble size={20} />}
            titulo="Hospedagem"
            descricao="Hotel ou pousada com check-in, check-out e valores."
            onClick={() => navigate('/cadastro/hotel')}
          />
        </div>
      </Sheet>

      {seletor ? (
        <SeletorDia
          aberto
          aoFechar={() => setSeletor(null)}
          viagemId={viagem.id}
          tipoItem={seletor.tipo}
          itemId={seletor.id}
          titulo={seletor.nome}
          onEscolher={confirmarDia}
        />
      ) : null}

      {/* Edição em modal — preserva o contexto da página (Task 7) */}
      <EditarItemSheet
        tipo={editando?.tipo ?? null}
        itemId={editando?.id ?? null}
        viagemId={viagem.id}
        aoFechar={() => setEditando(null)}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ */
interface ItemInventarioProps {
  registro: Registro
  modo: Modo
  dias?: { numero: number; data?: string }[]
  onAdicionar?: () => void
  onAbrirDia?: () => void
  onEditar: () => void
}

function ItemInventario({
  registro,
  modo,
  dias,
  onAdicionar,
  onAbrirDia,
  onEditar,
}: ItemInventarioProps) {
  const { state } = useTrip()
  const viagem = viagemAtiva(state)
  const diasViagem = viagem
    ? state.dias
        .filter((d) => d.viagemId === viagem.id)
        .sort((a, b) => a.numero - b.numero)
    : []

  const item = useMemo(() => {
    if (registro.tipo === 'LOCAL') {
      const local = state.locais.find((l) => l.id === registro.id)
      return local ? ({ tipo: 'LOCAL', local } as const) : null
    }
    if (registro.tipo === 'PASSAGEM') {
      const passagem = state.passagens.find((p) => p.id === registro.id)
      return passagem ? ({ tipo: 'PASSAGEM', passagem } as const) : null
    }
    const hotel = state.hoteis.find((h) => h.id === registro.id)
    return hotel ? ({ tipo: 'HOTEL', hotel } as const) : null
  }, [state, registro])

  if (!item) return null

  const acao = onAdicionar ? (
    <div className="flex items-center gap-2">
      <Button
        variante="secundario"
        tamanho="sm"
        className="flex-1"
        icone={<CalendarPlus size={15} />}
        onClick={onAdicionar}
      >
        Adicionar ao roteiro
      </Button>
      <Button
        variante="fantasma"
        tamanho="sm"
        aria-label="Editar item"
        icone={<Pencil size={15} />}
        onClick={onEditar}
      />
    </div>
  ) : (
    <div className="flex flex-wrap items-center gap-2">
      {dias?.map((d) => (
        <span
          key={d.numero}
          className="inline-flex items-center gap-1 rounded-full bg-forest-700/10 px-2.5 py-1 text-[11px] font-bold text-forest-800"
        >
          {formatDiaOuNumero(d.data, d.numero)}
        </span>
      ))}
      <div className="ml-auto flex items-center gap-1.5">
        {onAbrirDia ? (
          <Button variante="fantasma" tamanho="sm" onClick={onAbrirDia}>
            Abrir dia
          </Button>
        ) : null}
        <Button
          variante="fantasma"
          tamanho="sm"
          icone={<Pencil size={14} />}
          onClick={onEditar}
        >
          Editar
        </Button>
      </div>
    </div>
  )

  if (modo === 'lista') {
    return (
      <div className="rounded-2xl border border-sage-200/70 bg-cream-50 p-2">
        <ItemCard item={item} dias={diasViagem} acao={acao} />
      </div>
    )
  }

  return <ItemCard item={item} dias={diasViagem} acao={acao} />
}

function OpcaoAdicionar({
  icone,
  titulo,
  descricao,
  onClick,
}: {
  icone: React.ReactNode
  titulo: string
  descricao: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3.5 rounded-3xl border border-sage-200 bg-cream-50 p-4 text-left transition-colors hover:border-forest-600 hover:bg-sage-100"
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-sage-100 text-forest-700">
        {icone}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-forest-900">{titulo}</span>
        <span className="mt-0.5 block text-[12px] leading-snug text-ink-500">
          {descricao}
        </span>
      </span>
      <Plus size={18} className="shrink-0 text-ink-400" />
    </button>
  )
}
