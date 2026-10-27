import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { definirToken, limparToken, obterToken } from '../api/client'
import {
  encerrarSessao,
  entrar as apiEntrar,
  registrar as apiRegistrar,
  usuarioAtual,
} from '../api/endpoints'
import type { UsuarioApi } from '../api/types'

interface AuthContextValue {
  usuario: UsuarioApi | null
  carregando: boolean
  entrar: (email: string, senha: string) => Promise<void>
  cadastrar: (nome: string, email: string, senha: string) => Promise<void>
  sair: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioApi | null>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    let ativo = true

    if (!obterToken()) {
      setCarregando(false)
      return () => {
        ativo = false
      }
    }

    usuarioAtual()
      .then((dados) => {
        if (ativo) setUsuario(dados)
      })
      .catch(() => {
        limparToken()
        if (ativo) setUsuario(null)
      })
      .finally(() => {
        if (ativo) setCarregando(false)
      })

    return () => {
      ativo = false
    }
  }, [])

  const entrar = useCallback(async (email: string, senha: string) => {
    const sessao = await apiEntrar(email, senha)
    definirToken(sessao.token)
    setUsuario({ id: sessao.id, nome: sessao.nome, email: sessao.email, ativo: true })
  }, [])

  const cadastrar = useCallback(async (nome: string, email: string, senha: string) => {
    const sessao = await apiRegistrar(nome, email, senha)
    definirToken(sessao.token)
    setUsuario({ id: sessao.id, nome: sessao.nome, email: sessao.email, ativo: true })
  }, [])

  const sair = useCallback(async () => {
    try {
      await encerrarSessao()
    } catch {
      /* sessão já inválida */
    }
    limparToken()
    setUsuario(null)
  }, [])

  const valor = useMemo<AuthContextValue>(
    () => ({ usuario, carregando, entrar, cadastrar, sair }),
    [usuario, carregando, entrar, cadastrar, sair],
  )

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const contexto = useContext(AuthContext)
  if (!contexto) {
    throw new Error('useAuth precisa estar dentro de <AuthProvider>')
  }
  return contexto
}
