import type { LucideIcon } from 'lucide-react'

interface Props {
  icone: LucideIcon
  titulo: string
  descricao: string
}

export function FeatureCard({ icone: Icone, titulo, descricao }: Props) {
  return (
    <article className="rounded-3xl border border-sage-200/70 bg-cream-50 p-5 shadow-soft">
      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-sage-100 text-forest-700">
        <Icone size={20} strokeWidth={1.8} aria-hidden />
      </span>
      <h3 className="mt-4 text-lg leading-snug text-forest-900">{titulo}</h3>
      <p className="mt-1.5 text-[13px] leading-relaxed text-ink-600">{descricao}</p>
    </article>
  )
}
