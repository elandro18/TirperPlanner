import { NavLink, useNavigate } from 'react-router-dom'
import { LogOut, Plus } from 'lucide-react'
import { NAV_PRINCIPAL } from './nav'
import { Logo } from './Logo'
import { cn } from '../../lib/cn'
import { useTrip } from '../../store/TripStore'
import { useAuth } from '../../auth/AuthProvider'
import { viagemAtiva, resumoViagem } from '../../lib/derive'
import { ProgressBar } from '../ui/ProgressBar'

export function Sidebar() {
  const { state } = useTrip()
  const { sair } = useAuth()
  const navigate = useNavigate()
  const viagem = viagemAtiva(state)
  const resumo = viagem ? resumoViagem(state, viagem.id) : null

  return (
    <aside className="sticky top-0 hidden h-svh w-64 shrink-0 flex-col border-r border-sage-200/70 bg-cream-50/80 px-4 py-6 lg:flex">
      <div className="flex items-center gap-2.5 px-2">
        <Logo tamanho={36} />
        <div className="leading-tight">
          <div className="font-display text-lg text-forest-900">Trip Planner</div>
          <div className="text-[11px] font-medium uppercase tracking-widest text-ink-400">
            Planeje sem pressa
          </div>
        </div>
      </div>

      <nav className="mt-8 flex flex-1 flex-col gap-1">
        {NAV_PRINCIPAL.map((item) => (
          <NavLink
            key={item.para}
            to={item.para}
            end={item.exato}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-colors',
                isActive
                  ? 'bg-forest-700 text-cream-50 shadow-soft'
                  : 'text-ink-600 hover:bg-sage-100 hover:text-forest-800',
              )
            }
          >
            <item.icone size={18} />
            {item.rotulo}
          </NavLink>
        ))}

      </nav>

      {viagem && resumo ? (
        <div className="rounded-3xl border border-sage-200/70 bg-cream-100 p-3.5">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-ink-400">
            Viagem ativa
          </div>
          <div className="mt-1 truncate font-display text-base text-forest-900">
            {viagem.nome}
          </div>
          <div className="mt-2.5">
            <ProgressBar valor={resumo.progresso} />
          </div>
          <div className="mt-1.5 text-[11px] text-ink-500">
            {resumo.itensOrganizados}/{resumo.totalItens} itens no roteiro
          </div>
        </div>
      ) : null}

      <div className="mt-3 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => navigate('/nova-viagem')}
          className="flex items-center justify-center gap-2 rounded-full bg-forest-700 px-4 py-2.5 text-sm font-semibold text-cream-50 transition-colors hover:bg-forest-800"
        >
          <Plus size={16} /> Criar viagem
        </button>
        <button
          type="button"
          onClick={() => {
            void sair()
            navigate('/login')
          }}
          className="flex items-center justify-center gap-2 rounded-full px-4 py-2 text-[12px] font-semibold text-ink-500 transition-colors hover:bg-sage-100 hover:text-forest-800"
          title="Encerrar a sessão"
        >
          <LogOut size={14} /> Sair da conta
        </button>
      </div>
    </aside>
  )
}
