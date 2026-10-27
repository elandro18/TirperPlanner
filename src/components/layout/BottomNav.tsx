import { NavLink } from 'react-router-dom'
import { NAV_PRINCIPAL } from './nav'
import { cn } from '../../lib/cn'

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-sage-200/80 bg-cream-50/95 backdrop-blur lg:hidden safe-bottom">
      <ul className="mx-auto flex max-w-lg items-stretch justify-between px-2">
        {NAV_PRINCIPAL.map((item) => (
          <li key={item.para} className="flex-1">
            <NavLink
              to={item.para}
              end={item.exato}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-1 px-1 py-2.5 text-[11px] font-semibold transition-colors',
                  isActive ? 'text-forest-800' : 'text-ink-400',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      'grid h-9 w-9 place-items-center rounded-2xl transition-colors',
                      isActive ? 'bg-sage-200 text-forest-800' : 'text-ink-400',
                    )}
                  >
                    <item.icone size={19} />
                  </span>
                  {item.rotuloCurto ?? item.rotulo}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
