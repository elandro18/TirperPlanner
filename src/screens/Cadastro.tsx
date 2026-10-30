import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { mensagemDeErro } from '../api/client'
import { Button } from '../components/ui/Button'
import { Campo, Entrada } from '../components/ui/Field'
import { Logo } from '../components/layout/Logo'
import { useAuth } from '../auth/AuthProvider'

export function Cadastro() {
  const { cadastrar } = useAuth()
  const navigate = useNavigate()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmacao, setConfirmacao] = useState('')
  const [erro, setErro] = useState<string>()
  const [enviando, setEnviando] = useState(false)

  async function submeter(evento: FormEvent) {
    evento.preventDefault()
    setErro(undefined)

    if (senha.length < 8) {
      setErro('A senha deve ter pelo menos 8 caracteres.')
      return
    }
    if (senha !== confirmacao) {
      setErro('As senhas não conferem.')
      return
    }

    setEnviando(true)
    try {
      await cadastrar(nome, email, senha)
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
          <h1 className="text-2xl text-forest-900">Criar conta</h1>
          <p className="mt-1 text-[13px] text-ink-500">
            Suas viagens ficam salvas na sua conta.
          </p>

          <form className="mt-5 space-y-4" onSubmit={submeter}>
            <Campo rotulo="Nome" obrigatorio>
              <Entrada
                autoComplete="name"
                value={nome}
                onChange={(evento) => setNome(evento.target.value)}
                placeholder="Seu nome"
                required
              />
            </Campo>

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

            <Campo rotulo="Senha" obrigatorio dica="Mínimo de 8 caracteres">
              <Entrada
                type="password"
                autoComplete="new-password"
                value={senha}
                onChange={(evento) => setSenha(evento.target.value)}
                required
              />
            </Campo>

            <Campo rotulo="Confirmar senha" obrigatorio>
              <Entrada
                type="password"
                autoComplete="new-password"
                value={confirmacao}
                onChange={(evento) => setConfirmacao(evento.target.value)}
                required
              />
            </Campo>

            {erro ? (
              <p className="rounded-2xl bg-clay-100 px-3 py-2 text-[13px] font-medium text-clay-700">
                {erro}
              </p>
            ) : null}

            <Button type="submit" bloco disabled={enviando}>
              {enviando ? 'Criando conta…' : 'Criar conta'}
            </Button>
          </form>

          <p className="mt-4 text-center text-[13px] text-ink-500">
            Já tem conta?{' '}
            <Link to="/login" className="font-semibold text-forest-700 hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
