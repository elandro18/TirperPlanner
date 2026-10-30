import { Link } from 'react-router-dom'
import { Logo } from '../layout/Logo'
import { LANDING } from '../../content/landing'

/** Ano do rodapé resolvido uma vez no carregamento do módulo. */
const ANO = new Date().getFullYear()

export function LandingFooter() {
  return (
    <footer className="border-t border-sage-200/70 bg-cream-50">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-2.5">
            <Logo tamanho={34} />
            <div className="leading-tight">
              <div className="font-display text-base text-forest-900">
                {LANDING.marca}
              </div>
              <div className="text-[12px] text-ink-500">{LANDING.tagline}</div>
            </div>
          </div>

          <nav aria-label="Links do rodapé">
            <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {LANDING.footer.links.map((link) =>
                link.para.startsWith('#') ? (
                  <li key={link.para}>
                    <a
                      href={link.para}
                      className="rounded-full text-[13px] font-semibold text-forest-700 hover:underline"
                    >
                      {link.rotulo}
                    </a>
                  </li>
                ) : (
                  <li key={link.para}>
                    <Link
                      to={link.para}
                      className="rounded-full text-[13px] font-semibold text-forest-700 hover:underline"
                    >
                      {link.rotulo}
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </nav>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-sage-200/70 pt-5 text-[12px] text-ink-500 sm:flex-row sm:items-center sm:justify-between">
          <span>{LANDING.footer.creditos}</span>
          <span>© {ANO} {LANDING.marca}.</span>
        </div>
      </div>
    </footer>
  )
}
