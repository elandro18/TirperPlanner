import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  BedDouble,
  CalendarPlus,
  CheckCircle2,
  Compass,
  MapPin,
  Plane,
  RefreshCw,
  SearchX,
  Ticket,
  Trash2,
} from 'lucide-react'
import type { TripHotel, TripLocal, TripPassagem } from '../types'
import { foto } from '../data/seed'
import { useTrip } from '../store/TripStore'
import { limparTudo, resetarSeed } from '../store/tripModel'
import { PageHeader } from '../components/layout/PageHeader'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { EmptyState } from '../components/ui/EmptyState'
import { ProgressBar } from '../components/ui/ProgressBar'
import { LocalCard } from '../components/cards/LocalCard'
import { PassagemCard } from '../components/cards/PassagemCard'
import { HotelCard } from '../components/cards/HotelCard'

const LOCAL_DEMO: TripLocal = {
  id: 'demo-l',
  viagemId: 'demo',
  nome: 'Cachoeira do Caracol',
  categoria: 'natureza',
  endereco: 'Rod. RS-466, km 12',
  cidade: 'Canela',
  horarioPrevisto: '10:00',
  duracaoMin: 120,
  custo: 45,
  observacoes: 'Levar capa de chuva.',
  fotoUrl: foto('cachoeira-caracol', 900, 700),
}

const PASSAGEM_DEMO: TripPassagem = {
  id: 'demo-p',
  viagemId: 'demo',
  tipo: 'onibus',
  origem: 'Porto Alegre (Rodoviária)',
  destino: 'Gramado (Rodoviária)',
  partida: '2026-05-12T14:30:00',
  chegada: '2026-05-12T17:00:00',
  companhia: 'Exemplo Bus',
  localizador: 'EXEMPLO-BUS-001',
  valor: 95,
}

const HOTEL_DEMO: TripHotel = {
  id: 'demo-h',
  viagemId: 'demo',
  nome: 'Pousada Vale Verde',
  endereco: 'Rua das Hortênsias, 45',
  cidade: 'Gramado',
  checkin: '2026-05-12T14:00:00',
  checkout: '2026-05-15T12:00:00',
  valorNoite: 380,
  noites: 3,
  valorTotal: 1140,
  codigoReserva: 'EXEMPLO-0001',
  fotoUrl: foto('pousada-vale', 900, 700),
}

const DIAS_DEMO = [
  { id: 'd1', viagemId: 'demo', numero: 1, data: '2026-05-12' },
  { id: 'd2', viagemId: 'demo', numero: 2, data: '2026-05-13' },
  { id: 'd3', viagemId: 'demo', numero: 3, data: '2026-05-14' },
  { id: 'd4', viagemId: 'demo', numero: 4, data: '2026-05-15' },
]

function Estado({
  titulo,
  descricao,
  children,
}: {
  titulo: string
  descricao: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-3xl border border-sage-200/70 bg-cream-100/60 p-4 sm:p-5">
      <h2 className="text-lg">{titulo}</h2>
      <p className="mb-4 mt-1 max-w-2xl text-[13px] leading-relaxed text-ink-500">
        {descricao}
      </p>
      {children}
    </section>
  )
}

export function Estados() {
  const { dispatch } = useTrip()
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      <PageHeader
        voltar={false}
        sobre="Estados & fluxo"
        titulo="Todos os estados do sistema"
        subtitulo="Cada estado vazio explica a próxima ação. Use os botões para experimentar o fluxo completo com dados de demonstração."
        acao={
          <div className="flex flex-wrap gap-2">
            <Button
              variante="creme"
              tamanho="sm"
              icone={<RefreshCw size={15} />}
              onClick={() => dispatch(resetarSeed())}
            >
              Recarregar demonstração
            </Button>
            <Button
              variante="perigo"
              tamanho="sm"
              icone={<Trash2 size={15} />}
              onClick={() => dispatch(limparTudo())}
            >
              Zerar dados
            </Button>
          </div>
        }
      />

      {/* Fluxo completo */}
      <section className="rounded-3xl border border-forest-700/20 bg-forest-700/5 p-5">
        <h2 className="flex items-center gap-2 text-lg">
          <Compass size={18} className="text-forest-700" /> Fluxo completo
        </h2>
        <ol className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { passo: 'Criar a viagem', para: '/nova-viagem' },
            { passo: 'Cadastrar 3 locais', para: '/cadastro/local' },
            { passo: 'Adicionar uma passagem', para: '/cadastro/passagem' },
            { passo: 'Cadastrar o hotel', para: '/cadastro/hotel' },
            { passo: 'Organizar no inventário', para: '/planejamento' },
            { passo: 'Distribuir nos dias (Kanban)', para: '/roteiro' },
          ].map((p, i) => (
            <li key={p.passo}>
              <button
                type="button"
                onClick={() => navigate(p.para)}
                className="flex w-full items-center gap-3 rounded-2xl border border-sage-200 bg-cream-50 px-3.5 py-2.5 text-left transition-colors hover:border-forest-600 hover:bg-sage-100"
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-forest-700 text-[12px] font-bold text-cream-50">
                  {i + 1}
                </span>
                <span className="text-[13px] font-semibold text-forest-900">
                  {p.passo}
                </span>
              </button>
            </li>
          ))}
        </ol>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <Estado
          titulo="Viagem recém-criada"
          descricao="Sem itens e sem roteiro. A tela convida a cadastrar o primeiro local, passagem ou hospedagem."
        >
          <div className="rounded-3xl border border-sage-200/70 bg-cream-50 p-4">
            <div className="flex items-center justify-between">
              <span className="font-display text-lg text-forest-900">
                Férias em Florianópolis
              </span>
              <Badge tom="argila">recém-criada</Badge>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-ink-500">
              <span className="inline-flex items-center gap-1">
                <MapPin size={12} /> Florianópolis, SC
              </span>
              <span>10 – 17 de julho de 2026 · 8 dias</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button tamanho="sm" onClick={() => navigate('/planejamento')}>
                Começar o planejamento
              </Button>
              <Button
                tamanho="sm"
                variante="creme"
                onClick={() => navigate('/roteiro')}
              >
                Ver roteiro
              </Button>
            </div>
          </div>
        </Estado>

        <Estado
          titulo="Viagem sem nenhum item cadastrado"
          descricao="Estado vazio do inventário de planejamento, com três caminhos de cadastro explícitos."
        >
          <EmptyState
            compacto
            icone={<MapPin size={20} />}
            titulo="Nada cadastrado ainda"
            descricao="Cadastre os locais que você quer visitar, as passagens e a hospedagem."
            acao={
              <div className="flex flex-wrap justify-center gap-2">
                <Button tamanho="sm" onClick={() => navigate('/cadastro/local')}>
                  Local
                </Button>
                <Button
                  tamanho="sm"
                  variante="creme"
                  onClick={() => navigate('/cadastro/passagem')}
                >
                  Passagem
                </Button>
                <Button
                  tamanho="sm"
                  variante="creme"
                  onClick={() => navigate('/cadastro/hotel')}
                >
                  Hotel
                </Button>
              </div>
            }
          />
        </Estado>

        <Estado
          titulo="Locais cadastrados, mas sem roteiro"
          descricao="Os registros existem e ficam na Área A do inventário, aguardando organização — sem obrigar a montar o roteiro no cadastro."
        >
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wide text-clay-700">
              <CalendarPlus size={14} /> Ainda não incluídos no roteiro
            </div>
            <LocalCard
              local={LOCAL_DEMO}
              acao={
                <Button tamanho="sm" variante="secundario" bloco>
                  Adicionar ao roteiro
                </Button>
              }
            />
          </div>
        </Estado>

        <Estado
          titulo="Itens não organizados + itens já distribuídos"
          descricao="O inventário separa claramente o que ainda não tem dia do que já foi organizado, permitindo abrir o dia ou editar o original."
        >
          <div className="space-y-3">
            <LocalCard local={LOCAL_DEMO} />
            <LocalCard
              local={{ ...LOCAL_DEMO, id: 'demo-l2', nome: 'Lago Negro', categoria: 'natureza', horarioPrevisto: '10:30' }}
              inicio="10:30"
              fim="12:00"
              acao={
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-forest-700/10 px-2.5 py-1 text-[11px] font-bold text-forest-800">
                    Dia 1 · 12 de maio
                  </span>
                  <Button variante="fantasma" tamanho="sm" className="ml-auto">
                    Abrir dia
                  </Button>
                </div>
              }
            />
          </div>
        </Estado>

        <Estado
          titulo="Dia sem atividades"
          descricao="Coluna do Kanban vazia, com ação direta para adicionar um item daquele tipo."
        >
          <div className="rounded-3xl border border-sage-200/70 bg-cream-50 p-3">
            <div className="flex items-center gap-2.5 px-1 pb-3">
              <span className="grid h-9 w-9 place-items-center rounded-2xl bg-forest-700 font-display text-sm font-bold text-cream-50">
                3
              </span>
              <div>
                <div className="font-display text-[17px] leading-none text-forest-900">
                  14 de maio
                </div>
                <div className="mt-1 text-[11px] font-medium text-ink-400">
                  0 itens
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-sage-300 px-4 py-8 text-center">
              <p className="text-[13px] font-semibold text-ink-600">Dia livre</p>
              <p className="text-[12px] text-ink-400">
                Adicione um local, uma passagem ou a hospedagem.
              </p>
              <Button variante="creme" tamanho="sm" icone={<CalendarPlus size={15} />}>
                Adicionar item
              </Button>
            </div>
          </div>
        </Estado>

        <Estado
          titulo="Roteiro com horários conflitantes"
          descricao="Dois itens se sobrepõem no mesmo dia. O aviso aparece no dia e nos cards envolvidos."
        >
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 rounded-xl bg-clay-100 px-3 py-2 text-[12px] font-bold text-clay-700">
              <AlertTriangle size={14} /> 2 itens com horários conflitantes
            </div>
            <LocalCard
              local={{ ...LOCAL_DEMO, nome: 'Café Colonial', categoria: 'restaurante', horarioPrevisto: '12:00' }}
              inicio="12:00"
              fim="13:30"
              emConflito
            />
            <LocalCard
              local={{ ...LOCAL_DEMO, id: 'demo-l3', nome: 'Passeio de trem', categoria: 'passeio', horarioPrevisto: '12:30' }}
              inicio="12:30"
              fim="14:00"
              emConflito
            />
          </div>
        </Estado>

        <Estado
          titulo="Passagem cadastrada"
          descricao="Cartão em formato de bilhete com origem, destino, horário, companhia e localizador marcado como exemplo."
        >
          <PassagemCard passagem={PASSAGEM_DEMO} />
        </Estado>

        <Estado
          titulo="Hospedagem que atravessa vários dias"
          descricao="A faixa temporal mostra em quais dias a hospedagem vigora. No roteiro ela aparece nesses dias sem duplicar o registro."
        >
          <HotelCard hotel={HOTEL_DEMO} dias={DIAS_DEMO} />
        </Estado>

        <Estado
          titulo="Busca sem resultados"
          descricao="Filtros e busca combinados sem correspondência, com ação para limpar."
        >
          <EmptyState
            compacto
            icone={<SearchX size={20} />}
            titulo="Busca sem resultados"
            descricao="Nenhum item corresponde aos filtros atuais. Tente outra busca ou limpe os filtros."
            acao={
              <Button variante="creme" tamanho="sm">
                Limpar filtros
              </Button>
            }
          />
        </Estado>

        <Estado
          titulo="Viagem totalmente organizada"
          descricao="Progresso de 100%: todos os registros distribuídos nos dias, com resumo de orçamento por categoria."
        >
          <div className="rounded-3xl border border-forest-700/20 bg-forest-700/5 p-4">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-forest-800">
                <CheckCircle2 size={16} /> Tudo organizado
              </span>
              <span className="font-display text-2xl text-forest-900">100%</span>
            </div>
            <ProgressBar valor={100} className="mt-3" />
            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-2xl bg-cream-50 py-2.5">
                <div className="font-display text-lg text-forest-900">3</div>
                <div className="text-[11px] text-ink-500">locais</div>
              </div>
              <div className="rounded-2xl bg-cream-50 py-2.5">
                <div className="font-display text-lg text-forest-900">1</div>
                <div className="text-[11px] text-ink-500">passagem</div>
              </div>
              <div className="rounded-2xl bg-cream-50 py-2.5">
                <div className="font-display text-lg text-forest-900">1</div>
                <div className="text-[11px] text-ink-500">hotel</div>
              </div>
            </div>
          </div>
        </Estado>
      </div>

      {/* Índice de ícones para revisão */}
      <section className="rounded-3xl border border-sage-200/70 bg-cream-50 p-5">
        <h2 className="text-lg">Ícones e entidades</h2>
        <p className="mb-4 mt-1 text-[13px] text-ink-500">
          Locais, passagens e hospedagens nunca são tratados como a mesma
          entidade.
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge tom="salvia" icone={<MapPin size={13} />}>TRIP_LOCAL</Badge>
          <Badge tom="floresta" icone={<Ticket size={13} />}>TRIP_PASSAGEM</Badge>
          <Badge tom="creme" icone={<BedDouble size={13} />}>TRIP_HOTEL</Badge>
          <Badge tom="neutro" icone={<Plane size={13} />}>TRIP_ROTEIRO</Badge>
        </div>
      </section>
    </div>
  )
}
