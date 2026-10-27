import { describe, expect, it } from 'vitest'
import { buscarEnderecos, linkOpenStreetMap } from '../geocode'

describe('linkOpenStreetMap', () => {
  it('usa as coordenadas quando disponíveis', () => {
    expect(linkOpenStreetMap({ lat: -29.37, lng: -50.87 })).toBe(
      'https://www.openstreetmap.org/?mlat=-29.37&mlon=-50.87#map=17/-29.37/-50.87',
    )
  })

  it('cai para o endereço textual sem coordenadas', () => {
    expect(linkOpenStreetMap({ endereco: 'Av. Borges, 100', cidade: 'Gramado' })).toBe(
      'https://www.openstreetmap.org/search?query=Av.%20Borges%2C%20100%2C%20Gramado',
    )
  })

  it('retorna null sem dados de localização', () => {
    expect(linkOpenStreetMap({})).toBeNull()
    expect(linkOpenStreetMap()).toBeNull()
  })
})

describe('buscarEnderecos', () => {
  it('não consulta o serviço para consultas curtas', async () => {
    await expect(buscarEnderecos('ab')).resolves.toEqual([])
    await expect(buscarEnderecos('   ')).resolves.toEqual([])
  })
})
