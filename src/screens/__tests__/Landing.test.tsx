// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '../../auth/AuthProvider'
import { Landing } from '../Landing'

function renderLanding() {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/']}>
        <Landing />
      </MemoryRouter>
    </AuthProvider>,
  )
}

beforeEach(() => localStorage.clear())
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('Landing', () => {
  it('exibe a landing sem disparar requisição de sessão (sem token)', () => {
    const fetchEspiao = vi.fn()
    vi.stubGlobal('fetch', fetchEspiao)

    renderLanding()

    expect(screen.getByRole('heading', { level: 1 })).toBeTruthy()
    expect(fetchEspiao).not.toHaveBeenCalled()
  })

  it('renderiza o H1 do hero (único h1 da página)', () => {
    renderLanding()

    const titulos = screen.getAllByRole('heading', { level: 1 })
    expect(titulos).toHaveLength(1)
    expect(titulos[0].textContent).toMatch(/Sua viagem inteira, organizada dia a dia\./)
  })

  it('aponta o CTA "Criar conta grátis" para /cadastro', () => {
    renderLanding()

    const ctas = screen.getAllByRole('link', { name: 'Criar conta grátis' })
    expect(ctas.length).toBeGreaterThan(0)
    for (const cta of ctas) {
      expect(cta.getAttribute('href')).toBe('/cadastro')
    }
  })

  it('mostra Entrar e Criar conta no header público', () => {
    renderLanding()

    const entrar = screen.getAllByRole('link', { name: 'Entrar' })
    expect(entrar.length).toBeGreaterThan(0)
    for (const link of entrar) {
      expect(link.getAttribute('href')).toBe('/login')
    }
  })

  it('não renderiza nenhuma imagem (v1 sem imagens)', () => {
    const { container } = renderLanding()

    expect(container.querySelectorAll('img')).toHaveLength(0)
  })

  it('não contém "grátis para sempre"', () => {
    renderLanding()

    expect(document.body.textContent?.toLowerCase()).not.toContain('grátis para sempre')
  })

  it('FAQ abre e fecha pelo teclado com aria-expanded correto', async () => {
    const usuario = userEvent.setup()
    renderLanding()

    const botao = screen.getByRole('button', {
      name: 'O Trip Planner é gratuito?',
    })

    expect(botao.getAttribute('aria-expanded')).toBe('false')

    botao.focus()
    await usuario.keyboard('{Enter}')
    expect(botao.getAttribute('aria-expanded')).toBe('true')

    await usuario.keyboard('{Enter}')
    expect(botao.getAttribute('aria-expanded')).toBe('false')
  })
})
