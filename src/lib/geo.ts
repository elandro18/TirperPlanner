/**
 * Coordenadas aproximadas por cidade.
 * O mapa NÃO exige endereço/coordenadas — quando não há coordenada exata,
 * posicionamos o registro na cidade com um leve deslocamento determinístico
 * apenas para evitar sobreposição de marcadores.
 */
const CIDADES: Record<string, { lat: number; lng: number }> = {
  gramado: { lat: -29.3785, lng: -50.8727 },
  canela: { lat: -29.3656, lng: -50.8123 },
  'rio de janeiro': { lat: -22.9068, lng: -43.1729 },
  florianopolis: { lat: -27.5949, lng: -48.5482 },
  'florianópolis': { lat: -27.5949, lng: -48.5482 },
  'sao paulo': { lat: -23.5505, lng: -46.6333 },
  'são paulo': { lat: -23.5505, lng: -46.6333 },
  'porto alegre': { lat: -30.0346, lng: -51.2177 },
  salvador: { lat: -12.9777, lng: -38.5016 },
  'belo horizonte': { lat: -19.9167, lng: -43.9345 },
  brasilia: { lat: -15.7939, lng: -47.8828 },
  'brasília': { lat: -15.7939, lng: -47.8828 },
}

export interface PontoGeo {
  lat: number
  lng: number
}

const RAIO_TERRA_KM = 6371

/** Distância em linha reta entre dois pontos (fórmula de Haversine). */
export function distanciaKm(a: PontoGeo, b: PontoGeo): number {
  const paraRadianos = (graus: number) => (graus * Math.PI) / 180
  const dLat = paraRadianos(b.lat - a.lat)
  const dLng = paraRadianos(b.lng - a.lng)
  const latA = paraRadianos(a.lat)
  const latB = paraRadianos(b.lat)

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(latA) * Math.cos(latB) * Math.sin(dLng / 2) ** 2
  return 2 * RAIO_TERRA_KM * Math.asin(Math.min(1, Math.sqrt(h)))
}

/**
 * Estimativa de deslocamento: distância em linha reta corrigida por um fator
 * de desvio urbano e dividida pela velocidade média.
 */
export function tempoDeslocamentoMin(
  km: number,
  velocidadeKmh = 30,
  fatorDesvio = 1.3,
): number {
  if (km <= 0 || velocidadeKmh <= 0) return 0
  return Math.max(1, Math.ceil(((km * fatorDesvio) / velocidadeKmh) * 60))
}

function hash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

export function coordAproximada(
  cidade: string | undefined,
  semente = '',
): { lat: number; lng: number } | undefined {
  if (!cidade) return undefined
  const base = CIDADES[cidade.trim().toLowerCase()]
  if (!base) return undefined
  const h = hash(semente || cidade)
  const dLat = ((h % 100) / 100 - 0.5) * 0.02
  const dLng = (((h >> 7) % 100) / 100 - 0.5) * 0.02
  return { lat: base.lat + dLat, lng: base.lng + dLng }
}
