# Evolução futura — importação de passagens por e-mail

Este documento registra a evolução prevista no TP-010 que **não** faz parte da
implementação atual. A importação por PDF, imagem e preenchimento manual está
disponível; o acesso à caixa de entrada permanece fora de escopo.

## Objetivo

Identificar confirmações de reserva na caixa de entrada do usuário e oferecer a
importação assistida dos dados para o Trip Planner, sempre com revisão e
confirmação antes de persistir.

## Pré-requisitos

- Consentimento explícito do usuário, com escopo mínimo de leitura.
- Autorização OAuth do provedor de e-mail (Gmail, Outlook ou IMAP corporativo).
- Política de retenção e descarte de mensagens e anexos.
- Revisão de privacidade/LGPD: o conteúdo pode conter dados pessoais e de
  pagamento.
- Backend ou serviço intermediário confiável para trocar o token e acessar a
  caixa de entrada. A arquitetura atual é SPA e não deve guardar token de
  e-mail no `localStorage`.

## Fluxo proposto

1. Usuário autoriza o acesso somente leitura.
2. Serviço busca mensagens recentes por remetentes/padrões conhecidos
   (companhias aéreas, plataformas de viagem, hotéis).
3. Serviço extrai texto e anexos e aplica o mesmo parser usado na importação
   local.
4. Usuário recebe uma lista de candidatos e escolhe o que importar.
5. Dados extraídos são apresentados no formulário de revisão.
6. Somente após confirmação a passagem é persistida.
7. Token e mensagens não são armazenados além do necessário para a operação.

## Requisitos de segurança

- Não acessar a caixa de entrada sem consentimento explícito e revogável.
- Não registrar conteúdo de e-mail, números de bilhete ou dados de passageiro
  em logs.
- Deduplicar por hash do comprovante e por localizador/número do bilhete.
- Permitir revogar a autorização e apagar os dados derivados.
- Aplicar o princípio do menor privilégio no escopo OAuth.
- Validar remetentes e anexos; não executar links ou macros.

## Fora de escopo nesta evolução

- Envio automático de e-mails pelo Trip Planner.
- Leitura contínua da caixa de entrada em segundo plano.
- Compra de passagens ou alteração de reservas.
- Armazenamento de credenciais de e-mail no navegador.

## Decisões pendentes

- Provedor de e-mail inicial e modelo de autorização.
- Onde o token será custodiado (backend próprio ou serviço gerenciado).
- Política de retenção de mensagens e anexos.
- Como o usuário revoga o consentimento e solicita exclusão.
