import { useId, useState } from 'react'
import { ArrowRight, Check, ChevronDown } from 'lucide-react'
import { Section } from '../components/landing/Section'
import { FeatureCard } from '../components/landing/FeatureCard'
import { ButtonLink } from '../components/landing/ButtonLink'
import { LandingHeader } from '../components/landing/LandingHeader'
import { LandingFooter } from '../components/landing/LandingFooter'
import { LANDING } from '../content/landing'
import { cn } from '../lib/cn'

export function Landing() {
  return (
    <div className="min-h-svh bg-cream-100 text-ink-900">
      <LandingHeader />

      <main>
        <Hero />
        <Problema />
        <ComoFunciona />
        <Funcionalidades />
        {LANDING.destaques.map((destaque, indice) => (
          <DestaqueSecao key={destaque.titulo} destaque={destaque} indice={indice} />
        ))}
        <ParaQuem />
        <Faq />
        <CtaFinal />
      </main>

      <LandingFooter />
    </div>
  )
}

function Hero() {
  return (
    <Section className="overflow-hidden border-b border-sage-200/50">
      <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-sage-700">
            {LANDING.hero.eyebrow}
          </p>
          <h1 className="mt-4 text-4xl leading-[1.06] text-balance text-forest-900 sm:text-5xl lg:text-6xl">
            {LANDING.hero.titulo}
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-ink-600 sm:text-base">
            {LANDING.hero.subtitulo}
          </p>

          <div className="mt-8 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center">
            <ButtonLink
              para="/cadastro"
              tamanho="lg"
              bloco
              className="sm:w-auto"
              iconeFim={<ArrowRight size={18} aria-hidden />}
            >
              {LANDING.hero.ctaPrimario}
            </ButtonLink>
            <ButtonLink para="#como-funciona" variante="creme" tamanho="lg">
              {LANDING.hero.ctaSecundario}
            </ButtonLink>
          </div>

          <p className="mt-4 text-[12px] font-medium text-ink-500">
            {LANDING.hero.microcopy}
          </p>
        </div>

        <RoteiroDecorativo />
      </div>
    </Section>
  )
}

/**
 * Bloco puramente decorativo (CSS + ícones) que sugere o roteiro por dia.
 * Sem `<img>` — a v1 da landing não usa imagens.
 */
function RoteiroDecorativo() {
  return (
    <div aria-hidden className="hidden sm:block">
      <div className="rounded-4xl border border-sage-200/80 bg-cream-50 p-4 shadow-card sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-ink-400">
            Roteiro
          </span>
          <span className="rounded-full bg-sage-100 px-2.5 py-1 text-[11px] font-semibold text-forest-700">
            Sua viagem
          </span>
        </div>

        <div className="mt-4 grid gap-3">
          {LANDING.hero.diasDecorativos.map((dia, indice) => (
            <div
              key={dia}
              className="rounded-2xl border border-sage-200/70 bg-cream-100/70 p-3"
            >
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-xl bg-forest-700 text-[11px] font-bold text-cream-50">
                  {indice + 1}
                </span>
                <span className="text-[12px] font-semibold text-forest-800">{dia}</span>
              </div>
              <div className="mt-2.5 space-y-1.5">
                <span className="block h-2 w-4/5 rounded-full bg-sage-200" />
                <span className="block h-2 w-3/5 rounded-full bg-sage-200/80" />
                {indice === 1 ? (
                  <span className="block h-2 w-2/5 rounded-full bg-clay-200" />
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Problema() {
  return (
    <Section>
      <div className="max-w-3xl">
        <h2 className="text-2xl leading-snug text-balance text-forest-900 sm:text-3xl lg:text-4xl">
          {LANDING.problema.titulo}
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-ink-600 sm:text-base">
          {LANDING.problema.texto}
        </p>
      </div>
    </Section>
  )
}

function ComoFunciona() {
  return (
    <Section
      id={LANDING.comoFunciona.id}
      className="border-y border-sage-200/50 bg-cream-50"
    >
      <h2 className="max-w-2xl text-2xl leading-snug text-balance text-forest-900 sm:text-3xl lg:text-4xl">
        {LANDING.comoFunciona.titulo}
      </h2>

      <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {LANDING.comoFunciona.passos.map((passo) => (
          <li
            key={passo.numero}
            className="rounded-3xl border border-sage-200/70 bg-cream-100/70 p-5"
          >
            <span className="grid h-9 w-9 place-items-center rounded-2xl bg-forest-700 font-display text-base text-cream-50">
              {passo.numero}
            </span>
            <h3 className="mt-3 text-lg leading-snug text-forest-900">
              {passo.titulo}
            </h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-ink-600">
              {passo.descricao}
            </p>
          </li>
        ))}
      </ol>
    </Section>
  )
}

function Funcionalidades() {
  return (
    <Section>
      <h2 className="max-w-2xl text-2xl leading-snug text-balance text-forest-900 sm:text-3xl lg:text-4xl">
        {LANDING.features.titulo}
      </h2>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LANDING.features.itens.map((feature) => (
          <FeatureCard
            key={feature.titulo}
            icone={feature.icone}
            titulo={feature.titulo}
            descricao={feature.descricao}
          />
        ))}
      </div>
    </Section>
  )
}

function DestaqueSecao({
  destaque,
  indice,
}: {
  destaque: (typeof LANDING.destaques)[number]
  indice: number
}) {
  const Icone = destaque.icone
  const textoADireita = indice % 2 === 1

  return (
    <Section>
      <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
        <div className={cn('min-w-0', textoADireita && 'lg:order-2')}>
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-sage-100 text-forest-700">
            <Icone size={20} strokeWidth={1.8} aria-hidden />
          </span>
          <h2 className="mt-4 text-2xl leading-snug text-balance text-forest-900 sm:text-3xl lg:text-4xl">
            {destaque.titulo}
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-600 sm:text-base">
            {destaque.descricao}
          </p>
        </div>

        <div
          className={cn(
            'rounded-3xl border border-sage-200/70 bg-cream-50 p-5 shadow-soft sm:p-6',
            textoADireita && 'lg:order-1',
          )}
        >
          <ul className="space-y-3">
            {destaque.pontos.map((ponto) => (
              <li key={ponto} className="flex items-start gap-2.5 text-[13px] text-ink-700">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-sage-100 text-forest-700">
                  <Check size={13} strokeWidth={2.4} aria-hidden />
                </span>
                {ponto}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  )
}

function ParaQuem() {
  return (
    <Section className="border-y border-sage-200/50 bg-cream-50">
      <h2 className="max-w-2xl text-2xl leading-snug text-balance text-forest-900 sm:text-3xl lg:text-4xl">
        {LANDING.paraQuem.titulo}
      </h2>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {LANDING.paraQuem.itens.map((publico) => {
          const Icone = publico.icone
          return (
            <article
              key={publico.titulo}
              className="rounded-3xl border border-sage-200/70 bg-cream-100/70 p-5"
            >
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-forest-700 text-cream-50">
                <Icone size={18} strokeWidth={1.8} aria-hidden />
              </span>
              <h3 className="mt-3 text-lg leading-snug text-forest-900">
                {publico.titulo}
              </h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-ink-600">
                {publico.descricao}
              </p>
            </article>
          )
        })}
      </div>
    </Section>
  )
}

function Faq() {
  const [aberto, setAberto] = useState<number | null>(null)
  const idBase = useId()

  return (
    <Section>
      <h2 className="text-2xl leading-snug text-forest-900 sm:text-3xl lg:text-4xl">
        {LANDING.faq.titulo}
      </h2>

      <ul className="mt-6 max-w-3xl space-y-2.5">
        {LANDING.faq.itens.map((item, indice) => {
          const expandido = aberto === indice
          const idResposta = `${idBase}-resposta-${indice}`
          const idBotao = `${idBase}-pergunta-${indice}`

          return (
            <li
              key={item.pergunta}
              className="overflow-hidden rounded-2xl border border-sage-200/70 bg-cream-50"
            >
              <h3>
                <button
                  type="button"
                  id={idBotao}
                  aria-expanded={expandido}
                  aria-controls={idResposta}
                  onClick={() => setAberto(expandido ? null : indice)}
                  className="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left text-[14px] font-semibold text-forest-900 hover:bg-cream-100 sm:px-5"
                >
                  <span>{item.pergunta}</span>
                  <ChevronDown
                    size={18}
                    aria-hidden
                    className={cn(
                      'shrink-0 text-ink-400 transition-transform duration-200',
                      expandido && 'rotate-180',
                    )}
                  />
                </button>
              </h3>
              <div
                id={idResposta}
                role="region"
                aria-labelledby={idBotao}
                hidden={!expandido}
                className="px-4 pb-4 text-[13px] leading-relaxed text-ink-600 sm:px-5"
              >
                {item.resposta}
              </div>
            </li>
          )
        })}
      </ul>
    </Section>
  )
}

function CtaFinal() {
  return (
    <Section className="bg-forest-900 text-cream-50">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-display text-2xl leading-snug text-balance text-cream-50 sm:text-3xl lg:text-4xl">
          {LANDING.ctaFinal.titulo}
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-cream-100 sm:text-base">
          {LANDING.ctaFinal.texto}
        </p>
        <div className="mt-7 flex justify-center">
          <ButtonLink
            para="/cadastro"
            variante="creme"
            tamanho="lg"
            iconeFim={<ArrowRight size={18} aria-hidden />}
          >
            {LANDING.ctaFinal.botao}
          </ButtonLink>
        </div>
        <p className="mt-4 text-[12px] font-medium text-cream-200/90">
          {LANDING.ctaFinal.microcopy}
        </p>
      </div>
    </Section>
  )
}
