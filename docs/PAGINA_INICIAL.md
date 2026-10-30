# Trip Planner — Briefing da página inicial

> Documento de referência para a criação da **landing page (página de propaganda)** do Trip Planner.
> Descreve o que o produto faz, para quem, quais dores resolve e traz a estrutura sugerida de seções com textos prontos para uso. Nada aqui deve ser publicado sem revisão de tom de voz e de marca.

## Decisões de implementação (MVP)

Estas decisões foram fechadas e estão detalhadas em **`docs/LANDING_SPEC.md`** (spec de implementação):

| Decisão | Valor |
|---|---|
| Onde a landing vive | Rota pública `/` no mesmo SPA; home do app passa a ser `/inicio` |
| Nome oficial | **Trip Planner** |
| Escopo v1 | Completo (hero, problema, como funciona, features, 3 destaques, para quem, FAQ, CTA final, footer) |
| Imagens | **Sem imagens na v1** — tipografia, cor e ícones |
| CTA principal | **Criar conta grátis** → `/cadastro` |
| Modelo comercial | **Gratuito durante o MVP** (sem preços, sem cartão) |

> Os textos deste documento são a fonte de copy; o `LANDING_SPEC.md` é a fonte de comportamento, rotas e critérios de aceite.

---

## 1. O que é o Trip Planner

O **Trip Planner** é um planejador de viagens que transforma uma lista solta de desejos em um **roteiro dia a dia organizado, com orçamento e mapa**.

Em vez de espalhar passagens, hotéis, restaurantes e pontos turísticos em e-mails, prints e planilhas, o usuário cadastra tudo em um só lugar, distribui os itens nos dias da viagem e acompanha o quanto já está organizado e quanto vai gastar.

**Frase de posicionamento (one-liner):**

> Planeje a viagem inteira em um só lugar — do primeiro desejo ao roteiro dia a dia, com orçamento e mapa.

**Taglines para testar no hero:**

- "Sua viagem inteira, organizada dia a dia."
- "Planeje sem pressa. Viaje sem surpresa."
- "Do desejo ao roteiro, sem planilha."
- "Menos abas abertas. Mais viagem."

---

## 2. Público-alvo

| Perfil | Como usa o produto |
|---|---|
| **Viajante organizador(a)** | Quer controle total: roteiro por dia, horários, custos e checklist. |
| **Família / grupo** | Precisa de uma visão clara do que fazer em cada dia e do que levar. |
| **Viajante de primeira viagem ao destino** | Junta referências de locais e precisa encaixá-las em poucos dias. |
| **Planejador de múltiplas viagens** | Mantém viagens ativas e anteriores, com histórico preservado. |

### Dores que o produto resolve

- Informação de viagem espalhada em e-mails, PDFs, prints e conversas.
- Roteiro montado "de cabeça", sem noção de tempo, deslocamento ou conflito de horário.
- Falta de visão do custo total antes de viajar.
- Retrabalho ao digitar passagens e reservas manualmente.
- Listas de bagagem e compras feitas em qualquer bloco de notas, sem vínculo com a viagem.

---

## 3. Proposta de valor

1. **Um só lugar para tudo da viagem** — locais, passagens, hospedagens, roteiro, orçamento e listas.
2. **Roteiro que cabe no dia** — distribuição por dia com detecção de conflito de horários, duração estimada e custo do dia.
3. **Sugestão inteligente de roteiro** — o app propõe o encaixe dos locais nos dias, considerando distância, tempo de deslocamento, horário de funcionamento e janelas livres.
4. **Orçamento previsto por categoria** — locais, passagens e hospedagens somados automaticamente, sem custo contado duas vezes.
5. **Mapa integrado** — todos os locais e hospedagens no mapa, filtráveis por categoria e por dia do roteiro.
6. **Importação de passagem por PDF ou imagem** — leitura do comprovante com revisão antes de salvar, reduzindo digitação.
7. **Progresso visível** — um percentual mostra o quanto da viagem já está organizado no roteiro.

---

## 4. Funcionalidades (o que faz e por que importa)

### 4.1 Minhas viagens
Criação de viagens com destino, período (datas opcionais), moeda e capa. Uma viagem fica **ativa**; as anteriores permanecem no histórico.
**Por que importa:** o usuário retoma o planejamento de onde parou e mantém o histórico das viagens passadas.

### 4.2 Planejamento (o "inventário" da viagem)
Cadastro e gestão de três tipos de item:

- **Locais** — pontos turísticos, museus, restaurantes, natureza, compras, passeios e cultura; com endereço, horário de funcionamento, duração estimada, custo e observações.
- **Passagens** — avião, trem ou ônibus, com origem, destino, partida, chegada, companhia, localizador, assento, classe e valor.
- **Hospedagens** — hotel ou pousada com check-in, check-out, valor da noite, total e código de reserva.

Busca, filtros por tipo, categoria e situação ("ainda não no roteiro" / "já no roteiro"), visualização em cartões ou lista.
**Por que importa:** separa a fase de **juntar ideias** da fase de **organizar o roteiro**.

### 4.3 Roteiro dia a dia
Organização visual em colunas por dia (kanban no desktop, um dia por vez no celular), com arrastar e soltar entre dias.
Exibe por dia: horário de início e fim, duração estimada, custo do dia, quantidade de itens e itens concluídos.
**Detecção de conflito de horário** avisa quando duas atividades se sobrepõem e impede movimentações que criariam conflito.
**Por que importa:** evita o roteiro impossível — aquele que só cabe no papel.

### 4.4 Sugestão de roteiro
O app sugere como distribuir os locais ainda não organizados nos dias da viagem, respeitando:

- janelas livres do dia (por padrão, 09h às 20h);
- duração estimada de cada local;
- horário de abertura e fechamento;
- distância e tempo de deslocamento entre os pontos;
- cidade/destino compatível com o local.

**Por que importa:** transforma uma lista de desejos em um roteiro possível em segundos — o usuário revisa e aplica.

### 4.5 Mapa
Mapa interativo (OpenStreetMap) com marcadores por categoria e por hospedagem, filtro por dia do roteiro e por categoria, além de link para abrir o ponto no OpenStreetMap.
A localização de um endereço é buscada por serviço público de geocodificação, mas **as coordenadas só são gravadas a partir de uma sugestão escolhida pelo usuário**.
**Por que importa:** dá noção geográfica do roteiro e ajuda a decidir o que fica perto do quê.

### 4.6 Orçamento previsto
Soma automática dos custos de locais, passagens e hospedagens, com total da viagem e distribuição por categoria, na moeda da viagem (BRL, USD ou EUR).
**Por que importa:** o usuário vê o impacto financeiro antes de viajar, não depois.

### 4.7 Importação de passagem
Importação de passagem a partir de **PDF, imagem (OCR) ou preenchimento manual**. O app extrai os dados do comprovante, mostra o que encontrou e o que faltou, e o usuário revisa antes de salvar. Há controle de duplicidade por documento.
**Por que importa:** reduz a digitação e o erro de transcrição de dados de reserva.

### 4.8 Listas e checklists
Listas personalizadas por viagem (documentos, roupas, eletrônicos, brinquedos, farmácia etc.), com itens concluíveis, progresso e resumo financeiro (previsto x pago). Cada usuário gerencia apenas as próprias listas.
**Por que importa:** resolve "o que levar" e "o que já foi pago" no mesmo lugar da viagem.

### 4.9 Painel da viagem
Capa da viagem, indicadores (dias, locais, passagens, hospedagens), valor total previsto, progresso de organização, próximos itens do roteiro, abas de passagens e hospedagens e dados da viagem.
**Por que importa:** é a visão de "como está minha viagem agora".

---

## 5. Como funciona (fluxo para a landing page)

1. **Crie a viagem** — destino, período (opcional), moeda e capa.
2. **Junte o que você quer fazer** — cadastre locais, passagens e hospedagens; importe passagens de PDF ou imagem se preferir.
3. **Monte o roteiro** — arraste os itens para os dias ou use a sugestão automática; o app avisa conflitos de horário.
4. **Acompanhe orçamento, mapa e listas** — veja o custo total, os pontos no mapa e o checklist da viagem.

> Sugestão de CTA em cada etapa: "Criar minha viagem", "Adicionar um local", "Montar o roteiro", "Ver no mapa".

---

## 6. Diferenciais para destacar

- **Roteiro com noção real de tempo** — duração, deslocamento e conflito de horário.
- **Sugestão automática de encaixe** — não é só uma lista; é um roteiro possível.
- **Orçamento que não conta duas vezes** — cada custo aparece uma única vez, na sua categoria.
- **Importação de passagem com revisão** — OCR e parser com confirmação humana antes de salvar.
- **Mapa integrado ao planejamento** — não é um mapa solto; é o mapa da sua viagem, filtrado por dia e categoria.
- **Feito para celular e desktop** — navegação inferior no celular e visão em colunas no desktop.
- **Privacidade por usuário** — cada conta vê e gerencia as próprias viagens e listas.

---

## 7. Estrutura sugerida da landing page

> Cada bloco traz a intenção, a headline sugerida e o texto de apoio. Ajuste o tom conforme a marca.

### 7.1 Hero (topo)
- **Headline:** Sua viagem inteira, organizada dia a dia.
- **Subheadline:** Cadastre locais, passagens e hospedagens, monte o roteiro com sugestão automática e acompanhe o orçamento — tudo em um só lugar.
- **CTA principal:** Criar conta grátis → `/cadastro`
- **CTA secundário:** Ver como funciona (âncora `#como-funciona`)
- **Visual:** na v1, sem imagens — hierarquia tipográfica, cor e ícones.
- **Prova rápida:** "Grátis durante o MVP" / "Funciona no celular e no desktop".

### 7.2 O problema
- **Headline:** Planejar viagem não deveria virar uma planilha.
- **Texto:** Passagens no e-mail, hotel no print, restaurante salvo no celular, roteiro na cabeça. O Trip Planner junta tudo e transforma em um plano que cabe no dia.

### 7.3 Como funciona (3 a 4 passos)
- **Headline:** Do desejo ao roteiro em quatro passos.
- Use os passos da seção 5 com ícones e frases curtas.

### 7.4 Funcionalidades em destaque
- **Headline:** Tudo o que a viagem precisa, no mesmo lugar.
- **Cards sugeridos:**
  1. Roteiro dia a dia com conflito de horário
  2. Sugestão automática de roteiro
  3. Orçamento previsto por categoria
  4. Mapa com filtros por dia e categoria
  5. Importação de passagem por PDF ou imagem
  6. Listas e checklists da viagem

### 7.5 Destaque: sugestão de roteiro
- **Headline:** A gente sugere. Você decide.
- **Texto:** O Trip Planner considera distância, tempo de deslocamento, horário de funcionamento e janelas livres para propor o encaixe dos locais nos dias. Você revisa, ajusta e aplica.

### 7.6 Destaque: orçamento sem surpresa
- **Headline:** Saiba quanto a viagem custa antes de embarcar.
- **Texto:** Locais, passagens e hospedagens somados automaticamente, com total e distribuição por categoria na moeda da viagem.

### 7.7 Destaque: mapa da viagem
- **Headline:** Veja sua viagem no mapa.
- **Texto:** Todos os locais e hospedagens com filtro por categoria e por dia do roteiro. Do planejamento à orientação no destino.

### 7.8 Para quem é
- **Headline:** Para quem gosta de viajar com tudo no lugar.
- Três blocos: viajante organizador, família/grupo, planejador de múltiplas viagens (seção 2).

### 7.9 Perguntas frequentes (FAQ)
Sugestões de perguntas — respostas devem ser validadas antes de publicar:

1. **O Trip Planner é gratuito?** — sim, durante o MVP é gratuito, sem cobrança e sem cartão de crédito.
2. **Preciso criar conta?** — sim, o produto tem login e cada conta acessa as próprias viagens.
3. **Funciona no celular?** — sim, a interface é responsiva, com navegação inferior no celular.
4. **Consigo importar minha passagem?** — sim, por PDF, imagem (OCR) ou preenchimento manual, com revisão antes de salvar.
5. **O roteiro é automático?** — o app sugere, mas o usuário revisa e decide o que aplicar.
6. **Meus dados ficam salvos?** — as viagens ficam vinculadas à conta do usuário; detalhar política de privacidade e retenção.
7. **Consigo planejar mais de uma viagem?** — sim, com uma viagem ativa e histórico das anteriores.

### 7.10 CTA final
- **Headline:** Pronto para planejar sem pressa?
- **Texto:** Crie sua viagem, junte seus lugares favoritos e veja o roteiro tomar forma.
- **CTA:** Criar conta grátis → `/cadastro`

### 7.11 Rodapé
- Links: Entrar (`/login`), Criar conta (`/cadastro`) e Como funciona (âncora `#como-funciona`).
- **Não incluir** Termos de uso, Política de privacidade, Contato ou Ajuda enquanto essas páginas não existirem (evita link quebrado).
- Créditos de mapa: "Mapas © OpenStreetMap contributors".
- Ano e nome da marca.

---

## 8. Identidade visual (para manter coerência com o produto)

| Elemento | Valor |
|---|---|
| Cor primária | Verde-floresta `#295237` (variação escura `#16301F`) |
| Cor secundária | Verde-sálvia `#87A183` |
| Fundo | Creme `#F8F4EA` / `#FDFBF6` |
| Destaque | Argila `#C4703E` |
| Texto | `#1E231C` |
| Fonte de títulos | Fraunces (serifada) |
| Fonte de texto | Plus Jakarta Sans |
| Formas | Cantos arredondados (cards 1,25–1,75 rem), sombras suaves |
| Tom | Acolhedor, calmo, organizado — "planeje sem pressa" |

**Sugestão de meta description (SEO):**
> Trip Planner — organize sua viagem em um só lugar: locais, passagens e hospedagens, roteiro dia a dia, sugestão automática, orçamento e mapa.

---

## 9. Limites atuais (não prometer na landing page)

Para manter a comunicação honesta, estes pontos **não** fazem parte do produto hoje:

- Importação automática por e-mail / caixa de entrada (prevista como evolução futura).
- Compra de passagens ou alteração de reservas.
- Aplicativo nativo para iOS/Android (a interface é web responsiva).
- Funcionamento offline completo (o produto depende da API).
- Colaboração em tempo real entre várias pessoas na mesma viagem.
- Reserva de hotéis ou restaurantes.

---

## 10. Próximos passos sugeridos

1. Validar posicionamento, tagline e tom de voz com o responsável pelo produto.
2. Modelo comercial definido para o MVP: **gratuito** (sem preços, sem cartão). Revisar ao sair do MVP.
3. Na v1 não há capturas de tela: a landing usa tipografia, cor e ícones. Capturas reais ficam para uma v2.
4. Escrever a versão final dos textos com base neste briefing (a copy da v1 está em `docs/LANDING_SPEC.md`).
5. Implementar a landing page seguindo a identidade visual da seção 8.
6. Revisar acessibilidade (contraste, foco visível, textos alternativos) e SEO.

---

## 11. Referência técnica do produto (para quem for construir a página)

- **Stack:** React + TypeScript + Vite, Tailwind CSS 4.
- **Roteamento:** React Router.
- **Mapa:** Leaflet + React Leaflet sobre tiles do OpenStreetMap.
- **Importação:** `pdfjs-dist` (texto de PDF) + `tesseract.js` (OCR de imagem/PDF escaneado).
- **Ícones:** Lucide.
- **API:** REST com autenticação Bearer (`/api/v1`), configurável por `VITE_API_URL`.
- **Testes:** Vitest + Testing Library.

> A landing page pode ser construída à parte (estática) ou como rota pública do próprio app. Se for rota pública, cuidar para não exigir autenticação.
