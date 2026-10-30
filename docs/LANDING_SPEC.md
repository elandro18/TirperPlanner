# LANDING_SPEC — Página inicial pública do Trip Planner

**Status:** aprovado para implementação (MVP)
**Base:** `docs/PAGINA_INICIAL.md`
**Implementação:** `rdd-dev` (frontend)
**Escopo:** página pública de apresentação + ajuste de rotas do app

---

## 1. Objetivo

Criar a página inicial pública (landing page) do Trip Planner em `/`, apresentando o produto para visitantes não autenticados, com CTA para cadastro gratuito. A página deve carregar sem exigir login e sem depender de dados da API.

**Resultado esperado:** um visitante entende o que o produto faz, vê as funcionalidades principais e consegue criar conta em até dois cliques.

---

## 2. Decisões fechadas

| # | Decisão | Valor |
|---|---|---|
| D1 | Onde a landing vive | Rota pública `/` no mesmo SPA |
| D2 | Home do app | Passa a ser `/inicio` |
| D3 | Nome oficial | **Trip Planner** |
| D4 | Escopo v1 | Completo (hero, problema, como funciona, features, 3 destaques, para quem, FAQ, CTA final, footer) |
| D5 | Imagens | **Sem imagens na v1** — tipografia, cor e ícones Lucide |
| D6 | CTA principal | **Criar conta grátis** → `/cadastro` |
| D7 | Modelo comercial | Gratuito durante o MVP |

### Regras de copy obrigatórias

- Usar **"Grátis durante o MVP"** ou **"Criar conta grátis"**. Nunca escrever "grátis para sempre", "plano free permanente" ou valores de preço.
- Não prometer recursos que não existem (ver seção 11).
- Não usar depoimentos, números de usuários ou logos de clientes (não há dados reais).

---

## 3. Mapa de rotas

### 3.1 Antes

```
/login, /cadastro                       → públicas
/ (index) + /planejamento + /roteiro …  → protegidas por RequireAuth + AppShell
```

### 3.2 Depois

| Rota | Componente | Acesso |
|---|---|---|
| `/` | `Landing` | Pública, sem AppShell |
| `/login` | `Login` | Pública |
| `/cadastro` | `Cadastro` | Pública |
| `/inicio` | `MinhasViagens` | Protegida + AppShell |
| `/planejamento` | `Planejamento` | Protegida + AppShell |
| `/roteiro` | `Roteiro` | Protegida + AppShell |
| `/mapa` | `Mapa` | Protegida + AppShell |
| `/viagem` | `ViagemDashboard` | Protegida + AppShell |
| `/nova-viagem` | `CriarViagem` | Protegida + AppShell |
| `/cadastro/local` | `CadastroLocal` | Protegida + AppShell |
| `/cadastro/passagem` | `CadastroPassagem` | Protegida + AppShell |
| `/cadastro/hotel` | `CadastroHotel` | Protegida + AppShell |
| `/listas` | `Listas` | Protegida + AppShell |
| `/estados` | `Estados` | Protegida + AppShell |
| `*` (não encontrada) | redirect → `/` | Pública |

### 3.3 Estrutura de `src/App.tsx`

```tsx
<Routes>
  {/* Públicas */}
  <Route path="/" element={<Landing />} />
  <Route path="/login" element={<Login />} />
  <Route path="/cadastro" element={<Cadastro />} />

  {/* App autenticado — layout sem path, filhos com caminho absoluto */}
  <Route
    element={
      <RequireAuth>
        <TripProvider>
          <AppShell />
        </TripProvider>
      </RequireAuth>
    }
  >
    <Route path="/inicio" element={<MinhasViagens />} />
    <Route path="/planejamento" element={<Planejamento />} />
    <Route path="/roteiro" element={<Roteiro />} />
    <Route path="/mapa" element={<Mapa />} />
    <Route path="/viagem" element={<ViagemDashboard />} />
    <Route path="/nova-viagem" element={<CriarViagem />} />
    <Route path="/cadastro/local" element={<CadastroLocal />} />
    <Route path="/cadastro/passagem" element={<CadastroPassagem />} />
    <Route path="/cadastro/hotel" element={<CadastroHotel />} />
    <Route path="/listas" element={<Listas />} />
    <Route path="/estados" element={<Estados />} />
  </Route>

  {/* Fallback público */}
  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>
```

**Observações técnicas:**

- `AuthProvider` continua envolvendo todas as rotas. Ele só chama `/auth/me` quando existe token no `localStorage`; portanto **a landing não dispara requisição** para visitante anônimo.
- A landing **não pode** usar `useTrip()` (o `TripProvider` só existe no bloco autenticado). Pode usar `useAuth()` para saber se há sessão.
- O conflito `/cadastro` (signup público) × `/cadastro/local` (app) é resolvido pela especificidade do React Router — `/cadastro/local` tem precedência para a URL exata. **Não renomear** nesta entrega.

### 3.4 Arquivos a alterar

| Arquivo | Alteração |
|---|---|
| `src/App.tsx` | Novo mapa de rotas acima |
| `src/screens/Login.tsx` | `navigate('/', { replace: true })` → `navigate('/inicio', { replace: true })` |
| `src/screens/Cadastro.tsx` | `navigate('/', { replace: true })` → `navigate('/inicio', { replace: true })` |
| `src/components/layout/nav.ts` | Item "Início": `para: '/'` → `para: '/inicio'` (mantém `exato: true`) |
| `index.html` | Título e `meta description` da seção 10 |

---

## 4. Arquivos novos

| Arquivo | Responsabilidade |
|---|---|
| `src/screens/Landing.tsx` | Composição da página (seções na ordem da seção 5) |
| `src/content/landing.ts` | Conteúdo tipado: headline, subtítulo, passos, features, destaques, FAQ, links. **Toda a copy em um só lugar.** |
| `src/components/landing/LandingHeader.tsx` | Cabeçalho público (logo + ações) |
| `src/components/landing/LandingFooter.tsx` | Rodapé |
| `src/components/landing/Section.tsx` | Wrapper de seção (container, espaçamento, âncora `id`) |
| `src/components/landing/FeatureCard.tsx` | Card de funcionalidade (ícone, título, descrição) |
| `src/components/landing/ButtonLink.tsx` | CTA de navegação: `<Link>` do React Router com a aparência do `Button` (o `Button` do app renderiza apenas `<button>`) |

> `src/content/landing.ts` deve exportar interfaces tipadas (`Feature`, `Passo`, `FaqItem`, `Destaque`) e um objeto `LANDING` com todo o conteúdo. Isso evita copy espalhada em JSX e facilita revisão futura.

---

## 5. Estrutura visual e conteúdo

### 5.0 Cabeçalho público (`LandingHeader`)

- Esquerda: `Logo` + "Trip Planner".
- Direita:
  - Visitante anônimo: link **"Entrar"** (`/login`) + botão **"Criar conta grátis"** (`/cadastro`).
  - Usuário com sessão (`useAuth().usuario`): botão **"Ir para minhas viagens"** (`/inicio`).
- Sticky no topo, fundo `cream-100/90` com `backdrop-blur`, borda inferior `sage-200/70`.
- Mobile: manter os dois elementos essenciais; "Entrar" pode virar link de texto menor.

### 5.1 Hero

- **Eyebrow:** `PLANEJAMENTO DE VIAGEM`
- **H1:** `Sua viagem inteira, organizada dia a dia.`
- **Subtítulo:** `Cadastre locais, passagens e hospedagens, monte o roteiro com sugestão automática e acompanhe o orçamento — tudo em um só lugar.`
- **CTA primário:** `Criar conta grátis` → `/cadastro`
- **CTA secundário:** `Ver como funciona` → âncora `#como-funciona`
- **Microcopy abaixo do CTA:** `Grátis durante o MVP. Sem cartão de crédito.`
- **Sem imagem.** Usar hierarquia tipográfica (H1 em `font-display`, até `text-5xl`/`text-6xl` no desktop) e um bloco decorativo opcional apenas com CSS (bordas, chips numerados de "Dia 1", "Dia 2"), sem `<img>` e sem screenshot.

### 5.2 Problema

- **H2:** `Planejar viagem não deveria virar uma planilha.`
- **Texto:** `Passagens no e-mail, hotel no print, restaurante salvo no celular, roteiro na cabeça. O Trip Planner junta tudo e transforma em um plano que cabe no dia.`

### 5.3 Como funciona (`id="como-funciona"`)

- **H2:** `Do desejo ao roteiro em quatro passos.`
- Passos (numerados):
  1. **Crie a viagem** — `Destino, período (opcional), moeda e capa.`
  2. **Junte o que você quer fazer** — `Cadastre locais, passagens e hospedagens, ou importe uma passagem de PDF ou imagem.`
  3. **Monte o roteiro** — `Arraste os itens para os dias ou use a sugestão automática. O app avisa conflitos de horário.`
  4. **Acompanhe o resto** — `Veja o orçamento total, os pontos no mapa e o checklist da viagem.`

### 5.4 Funcionalidades em destaque

- **H2:** `Tudo o que a viagem precisa, no mesmo lugar.`
- Grid de 6 cards (ícone Lucide + título + uma frase):

| Ícone | Título | Descrição |
|---|---|---|
| `CalendarDays` | Roteiro dia a dia | `Organize os dias em colunas e arraste os itens. O app avisa quando dois horários se sobrepõem.` |
| `Sparkles` | Sugestão de roteiro | `O app propõe o encaixe dos locais considerando distância, deslocamento e horário de funcionamento.` |
| `Wallet` | Orçamento previsto | `Locais, passagens e hospedagens somados automaticamente, com total e distribuição por categoria.` |
| `Map` | Mapa da viagem | `Todos os locais e hospedagens no mapa, com filtro por categoria e por dia do roteiro.` |
| `FileUp` | Importação de passagem | `Importe de PDF, imagem ou preencha manualmente. Você revisa antes de salvar.` |
| `ListTodo` | Listas e checklists | `Documentos, roupas, eletrônicos e o que mais precisar, com progresso e valores previsto e pago.` |

### 5.5 Destaque 1 — Sugestão de roteiro

- **H2:** `A gente sugere. Você decide.`
- **Texto:** `O Trip Planner considera distância, tempo de deslocamento, horário de funcionamento e janelas livres para propor o encaixe dos locais nos dias. Você revisa, ajusta e aplica.`

### 5.6 Destaque 2 — Orçamento sem surpresa

- **H2:** `Saiba quanto a viagem custa antes de embarcar.`
- **Texto:** `Locais, passagens e hospedagens somados automaticamente, com total e distribuição por categoria na moeda da viagem.`

### 5.7 Destaque 3 — Mapa da viagem

- **H2:** `Veja sua viagem no mapa.`
- **Texto:** `Todos os locais e hospedagens com filtro por categoria e por dia do roteiro. Do planejamento à orientação no destino.`

> Os três destaques podem compartilhar o mesmo componente de layout, alternando o lado do texto (zig-zag) no desktop e empilhando no mobile.

### 5.8 Para quem é

- **H2:** `Para quem gosta de viajar com tudo no lugar.`
- 3 cards:

| Título | Texto |
|---|---|
| Viajante organizador(a) | `Quer controle total: roteiro por dia, horários, custos e checklist.` |
| Família e grupo | `Precisa de uma visão clara do que fazer em cada dia e do que levar.` |
| Planejador de várias viagens | `Mantém a viagem ativa e o histórico das anteriores, sem misturar.` |

### 5.9 FAQ

- **H2:** `Perguntas frequentes.`
- Acordeão acessível (button + região expandida) ou lista de `<details>` nativos. Padrão: primeiro item fechado; abrir/fechar com teclado.

| Pergunta | Resposta |
|---|---|
| O Trip Planner é gratuito? | `Sim. Durante o MVP o Trip Planner é gratuito, sem cobrança e sem cartão de crédito.` |
| Preciso criar conta? | `Sim. A conta mantém suas viagens, roteiros e listas vinculados a você.` |
| Funciona no celular? | `Sim. A interface foi desenhada para celular e desktop.` |
| Consigo importar minha passagem? | `Sim: por PDF, imagem (OCR) ou preenchimento manual, com revisão antes de salvar.` |
| O roteiro é automático? | `O app sugere uma distribuição. Você revisa, ajusta e decide o que aplicar.` |
| Consigo planejar mais de uma viagem? | `Sim. Uma viagem fica ativa e as anteriores permanecem no histórico.` |
| Meus dados ficam salvos? | `Suas viagens ficam vinculadas à sua conta e acessíveis apenas com o seu login.` |

### 5.10 CTA final

- **H2:** `Pronto para planejar sem pressa?`
- **Texto:** `Crie sua viagem, junte seus lugares favoritos e veja o roteiro tomar forma.`
- **Botão:** `Criar conta grátis` → `/cadastro`
- **Microcopy:** `Grátis durante o MVP.`

### 5.11 Rodapé (`LandingFooter`)

- Esquerda: `Logo` + `Trip Planner` + `Planeje sem pressa.`
- Links: `Entrar` (`/login`), `Criar conta` (`/cadastro`), `Como funciona` (`#como-funciona`).
- Créditos: `Mapas © OpenStreetMap contributors`.
- Linha final: `© {ano} Trip Planner.`
- **Não** incluir links de Termos de Uso / Política de Privacidade enquanto essas páginas não existirem (evita link quebrado).

---

## 6. Design system aplicado

Usar **exclusivamente** os tokens já definidos em `src/index.css` (Tailwind 4 `@theme`). Não criar cores novas.

| Uso | Token |
|---|---|
| Fundo da página | `bg-cream-100` |
| Blocos/cards | `bg-cream-50`, borda `border-sage-200/70`, `rounded-3xl` |
| Texto principal | `text-ink-900` / títulos `text-forest-900` |
| Texto de apoio | `text-ink-500` / `text-ink-600` |
| Botão primário | `bg-forest-700 text-cream-50`, hover `bg-forest-800` |
| Botão secundário | `bg-cream-50 border border-sage-200 text-forest-700` |
| Seção de contraste | `bg-forest-900 text-cream-50` (usar no CTA final) |
| Ícones | `lucide-react`, traço 1.5–2, `text-forest-700` |
| Títulos | `font-display` (Fraunces) |
| Corpo | `font-sans` (Plus Jakarta Sans) |

**Reutilizar componentes existentes:** `Button` (somente para ações que não navegam), `Logo`. Não reutilizar componentes de app que dependam de `useTrip` (`ItemCard`, `StatTile` etc.). Se precisar de `Badge`/`Chip`, avaliar se são puros.

**CTAs de navegação:** `src/components/ui/Button.tsx` renderiza apenas `<button>` e não aceita `as`/`Link`. Todo CTA que navega (`/cadastro`, `/login`, `/inicio`, âncora `#como-funciona`) deve usar `src/components/landing/ButtonLink.tsx` — um `<Link>` com as mesmas classes/variantes do `Button`. Não usar `<button onClick={() => navigate(...)}>` para CTA de landing (quebra semântica, SEO e "abrir em nova aba").

---

## 7. Responsividade

| Breakpoint | Comportamento |
|---|---|
| `< 640px` (mobile) | Tudo em coluna única; `px-4`; H1 `text-4xl`; CTAs full-width ou empilhados; header compacto; FAQ empilhado. |
| `≥ 640px` (sm) | Features em 2 colunas; "para quem" em 3 colunas. |
| `≥ 1024px` (lg) | Container `max-w-6xl`; H1 `text-6xl`; destaques em zig-zag (texto/visual alternando); 3 colunas. |
| Altura | Não usar `100svh` no hero com conteúdo longo; espaçamento por `py-16`/`py-24`. |

- Respeitar `env(safe-area-inset-bottom)` se houver elemento fixo no rodapé (não previsto na v1).
- Não introduzir navegação inferior (`BottomNav`) na landing.

---

## 8. Acessibilidade

- Um único `<h1>` na página (hero). Seções usam `<h2>`, cards usam `<h3>`.
- Todo link/botão com texto visível ou `aria-label`.
- Contraste mínimo AA nos textos sobre `forest-900` (usar `cream-50`, não `sage-200` para corpo).
- FAQ com `<button aria-expanded>` + região `aria-controls`, ou `<details>`/`<summary>`.
- Foco visível: o token global já define `:focus-visible`; não remover outline.
- Âncoras com `scroll-margin-top` para o header sticky (`scroll-mt-20`).
- Ícones decorativos com `aria-hidden`.

---

## 9. Comportamento e estados

- A landing é **estática**: sem fetch, sem loading, sem estado global de viagem.
- Header reage apenas a `useAuth().usuario` (mostrar "Ir para minhas viagens" quando logado).
- Se o usuário logado acessar `/`, a landing é exibida normalmente (não redirecionar automaticamente) — o header oferece o atalho para `/inicio`.
- Links de CTA apontam para `/cadastro`; "Entrar" para `/login`.
- Âncora `#como-funciona` deve rolar suavemente (o `html` já tem `scroll-behavior: smooth`).

---

## 10. SEO e metadata (`index.html`)

| Campo | Valor |
|---|---|
| `<title>` | `Trip Planner — organize sua viagem dia a dia` |
| `meta description` | `Trip Planner: cadastre locais, passagens e hospedagens, monte o roteiro dia a dia com sugestão automática e acompanhe o orçamento em um só lugar.` |
| `meta name="theme-color"` | `#17301F` (já existe) |
| `html lang` | `pt-BR` (já existe) |
| Open Graph | `og:title`, `og:description`, `og:type=website`, `og:locale=pt_BR` — **sem `og:image` na v1** |

- Não adicionar `canonical` enquanto o domínio de produção não estiver definido.
- Não usar `noindex`: a landing deve ser indexável.

---

## 11. Fora de escopo (não implementar / não prometer)

- Importação por e-mail ou caixa de entrada.
- Compra de passagens ou alteração de reservas.
- App nativo iOS/Android.
- Funcionamento offline completo.
- Colaboração em tempo real.
- Tabela de preços, planos ou checkout.
- Depoimentos, logos de clientes, contadores de usuários.
- Blog, central de ajuda, páginas de Termos/Privacidade.
- Internacionalização (a página é PT-BR).
- Imagens, screenshots, ilustrações ou vídeos.

---

## 12. Critérios de aceite

- [ ] **CA1** — Acessar `/` sem token exibe a landing e **nenhuma** requisição a `/auth/me` é disparada.
- [ ] **CA2** — Em `/`, o header mostra "Entrar" e "Criar conta grátis"; ambos levam às rotas corretas.
- [ ] **CA3** — Com sessão ativa, `/` mostra "Ir para minhas viagens" apontando para `/inicio`.
- [ ] **CA4** — Após login bem-sucedido, o usuário é levado a `/inicio` (não a `/`).
- [ ] **CA5** — Após cadastro bem-sucedido, o usuário é levado a `/inicio`.
- [ ] **CA6** — Acessar qualquer rota do app (`/planejamento`, `/roteiro`, `/mapa`, `/listas`, `/viagem`) sem sessão redireciona para `/login`.
- [ ] **CA7** — O item "Início" da navegação (sidebar e bottom nav) aponta para `/inicio` e fica ativo corretamente.
- [ ] **CA8** — URL desconhecida (`/qualquer-coisa`) redireciona para `/`.
- [ ] **CA9** — A landing não renderiza `<img>` de screenshot nem consome `useTrip`.
- [ ] **CA10** — A copy contém "Grátis durante o MVP" e não contém "grátis para sempre" nem valores de preço.
- [ ] **CA11** — Os 11 blocos de conteúdo da seção 5 (5.1–5.11) estão presentes, na ordem: hero, problema, como funciona, features, 3 destaques, para quem, FAQ, CTA final e footer (o cabeçalho 5.0 é obrigatório e não entra na contagem).
- [ ] **CA12** — FAQ abre e fecha por teclado, com `aria-expanded` correto.
- [ ] **CA13** — Layout sem overflow horizontal em 360px, 768px e 1280px.
- [ ] **CA14** — `npm run build`, `npm run lint` e `npm run test` passam.
- [ ] **CA15** — `index.html` contém título e description da seção 10.

---

## 13. Verificação (para o rdd-dev)

```powershell
npm run lint
npm run test
npm run build
```

Verificação manual mínima:

1. `npm run dev`
2. Abrir `/` em aba anônima → landing, sem erro de rede.
3. Clicar em "Criar conta grátis" → `/cadastro`.
4. Criar conta → cair em `/inicio`.
5. Fazer logout → `/login`.
6. Acessar `/roteiro` deslogado → `/login`.
7. Redimensionar para 360px → sem scroll horizontal.

---

## 14. Riscos e observações

| Risco | Mitigação |
|---|---|
| Bundle da landing carregar código do app (Leaflet, pdfjs, tesseract) | Para o MVP é aceitável (bundle principal medido em 682 kB / 194,8 kB gzip; PDF/worker são chunks separados). Melhoria futura: `React.lazy` nas telas pesadas. |
| Colisão `/cadastro` × `/cadastro/local` | Resolvida por precedência de rota; não renomear nesta entrega. |
| Link para Termos/Privacidade inexistente | Não incluir no rodapé até as páginas existirem. |
| Copy de gratuidade envelhecer | Centralizar em `src/content/landing.ts` e revisar ao sair do MVP. |
| Landing indexada com conteúdo provisório | Revisar copy antes do deploy de produção. |

---

## 15. Handoff

Entregar ao `rdd-dev` com:

1. Este spec.
2. `docs/PAGINA_INICIAL.md` (briefing e textos de apoio).
3. Acesso ao repo `TirperPlanner` na branch de trabalho (não implementar direto em `main` sem confirmação).
4. Ordem sugerida: rotas (`App.tsx`, `nav.ts`, redirects) → `src/content/landing.ts` → componentes → `Landing.tsx` → `index.html` → verificação.
