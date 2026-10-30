---
project: Trip Planner
module: validacao
audience: [tecnica]
status: draft
---

# Validation Report — Trip Planner (landing page)

> **Data:** 29/10/2026
> **Escopo:** `docs/PAGINA_INICIAL.md` e `docs/LANDING_SPEC.md`
> **Resultado:** ⚠️ Aprovado com ressalvas (0 erros, 5 warnings)
> **Revalidação (29/10/2026):** após correção de W1–W3, resultado ✅ **Aprovado** — ver §7.

---

## Resumo

| Categoria | Erros | Warnings | Status |
|---|---|---|---|
| RN sem downstream esperado | — | — | N/A (sem REQUIREMENTS.md) |
| Referência a ID inexistente | 0 | 0 | ✅ |
| CR aprovado sem reflexo | — | — | N/A (sem CHANGE_REQUESTS.md) |
| DEC obsoleto não marcado | — | — | N/A (sem DECISIONS.md) |
| ADR sem campo Decisor | — | — | N/A (sem DECISIONS.md) |
| Tabelas novas sem colunas de auditoria | — | — | N/A (sem DATA_MODEL.md) |
| Nomenclatura (constraints, sequences, tabelas) | — | — | N/A (sem DATA_MODEL.md) |
| Caminhos e arquivos referenciados | 0 | 0 | ✅ |
| Coerência entre documentos | 0 | 2 | ⚠️ |
| Afirmações verificadas contra o código | 0 | 2 | ⚠️ |
| Critérios de aceite | 0 | 1 | ⚠️ |

> **Nota de escopo:** este repositório é o repo de aplicação (SPA), não um módulo RDD
> com `PROJECT_CHARTER`/`REQUIREMENTS`. As categorias de DAG de requisitos foram
> marcadas como N/A. A validação cobre integridade documental e aderência ao código.

---

## 1. Caminhos, arquivos e símbolos referenciados

Verificação de tudo que o spec cita como existente.

| Referência | Esperado | Resultado |
|---|---|---|
| `src/App.tsx` | existe | ✅ |
| `src/screens/Login.tsx` | existe | ✅ |
| `src/screens/Cadastro.tsx` | existe | ✅ |
| `src/components/layout/nav.ts` | existe | ✅ |
| `src/index.css` | existe (tokens `@theme`) | ✅ |
| `index.html` | existe (`lang=pt-BR`, `theme-color #17301F`) | ✅ |
| `src/components/ui/Button.tsx` | existe | ✅ |
| `src/components/layout/Logo.tsx` | existe | ✅ |
| Tokens (`cream-*`, `forest-*`, `sage-*`, `ink-*`, `clay-*`) | definidos em `@theme` | ✅ |
| Fontes Fraunces / Plus Jakarta Sans | declaradas em `src/index.css` e `index.html` | ✅ |
| Scripts `lint`, `test`, `build` | em `package.json` | ✅ |
| Ícones `CalendarDays`, `Sparkles`, `Wallet`, `Map`, `ListTodo` | já usados no código | ✅ |
| Ícone `FileUp` | exportado por `lucide-react` | ✅ |
| `src/screens/Landing.tsx`, `src/content/`, `src/components/landing/` | **novos** (previstos) | ✅ (ausência esperada) |

**Conclusão:** nenhuma referência quebrada.

---

## 2. Coerência entre documentos

### W1 — Contagem de seções divergente no critério de aceite

| Documento | Local | Problema |
|---|---|---|
| `LANDING_SPEC.md` | CA11 (§12) | Diz "as **9 seções** da seção 5", mas a §5 define **11 blocos de conteúdo** (5.1 a 5.11) + o cabeçalho (5.0). |

**Severidade:** warning (documentação)
**Ação:** trocar por "os 11 blocos da seção 5 (5.1–5.11)" ou listar explicitamente. Não bloqueia a implementação, mas o critério fica ambíguo na verificação.

### W2 — Rodapé divergente entre briefing e spec

| Documento | Local | Conteúdo |
|---|---|---|
| `PAGINA_INICIAL.md` | §7.11 | Sugere links "Termos de uso, Política de privacidade, Contato, Ajuda" |
| `LANDING_SPEC.md` | §5.11 | Proíbe incluir Termos/Privacidade enquanto as páginas não existirem |

**Severidade:** warning (contradição entre documentos)
**Ação:** alinhar o briefing ao spec (remover os links inexistentes) ou criar as páginas antes.

---

## 3. Afirmações verificadas contra o código

### Confirmadas

| Afirmação do spec | Evidência | Resultado |
|---|---|---|
| `AuthProvider` só chama `/auth/me` quando há token | `src/auth/AuthProvider.tsx:36-41` | ✅ |
| Landing não pode usar `useTrip()` | `TripProvider` só no bloco protegido (`App.tsx:30-33`) | ✅ |
| São 4 pontos de toque nas rotas | `App.tsx:48`, `Login.tsx:23`, `Cadastro.tsx:35`, `nav.ts:21` | ✅ |
| `html` tem `scroll-behavior: smooth` | `src/index.css:66` | ✅ |
| `:focus-visible` global definido | `src/index.css:88-92` | ✅ |
| Conflito `/cadastro` × `/cadastro/local` | Rotas distintas; precedência por especificidade do React Router | ✅ (não renomear) |
| Deduplicação de passagem por hash e localizador+bilhete | `src/lib/importacao/duplicata.ts:8-17` | ✅ |
| Formatos de importação PDF/JPG/PNG/WEBP, limite 10 MB | `src/lib/importacao/arquivo.ts:1-29` | ✅ |
| Fora de escopo (e-mail) coerente com evolução registrada | `docs/EVOLUCAO_IMPORTACAO_EMAIL.md` | ✅ |
| Nenhum teste depende das rotas atuais | Busca em `*.test.ts(x)` por `AuthProvider`/`Router`/`MinhasViagens` → 0 | ✅ |

### W3 — Reuso de `Button` em CTA de navegação

`src/components/ui/Button.tsx` renderiza **apenas `<button>`** (não aceita `as`/`Link`). O spec manda reutilizar `Button` nos CTAs que navegam para `/cadastro` e `/login`, mas não define como.

**Severidade:** warning (lacuna de spec)
**Ação:** o implementador deve usar `<Link>` com as classes do botão ou criar um `ButtonLink`. CTAs de navegação não devem ser `<button>` puro (prejudica semântica, SEO e "abrir em nova aba").

### W4 — Claim de privacidade não verificável neste repo

FAQ (spec §5.9): "acessíveis apenas com o seu login". O isolamento por usuário é visível no frontend (`Listas.tsx:32` filtra por `usuarioId`), mas a **autorização real é do backend**, que não está neste repositório.

**Severidade:** warning (claim sem evidência completa)
**Ação:** validar com o backend ou suavizar para "vinculadas à sua conta".

### W5 — Tamanho de bundle citado é medição de `dist/` existente

O spec (§14) cita "bundle principal ~0,63 MB" com base no `dist/` já buildado. O valor muda após a entrega.

**Severidade:** observation
**Ação:** remedir após `npm run build`; não bloqueante.

---

## 4. Critérios de aceite

| Critério | Situação |
|---|---|
| CA1 | ✅ coerente (condicionado a "sem token") |
| CA2–CA8 | ✅ coerentes com o mapa de rotas |
| CA9 | ✅ coerente com a decisão "sem imagens" |
| CA10 | ✅ copy de gratuidade consistente nos dois docs |
| CA11 | ⚠️ ver W1 (contagem de seções) |
| CA12–CA15 | ✅ coerentes |

---

## 5. Findings por Documento

| Documento | Achados | Severidade | Skill corretiva |
|---|---|---|---|
| `LANDING_SPEC.md` | W1 (CA11 "9 seções"), W3 (CTA com `Button`), W5 (bundle) | 🟡 warning | edição direta do doc / `rdd-ui-spec` se quiser formalizar |
| `PAGINA_INICIAL.md` | W2 (links de rodapé inexistentes) | 🟡 warning | edição direta do doc |
| `LANDING_SPEC.md` §5.9 | W4 (claim de privacidade) | 🟡 warning | validar com backend |
| `src/` (código) | — | ✅ ok | — |

---

## 6. Conclusão

**⚠️ Aprovado com ressalvas.** Não há erro bloqueante: todos os caminhos, arquivos, tokens, ícones e premissas técnicas citados no spec existem e conferem com o código. Antes de implementar, recomenda-se corrigir W1 (contagem no CA11), W2 (rodapé) e W3 (CTA com `Link`), que são ajustes de texto/spec de minutos.

Itens N/A: as categorias de DAG de requisitos (RN, CR, DEC, ADR, modelo de dados) não se aplicam a este repositório.

---

## 7. Revalidação (29/10/2026)

Correções aplicadas após a primeira passagem:

| Item | Status | O que mudou |
|---|---|---|
| W1 — contagem no CA11 | ✅ corrigido | CA11 agora fala em "11 blocos de conteúdo (5.1–5.11)" e explicita que o cabeçalho (5.0) não entra na contagem. |
| W2 — rodapé divergente | ✅ corrigido | `PAGINA_INICIAL.md` §7.11 alinhado ao spec: links Entrar/Criar conta/Como funciona; proibição explícita de Termos/Privacidade/Contato/Ajuda enquanto não existirem. |
| W3 — CTA com `Button` | ✅ corrigido | Adicionado `src/components/landing/ButtonLink.tsx` à lista de arquivos novos e regra na §6: CTA de navegação usa `<Link>` estilizado, nunca `<button onClick>`. |
| W4 — claim de privacidade | ✅ resolvido na implementação | FAQ usa a versão suave: "Suas viagens ficam vinculadas à sua conta." (sem afirmar autorização do backend). |
| W5 — tamanho de bundle | ✅ resolvido | Medido após `npm run build`: 682,08 kB (gzip 194,83 kB); PDF/worker em chunks separados. |

**Resultado após correções:** ✅ **Aprovado**. Implementação entregue na branch `feat/landing-page` com lint, testes e build verdes.
