import { useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { Logo } from './Logo'
import { useTrip } from '../../store/TripStore'
import { viagemAtiva } from '../../lib/derive'

function iniciais(nome: string) {
  return nome
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
}

export function AppShell() {
  const { state } = useTrip()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const viagem = viagemAtiva(state)

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])

  return (
    <div className="flex min-h-svh bg-cream-100">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar — mobile */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-sage-200/70 bg-cream-100/90 px-4 py-3 backdrop-blur lg:hidden">
          <div className="flex min-w-0 items-center gap-2.5">
            <Logo tamanho={34} />
            <div className="min-w-0 leading-tight">
              <div className="font-display text-base text-forest-900">
                Trip Planner
              </div>
              {viagem ? (
                <div className="truncate text-[11px] font-medium text-ink-400">
                  {viagem.nome}
                </div>
              ) : null}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/nova-viagem')}
              aria-label="Criar viagem"
              className="grid h-9 w-9 place-items-center rounded-full bg-forest-700 text-cream-50"
            >
              <Plus size={18} />
            </button>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-sage-200 text-[12px] font-bold text-forest-800">
              {iniciais(state.usuario.nome)}
            </span>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-5 sm:px-6 lg:pb-12 lg:pt-8">
          <Outlet />
        </main>
      </div>

      <BottomNav />
    </div>
  )
}
