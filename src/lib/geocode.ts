/**
 * Geocodificação pública com OpenStreetMap — sem chave de API e sem custo.
 *
 * Provedores:
 *  - Photon (photon.komoot.io): busca/autocomplete sobre dados do OSM.
 *  - Nominatim (nominatim.openstreetmap.org): fallback de busca por endereço.
 *
 * Regra de ouro: coordenadas só são associadas a um registro a partir de uma
 * sugestão ESCOLHIDA pelo usuário (ou de uma ação explícita). Nunca gravamos
 * coordenadas "adivinhadas" silenciosamente.
 */

export interface Coordenada {
  lat: number
  lng: number
}

export interface SugestaoEndereco {
  rotulo: string
  cidade?: string
  lat: number
  lng: number
}

interface PhotonFeature {
  properties?: {
    name?: string
    street?: string
    housenumber?: string
    district?: string
    city?: string
    town?: string
    village?: string
    county?: string
    state?: string
    country?: string
  }
  geometry?: { coordinates?: [number, number] }
}

interface NominatimResultado {
  display_name: string
  lat: string
  lon: string
  address?: {
    city?: string
    town?: string
    village?: string
    municipality?: string
    state?: string
  }
}

function cidadePhoton(p: PhotonFeature['properties']): string | undefined {
  return p?.city ?? p?.town ?? p?.village ?? p?.county
}

async function buscarNoPhoton(
  texto: string,
  sinal?: AbortSignal,
): Promise<SugestaoEndereco[]> {
  const url =
    'https://photon.komoot.io/api/' +
    `?q=${encodeURIComponent(texto)}&limit=6`
  const resposta = await fetch(url, {
    signal: sinal,
    headers: { Accept: 'application/json' },
  })
  if (!resposta.ok) {
    throw new Error('Não foi possível consultar o serviço de mapas agora.')
  }
  const dados = (await resposta.json()) as { features?: PhotonFeature[] }

  return (dados.features ?? []).flatMap((feature) => {
    const p = feature.properties ?? {}
    const coords = feature.geometry?.coordinates
    if (!coords || coords.length < 2) return []

    const linha1 = p.housenumber
      ? `${p.street ?? p.name ?? ''} ${p.housenumber}`.trim()
      : (p.name ?? p.street)
    const rotulo = [
      linha1,
      cidadePhoton(p),
      p.district,
      p.state,
      p.country,
    ]
      .filter(Boolean)
      .join(', ')
    if (!rotulo) return []

    return [
      {
        rotulo,
        cidade: cidadePhoton(p),
        lat: coords[1],
        lng: coords[0],
      },
    ]
  })
}

async function buscarNoNominatim(
  texto: string,
  sinal?: AbortSignal,
): Promise<SugestaoEndereco[]> {
  const url =
    'https://nominatim.openstreetmap.org/search' +
    `?format=jsonv2&addressdetails=1&limit=6&accept-language=pt-BR&q=${encodeURIComponent(texto)}`
  const resposta = await fetch(url, {
    signal: sinal,
    headers: { Accept: 'application/json' },
  })
  if (!resposta.ok) {
    throw new Error('Não foi possível consultar o serviço de mapas agora.')
  }
  const dados = (await resposta.json()) as NominatimResultado[]

  return dados.map((d) => ({
    rotulo: d.display_name,
    cidade:
      d.address?.city ??
      d.address?.town ??
      d.address?.village ??
      d.address?.municipality,
    lat: Number(d.lat),
    lng: Number(d.lon),
  }))
}

/**
 * Busca sugestões de endereço usando OpenStreetMap.
 * Photon é o provedor principal; se não encontrar (ou falhar), usa Nominatim.
 */
export async function buscarEnderecos(
  texto: string,
  sinal?: AbortSignal,
): Promise<SugestaoEndereco[]> {
  const consulta = texto.trim()
  if (consulta.length < 3) return []

  try {
    const resultados = await buscarNoPhoton(consulta, sinal)
    if (resultados.length) return resultados
  } catch (erro) {
    if (sinal?.aborted) throw erro
    /* segue para o fallback */
  }

  return buscarNoNominatim(consulta, sinal)
}

/** Link para abrir a localização no OpenStreetMap. */
export function linkOpenStreetMap(p?: {
  lat?: number
  lng?: number
  endereco?: string
  cidade?: string
}): string | null {
  if (p?.lat != null && p?.lng != null) {
    return `https://www.openstreetmap.org/?mlat=${p.lat}&mlon=${p.lng}#map=17/${p.lat}/${p.lng}`
  }
  const consulta = [p?.endereco, p?.cidade].filter(Boolean).join(', ')
  if (consulta) {
    return `https://www.openstreetmap.org/search?query=${encodeURIComponent(consulta)}`
  }
  return null
}
