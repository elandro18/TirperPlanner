// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ConclusaoItemSheet } from '../ConclusaoItemSheet'
import type { TripListaItem } from '../../../types'

afterEach(cleanup)

function item(overrides: Partial<TripListaItem> = {}): TripListaItem {
  return {
    id: 'li1',
    listaId: 'ls1',
    nome: 'Cartão postal',
    valorPrevisto: 30,
    concluido: false,
    ordem: 0,
    criadaEm: '2026-01-01T00:00:00',
    ...overrides,
  }
}

describe('ConclusaoItemSheet', () => {
  it('pré-preenche o previsto e confirma o valor pago', async () => {
    const usuario = userEvent.setup()
    const onConfirmar = vi.fn()
    render(
      <ConclusaoItemSheet
        item={item()}
        aoFechar={() => undefined}
        onConfirmar={onConfirmar}
      />,
    )

    const campo = screen.getByRole('spinbutton')
    expect((campo as HTMLInputElement).value).toBe('30')

    await usuario.clear(campo)
    await usuario.type(campo, '25')
    await usuario.click(screen.getByRole('button', { name: 'Concluir' }))

    expect(onConfirmar).toHaveBeenCalledWith(25)
  })

  it('permite concluir sem informar valor', async () => {
    const usuario = userEvent.setup()
    const onConfirmar = vi.fn()
    render(
      <ConclusaoItemSheet
        item={item()}
        aoFechar={() => undefined}
        onConfirmar={onConfirmar}
      />,
    )

    await usuario.clear(screen.getByRole('spinbutton'))
    await usuario.click(screen.getByRole('button', { name: 'Concluir' }))

    expect(onConfirmar).toHaveBeenCalledWith(undefined)
  })

  it('cancelar não altera o item', async () => {
    const usuario = userEvent.setup()
    const onConfirmar = vi.fn()
    const onFechar = vi.fn()
    render(
      <ConclusaoItemSheet
        item={item()}
        aoFechar={onFechar}
        onConfirmar={onConfirmar}
      />,
    )

    await usuario.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(onFechar).toHaveBeenCalled()
    expect(onConfirmar).not.toHaveBeenCalled()
  })

  it('edita o valor de um item já concluído', async () => {
    const usuario = userEvent.setup()
    const onConfirmar = vi.fn()
    render(
      <ConclusaoItemSheet
        item={item({ concluido: true, valorPago: 20 })}
        aoFechar={() => undefined}
        onConfirmar={onConfirmar}
      />,
    )

    const campo = screen.getByRole('spinbutton')
    expect((campo as HTMLInputElement).value).toBe('20')

    await usuario.clear(campo)
    await usuario.type(campo, '18')
    await usuario.click(screen.getByRole('button', { name: 'Salvar valor' }))

    expect(onConfirmar).toHaveBeenCalledWith(18)
  })

  it('rejeita valor negativo e mantém o modal aberto', async () => {
    const usuario = userEvent.setup()
    const onConfirmar = vi.fn()
    render(
      <ConclusaoItemSheet
        item={item()}
        aoFechar={() => undefined}
        onConfirmar={onConfirmar}
      />,
    )

    const campo = screen.getByRole('spinbutton')
    await usuario.clear(campo)
    await usuario.type(campo, '-1')
    await usuario.click(screen.getByRole('button', { name: 'Concluir' }))

    expect(
      screen.getByText(
        'Informe um valor válido ou deixe vazio para concluir sem valor.',
      ),
    ).toBeTruthy()
    expect(onConfirmar).not.toHaveBeenCalled()
  })
})
