// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { FormItemLista } from '../FormItemLista'
import type { TripListaItem } from '../../../types'

afterEach(cleanup)

function item(overrides: Partial<TripListaItem> = {}): TripListaItem {
  return {
    id: 'li1',
    listaId: 'ls1',
    nome: 'Passaporte',
    concluido: false,
    ordem: 0,
    criadaEm: '2026-01-01T00:00:00',
    ...overrides,
  }
}

describe('FormItemLista', () => {
  it('envia nome, valor e foto por URL', async () => {
    const usuario = userEvent.setup()
    const onSalvar = vi.fn()
    render(<FormItemLista onSalvar={onSalvar} />)

    await usuario.type(screen.getByLabelText('Nome do item'), 'Cartão postal')
    await usuario.type(
      screen.getByLabelText('Valor previsto do item'),
      '35',
    )
    await usuario.click(
      screen.getByRole('button', { name: /Foto, endereço e detalhes/i }),
    )
    await usuario.type(
      screen.getByPlaceholderText('https://…/foto.jpg'),
      'https://exemplo.com/foto.jpg',
    )
    await usuario.click(screen.getByRole('button', { name: 'Adicionar item' }))

    expect(onSalvar).toHaveBeenCalledWith(
      expect.objectContaining({
        nome: 'Cartão postal',
        valorPrevisto: 35,
        fotoUrl: 'https://exemplo.com/foto.jpg',
        refeicao: false,
      }),
    )
  })

  it('rejeita URL de foto inválida', async () => {
    const usuario = userEvent.setup()
    const onSalvar = vi.fn()
    render(<FormItemLista onSalvar={onSalvar} />)

    await usuario.type(screen.getByLabelText('Nome do item'), 'Item')
    await usuario.click(
      screen.getByRole('button', { name: /Foto, endereço e detalhes/i }),
    )
    await usuario.type(
      screen.getByPlaceholderText('https://…/foto.jpg'),
      'foto.jpg',
    )
    await usuario.click(screen.getByRole('button', { name: 'Adicionar item' }))

    expect(screen.getByText('Informe uma URL http(s) válida')).toBeTruthy()
    expect(onSalvar).not.toHaveBeenCalled()
  })

  it('envia dados de refeição, endereço e foto do prato', async () => {
    const usuario = userEvent.setup()
    const onSalvar = vi.fn()
    render(<FormItemLista onSalvar={onSalvar} />)

    await usuario.type(screen.getByLabelText('Nome do item'), 'Pastel de Belém')
    await usuario.click(
      screen.getByRole('button', { name: /Foto, endereço e detalhes/i }),
    )
    await usuario.click(screen.getByLabelText('Refeição / restaurante'))
    await usuario.type(screen.getByLabelText(/Endereço/), 'Rua do Pastel, 10')
    await usuario.type(screen.getByLabelText(/Cidade/), 'Lisboa')
    await usuario.type(
      screen.getByPlaceholderText('https://…/prato.jpg'),
      'https://exemplo.com/prato.jpg',
    )
    await usuario.click(screen.getByRole('button', { name: 'Adicionar item' }))

    expect(onSalvar).toHaveBeenCalledWith(
      expect.objectContaining({
        nome: 'Pastel de Belém',
        refeicao: true,
        endereco: 'Rua do Pastel, 10',
        cidade: 'Lisboa',
        fotoPratoUrl: 'https://exemplo.com/prato.jpg',
      }),
    )
  })

  it('preserva a foto existente ao editar sem alterar a URL', async () => {
    const usuario = userEvent.setup()
    const onSalvar = vi.fn()
    render(
      <FormItemLista
        item={item({ fotoUrl: 'https://exemplo.com/antiga.jpg' })}
        rotuloAcao="Salvar item"
        onSalvar={onSalvar}
      />,
    )

    await usuario.click(screen.getByRole('button', { name: 'Salvar item' }))

    expect(onSalvar).toHaveBeenCalledWith(
      expect.objectContaining({
        nome: 'Passaporte',
        fotoUrl: 'https://exemplo.com/antiga.jpg',
      }),
    )
  })
})
