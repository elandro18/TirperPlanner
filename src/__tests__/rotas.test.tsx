// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import App from '../App'

function abrirEm(rota: string) {
  window.history.pushState({}, '', rota)
}

beforeEach(() => localStorage.clear())
afterEach(cleanup)

describe('Rotas', () => {
  it('a landing é pública em "/" (sem sessão)', async () => {
    abrirEm('/')
    render(<App />)

    const titulo = await screen.findByRole('heading', { level: 1 })
    expect(titulo.textContent).toMatch(/Sua viagem inteira, organizada dia a dia\./)
  })

  it('URL desconhecida redireciona para a landing (CA8)', async () => {
    abrirEm('/qualquer-coisa')
    render(<App />)

    const titulo = await screen.findByRole('heading', { level: 1 })
    expect(titulo.textContent).toMatch(/Sua viagem inteira, organizada dia a dia\./)
    expect(window.location.pathname).toBe('/')
  })

  it('rota protegida sem sessão redireciona para /login (CA6)', async () => {
    abrirEm('/roteiro')
    render(<App />)

    expect(await screen.findByRole('heading', { name: 'Entrar' })).toBeTruthy()
    expect(window.location.pathname).toBe('/login')
  })
})
