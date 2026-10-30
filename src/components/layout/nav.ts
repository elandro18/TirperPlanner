import {
  CalendarDays,
  Home,
  ListChecks,
  ListTodo,
  Luggage,
  Map,
  type LucideIcon,
} from 'lucide-react'

export interface ItemNav {
  para: string
  rotulo: string
  /** rótulo curto para a bottom nav (mobile) */
  rotuloCurto?: string
  icone: LucideIcon
  exato?: boolean
}

export const NAV_PRINCIPAL: ItemNav[] = [
  {
    para: '/inicio',
    rotulo: 'Início',
    rotuloCurto: 'Início',
    icone: Home,
    exato: true,
  },
  {
    para: '/planejamento',
    rotulo: 'Planejamento',
    rotuloCurto: 'Planejar',
    icone: ListChecks,
  },
  { para: '/roteiro', rotulo: 'Roteiro', rotuloCurto: 'Roteiro', icone: CalendarDays },
  { para: '/mapa', rotulo: 'Mapa', rotuloCurto: 'Mapa', icone: Map },
  { para: '/viagem', rotulo: 'Viagem', rotuloCurto: 'Viagem', icone: Luggage },
  { para: '/listas', rotulo: 'Listas', rotuloCurto: 'Listas', icone: ListTodo },
]
