import {
  CalendarDays,
  Compass,
  FileUp,
  ListTodo,
  Luggage,
  Map,
  Sparkles,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react'

export interface Feature {
  icone: LucideIcon
  titulo: string
  descricao: string
}

export interface Passo {
  numero: number
  titulo: string
  descricao: string
}

export interface Destaque {
  icone: LucideIcon
  titulo: string
  descricao: string
  pontos: string[]
}

export interface FaqItem {
  pergunta: string
  resposta: string
}

export interface Publico {
  icone: LucideIcon
  titulo: string
  descricao: string
}

/**
 * Toda a copy da landing page pública em um só lugar.
 * Revisar ao sair do MVP (gratuidade e escopo de funcionalidades).
 */
export const LANDING = {
  marca: 'Trip Planner',
  tagline: 'Planeje sem pressa.',

  header: {
    entrar: 'Entrar',
    criarConta: 'Criar conta grátis',
    minhasViagens: 'Ir para minhas viagens',
  },

  hero: {
    eyebrow: 'Planejamento de viagem',
    titulo: 'Sua viagem inteira, organizada dia a dia.',
    subtitulo:
      'Cadastre locais, passagens e hospedagens, monte o roteiro com sugestão automática e acompanhe o orçamento — tudo em um só lugar.',
    ctaPrimario: 'Criar conta grátis',
    ctaSecundario: 'Ver como funciona',
    microcopy: 'Grátis durante o MVP. Sem cartão de crédito.',
    diasDecorativos: ['Dia 1', 'Dia 2', 'Dia 3'],
  },

  problema: {
    titulo: 'Planejar viagem não deveria virar uma planilha.',
    texto:
      'Passagens no e-mail, hotel no print, restaurante salvo no celular, roteiro na cabeça. O Trip Planner junta tudo e transforma em um plano que cabe no dia.',
  },

  comoFunciona: {
    id: 'como-funciona',
    titulo: 'Do desejo ao roteiro em quatro passos.',
    passos: [
      {
        numero: 1,
        titulo: 'Crie a viagem',
        descricao: 'Destino, período (opcional), moeda e capa.',
      },
      {
        numero: 2,
        titulo: 'Junte o que você quer fazer',
        descricao:
          'Cadastre locais, passagens e hospedagens, ou importe uma passagem de PDF ou imagem.',
      },
      {
        numero: 3,
        titulo: 'Monte o roteiro',
        descricao:
          'Arraste os itens para os dias ou use a sugestão automática. O app avisa conflitos de horário.',
      },
      {
        numero: 4,
        titulo: 'Acompanhe o resto',
        descricao:
          'Veja o orçamento total, os pontos no mapa e o checklist da viagem.',
      },
    ] satisfies Passo[],
  },

  features: {
    titulo: 'Tudo o que a viagem precisa, no mesmo lugar.',
    itens: [
      {
        icone: CalendarDays,
        titulo: 'Roteiro dia a dia',
        descricao:
          'Organize os dias em colunas e arraste os itens. O app avisa quando dois horários se sobrepõem.',
      },
      {
        icone: Sparkles,
        titulo: 'Sugestão de roteiro',
        descricao:
          'O app propõe o encaixe dos locais considerando distância, deslocamento e horário de funcionamento.',
      },
      {
        icone: Wallet,
        titulo: 'Orçamento previsto',
        descricao:
          'Locais, passagens e hospedagens somados automaticamente, com total e distribuição por categoria.',
      },
      {
        icone: Map,
        titulo: 'Mapa da viagem',
        descricao:
          'Todos os locais e hospedagens no mapa, com filtro por categoria e por dia do roteiro.',
      },
      {
        icone: FileUp,
        titulo: 'Importação de passagem',
        descricao:
          'Importe de PDF, imagem ou preencha manualmente. Você revisa antes de salvar.',
      },
      {
        icone: ListTodo,
        titulo: 'Listas e checklists',
        descricao:
          'Documentos, roupas, eletrônicos e o que mais precisar, com progresso e valores previsto e pago.',
      },
    ] satisfies Feature[],
  },

  destaques: [
    {
      icone: Sparkles,
      titulo: 'A gente sugere. Você decide.',
      descricao:
        'O Trip Planner considera distância, tempo de deslocamento, horário de funcionamento e janelas livres para propor o encaixe dos locais nos dias. Você revisa, ajusta e aplica.',
      pontos: [
        'Distância e tempo de deslocamento',
        'Horário de funcionamento',
        'Janelas livres do dia',
      ],
    },
    {
      icone: Wallet,
      titulo: 'Saiba quanto a viagem custa antes de embarcar.',
      descricao:
        'Locais, passagens e hospedagens somados automaticamente, com total e distribuição por categoria na moeda da viagem.',
      pontos: [
        'Total da viagem',
        'Distribuição por categoria',
        'Moeda da viagem (BRL, USD ou EUR)',
      ],
    },
    {
      icone: Map,
      titulo: 'Veja sua viagem no mapa.',
      descricao:
        'Todos os locais e hospedagens com filtro por categoria e por dia do roteiro. Do planejamento à orientação no destino.',
      pontos: [
        'Filtro por categoria',
        'Filtro por dia do roteiro',
        'Locais e hospedagens no mesmo mapa',
      ],
    },
  ] satisfies Destaque[],

  paraQuem: {
    titulo: 'Para quem gosta de viajar com tudo no lugar.',
    itens: [
      {
        icone: Compass,
        titulo: 'Viajante organizador(a)',
        descricao: 'Quer controle total: roteiro por dia, horários, custos e checklist.',
      },
      {
        icone: Users,
        titulo: 'Família e grupo',
        descricao: 'Precisa de uma visão clara do que fazer em cada dia e do que levar.',
      },
      {
        icone: Luggage,
        titulo: 'Planejador de várias viagens',
        descricao:
          'Mantém a viagem ativa e o histórico das anteriores, sem misturar.',
      },
    ] satisfies Publico[],
  },

  faq: {
    titulo: 'Perguntas frequentes.',
    itens: [
      {
        pergunta: 'O Trip Planner é gratuito?',
        resposta:
          'Sim. Durante o MVP o Trip Planner é gratuito, sem cobrança e sem cartão de crédito.',
      },
      {
        pergunta: 'Preciso criar conta?',
        resposta:
          'Sim. A conta mantém suas viagens, roteiros e listas vinculados a você.',
      },
      {
        pergunta: 'Funciona no celular?',
        resposta: 'Sim. A interface foi desenhada para celular e desktop.',
      },
      {
        pergunta: 'Consigo importar minha passagem?',
        resposta:
          'Sim: por PDF, imagem (OCR) ou preenchimento manual, com revisão antes de salvar.',
      },
      {
        pergunta: 'O roteiro é automático?',
        resposta:
          'O app sugere uma distribuição. Você revisa, ajusta e decide o que aplicar.',
      },
      {
        pergunta: 'Consigo planejar mais de uma viagem?',
        resposta:
          'Sim. Uma viagem fica ativa e as anteriores permanecem no histórico.',
      },
      {
        pergunta: 'Meus dados ficam salvos?',
        resposta: 'Suas viagens ficam vinculadas à sua conta.',
      },
    ] satisfies FaqItem[],
  },

  ctaFinal: {
    titulo: 'Pronto para planejar sem pressa?',
    texto:
      'Crie sua viagem, junte seus lugares favoritos e veja o roteiro tomar forma.',
    botao: 'Criar conta grátis',
    microcopy: 'Grátis durante o MVP.',
  },

  footer: {
    links: [
      { rotulo: 'Entrar', para: '/login' },
      { rotulo: 'Criar conta', para: '/cadastro' },
      { rotulo: 'Como funciona', para: '#como-funciona' },
    ],
    creditos: 'Mapas © OpenStreetMap contributors',
  },
} as const
