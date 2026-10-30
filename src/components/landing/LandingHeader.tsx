import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Logo } from '../layout/Logo'
import { ButtonLink } from './ButtonLink'
import { LANDING } from '../../content/landing'
import { useAuth } from '../../auth/AuthProvider'

/**
 * Cabeçalho público da landing. Reage apenas a `useAuth().usuario`:
 * visitante vê "Entrar" + "Criar conta grátis"; com sessão vê o atalho
 * para as viagens.
 */
export function LandingHeader() {
  const { usuario } = useAuth()

  return (
    <header className="sticky top-0 z-30 border-b border-sage-200/70 bg-cream-100/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link
          to="/"
          className="flex min-w-0 items-center gap-2.5 rounded-2xl"
          aria-label={`${LANDING.marca} — página inicial`}
        >
          <Logo tamanho={34} />
          <span className="truncate font-display text-lg text-forest-900">
            {LANDING.marca}
          </span>
        </Link>

        <nav aria-label="Ações da conta" className="flex shrink-0 items-center gap-2 sm:gap-3">
          {usuario ? (
            <ButtonLink
              para="/inicio"
              tamanho="sm"
              iconeFim={<ArrowRight size={16} aria-hidden />}
            >
              {LANDING.header.minhasViagens}
            </ButtonLink>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-full px-2.5 py-2 text-[13px] font-semibold text-forest-700 hover:bg-sage-100 sm:px-3.5 sm:text-sm"
              >
                {LANDING.header.entrar}
              </Link>
              <ButtonLink para="/cadastro" tamanho="sm">
                {LANDING.header.criarConta}
              </ButtonLink>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
