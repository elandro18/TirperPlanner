// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { TripProvider } from '../../../store/TripStore'
import { SeletorDia } from '../SeletorDia'

beforeEach(() => localStorage.clear())
afterEach(cleanup)

describe('SeletorDia', () => {
  it('pede confirmação ao reutilizar o item em outro dia', async () => {
    const usuario = userEvent.setup()
    const onEscolher = vi.fn()

    render(
      <TripProvider>
        <SeletorDia
          aberto
          aoFechar={() => undefined}
          viagemId="v1"
          tipoItem="LOCAL"
          itemId="l1"
          titulo="Lago Negro"
          onEscolher={onEscolher}
        />
      </TripProvider>,
    )

    await usuario.click(screen.getByText(/13 de maio/))

    expect(
      screen.getByText(
        'Este item já está adicionado ao roteiro de outro dia. Deseja adicioná-lo também a este dia?',
      ),
    ).toBeTruthy()
    expect(onEscolher).not.toHaveBeenCalled()

    await usuario.click(
      screen.getByRole('button', { name: 'Adicionar mesmo assim' }),
    )

    expect(onEscolher).toHaveBeenCalledWith('v1-d2')
  })

  it('permite cancelar a reutilização sem alterar o dia', async () => {
    const usuario = userEvent.setup()
    const onEscolher = vi.fn()

    render(
      <TripProvider>
        <SeletorDia
          aberto
          aoFechar={() => undefined}
          viagemId="v1"
          tipoItem="LOCAL"
          itemId="l1"
          titulo="Lago Negro"
          onEscolher={onEscolher}
        />
      </TripProvider>,
    )

    await usuario.click(screen.getByText(/13 de maio/))
    await usuario.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(onEscolher).not.toHaveBeenCalled()
  })

  it('não pede confirmação para item ainda não usado e mantém o mesmo dia bloqueado', async () => {
    const usuario = userEvent.setup()
    const onEscolher = vi.fn()

    render(
      <TripProvider>
        <SeletorDia
          aberto
          aoFechar={() => undefined}
          viagemId="v1"
          tipoItem="LOCAL"
          itemId="l2"
          titulo="Museu de Cera"
          onEscolher={onEscolher}
        />
      </TripProvider>,
    )

    await usuario.click(screen.getByText(/13 de maio/))
    expect(onEscolher).toHaveBeenCalledWith('v1-d2')
  })

  it('desabilita o dia em que o item já está', () => {
    render(
      <TripProvider>
        <SeletorDia
          aberto
          aoFechar={() => undefined}
          viagemId="v1"
          tipoItem="LOCAL"
          itemId="l1"
          titulo="Lago Negro"
          onEscolher={() => undefined}
        />
      </TripProvider>,
    )

    const botao = screen.getByText(/12 de maio/).closest('button')
    expect((botao as HTMLButtonElement).disabled).toBe(true)
  })
})
