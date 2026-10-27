import { useSearchParams } from 'react-router-dom'
import { useTrip } from '../store/TripStore'
import { viagemAtiva, viagemPorId } from '../lib/derive'

/** Viagem em foco: `?viagem=<id>` ou a viagem ativa. */
export function useViagemAlvo() {
  const { state } = useTrip()
  const [params] = useSearchParams()
  const id = params.get('viagem')
  return (id ? viagemPorId(state, id) : null) ?? viagemAtiva(state)
}
