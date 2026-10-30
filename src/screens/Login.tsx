import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { mensagemDeErro } from '../api/client'
import { Button } from '../components/ui/Button'
import { Campo, Entrada } from '../components/ui/Field'
import { Logo } from '../components/layout/Logo'
import { useAuth } from '../auth/AuthProvider'

export function Login() {
  const { entrar } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState<string>()
  const [enviando, setEnviando] = useState(false)

  async function submeter(evento: FormEvent) {
    evento.preventDefault()
    setErro(undefined)
    setEnviando(true)
    try {
      await entrar(email, senha)
      navigate('/inicio', { replace: true })
    } catch (falha) {
      setErro(mensagemDeErro(falha))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="grid min-h-svh place-items-center bg-cream-100 px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center gap-2.5 px-1">
          <Logo tamanho={40} />
          <div className="leading-tight">
            <div className="font-display text-lg text-forest-900">Trip Planner</div>
            <div className="text-[11px] font-medium uppercase tracking-widest text-ink-400">
              Planeje sem pressa
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-sage-200/70 bg-cream-50 p-6 shadow-card">
          <h1 className="text-2xl text-forest-900">Entrar</h1>
          <p className="mt-1 text-[13px] text-ink-500">
            Acesse suas viagens, roteiros e listas.
          </p>

          <form className="mt-5 space-y-4" onSubmit={submeter}>
            <Campo rotulo="E-mail" obrigatorio>
              <Entrada
                type="email"
                autoComplete="email"
                value={email}
                onChange={(evento) => setEmail(evento.target.value)}
                placeholder="voce@exemplo.com"
                required
              />
            </Campo>

            <Campo rotulo="Senha" obrigatorio>
              <Entrada
                type="password"
                autoComplete="current-password"
                value={senha}
                onChange={(evento) => setSenha(evento.target.value)}
                placeholder="Sua senha"
                required
              />
            </Campo>

            {erro ? (
              <p className="rounded-2xl bg-clay-100 px-3 py-2 text-[13px] font-medium text-clay-700">
                {erro}
              </p>
            ) : null}

            <Button type="submit" bloco disabled={enviando}>
              {enviando ? 'Entrando…' : 'Entrar'}
            </Button>
          </form>

          <p className="mt-4 text-center text-[13px] text-ink-500">
            Ainda não tem conta?{' '}
            <Link to="/cadastro" className="font-semibold text-forest-700 hover:underline">
              Criar conta
            </Link>
          </p>
        </div>

        <p className="mt-4 text-center text-[12px] text-ink-400">
          Conta demo: demo@tripplanner.local / demo1234
        </p>
      </div>
    </div>
  )
}
