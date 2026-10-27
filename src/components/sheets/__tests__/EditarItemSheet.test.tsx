// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { TripProvider } from '../../../store/TripStore'
import { EditarItemSheet } from '../EditarItemSheet'

beforeEach(() => localStorage.clear())
afterEach(cleanup)

describe('EditarItemSheet', () => {
  it('abre preenchido com os dados atuais e cancela sem salvar', async () => {
    const usuario = userEvent.setup()
    const onFechar = vi.fn()

    render(
      <TripProvider>
        <EditarItemSheet
          tipo="LOCAL"
          itemId="l1"
          viagemId="v1"
          aoFechar={onFechar}
        />
      </TripProvider>,
    )

    expect(screen.getByDisplayValue('Lago Negro')).toBeTruthy()
    expect(screen.getByDisplayValue('10:30')).toBeTruthy()

    await usuario.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(onFechar).toHaveBeenCalled()
  })

  it('mantém o modal aberto quando a validação falha', async () => {
    const usuario = userEvent.setup()
    const onFechar = vi.fn()

    render(
      <TripProvider>
        <EditarItemSheet
          tipo="LOCAL"
          itemId="l1"
          viagemId="v1"
          aoFechar={onFechar}
        />
      </TripProvider>,
    )

    const nome = screen.getByDisplayValue('Lago Negro')
    await usuario.clear(nome)
    await usuario.click(
      screen.getByRole('button', { name: 'Salvar alterações' }),
    )

    expect(screen.getByText('Informe o nome do local')).toBeTruthy()
    expect(onFechar).not.toHaveBeenCalled()
  })

  it('salva e fecha o modal', async () => {
    const usuario = userEvent.setup()
    const onFechar = vi.fn()

    render(
      <TripProvider>
        <EditarItemSheet
          tipo="LOCAL"
          itemId="l1"
          viagemId="v1"
          aoFechar={onFechar}
        />
      </TripProvider>,
    )

    const nome = screen.getByDisplayValue('Lago Negro')
    await usuario.clear(nome)
    await usuario.type(nome, 'Lago Negro revisado')
    await usuario.click(
      screen.getByRole('button', { name: 'Salvar alterações' }),
    )

    expect(onFechar).toHaveBeenCalled()
  })
})
