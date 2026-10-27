import { cn } from '../../lib/cn'

export function Logo({
  className,
  tamanho = 32,
}: {
  className?: string
  tamanho?: number
}) {
  return (
    <span
      className={cn(
        'grid place-items-center rounded-2xl bg-forest-700 text-cream-50',
        className,
      )}
      style={{ width: tamanho, height: tamanho }}
      aria-hidden
    >
      <svg
        width={tamanho * 0.55}
        height={tamanho * 0.55}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 21s-6-5.3-6-10a6 6 0 0 1 12 0c0 4.7-6 10-6 10Z" />
        <circle cx="12" cy="11" r="2.2" />
      </svg>
    </span>
  )
}
