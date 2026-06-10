/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Question, Achievement, Flashcard, ForumPost, LocalLawSummary, VideoLesson, PdfMaterial, StudyScheduleItem } from './types';

// Pre-seeded high-fidelity questions focused heavily on ACE (Agente de Combate às Endemias), SUS, and Promissão/SP local content.
export const initialQuestions: Question[] = [
  {
    id: 'q1',
    text: 'Sobre o ciclo biológico do mosquito Aedes aegypti, vetor de agravos como a Dengue, Chikungunya e Zika, assinale a alternativa que indica a sequência CORRETA das fases de desenvolvimento:',
    options: [
      'Ovo, Lagarta, Casulo, Mosquito Adulto',
      'Ovo, Larva, Popa (ou Crisálida), Mosquito Adulto',
      'Ovo, Larva, Pupa, Mosquito Adulto',
      'Ovo, Ninfa, Pupa, Mosquito Adulto'
    ],
    correctIndex: 2,
    explanation: 'O desenvolvimento do Aedes aegypti ocorre por metamorfose completa (holometábolo), passando por quatro fases distintas em seu ciclo de vida: Ovo, Larva (4 estágios larvários), Pupa (fase de transição rápida que dura cerca de 2 dias) e Adulto (fase alada).',
    category: 'Biologia do Vetor',
    difficulty: 'Fácil',
    source: 'VUNESP - Adaptada'
  },
  {
    id: 'q2',
    text: 'A Lei Federal nº 8.080 de 1990 (Lei Orgânica da Saúde) dispõe sobre as condições para a promoção, proteção e recuperação da saúde. Um dos princípios doutrinários fundamentais do Sistema Único de Saúde (SUS) previstos nesta lei é a:',
    options: [
      'Centralização político-administrativa nas capitais federais',
      'Universalidade de acesso aos serviços de saúde em todos os níveis de assistência',
      'Participação exclusiva de entidades privadas filantrópicas',
      'Atendimento prioritário às parcelas da população com maior renda'
    ],
    correctIndex: 1,
    explanation: 'A Universalidade de acesso aos serviços de saúde em todos os níveis de assistência é um dos princípios fundamentais do SUS (Art. 7º, I da Lei 8080/90), garantindo que todo cidadão tenha direito ao atendimento público de saúde sem qualquer distinção.',
    category: 'Legislação do SUS',
    difficulty: 'Fácil',
    source: 'VUNESP'
  },
  {
    id: 'q3',
    text: 'A história do município de Promissão/SP é fortemente ligada à colonização japonesa no início do século XX, que impulsionou o desenvolvimento agrícola da região. Quem foi o importante líder pioneiro que comandou o primeiro grupo de colonos japoneses a se estabelecer nas terras do atual município?',
    options: [
      'Shuhei Uetsuka',
      'Heizo Kitahara',
      'Michio Kaku',
      'Nobuo Nakagawa'
    ],
    correctIndex: 0,
    explanation: 'Doutor Shuhei Uetsuka (conhecido carinhosamente como o "Pai da Colonização Japonesa no Brasil") liderou e organizou a fixação de imigrantes japoneses na região do atual município de Promissão/SP, estabelecendo a histórica Colônia Aliança em 1918, um marco para o município.',
    category: 'História e Geografia de Promissão',
    difficulty: 'Médio',
    source: 'Prefeitura de Promissão - Histórico'
  },
  {
    id: 'q4',
    text: 'No controle químico das populações de Aedes aegypti, o Agente de Combate às Endemias (ACE) realiza o Tratamento Focal e o Tratamento Perifocal. Qual o principal objetivo do Tratamento Focal?',
    options: [
      'Eliminar mosquitos adultos em pleno voo usando termonebulização (Fumacê)',
      'Aplicar larvicida diretamente nos depósitos de água que não possam ser eliminados mecanicamente',
      'Espalhar repelentes químicos nas fachadas das residências',
      'Vistorias apenas em terrenos desocupados sem contato com reservatórios'
    ],
    correctIndex: 1,
    explanation: 'O tratamento focal consiste na aplicação de produtos químicos larvicidas diretamente nos depósitos de água que contêm ou possam conter larvas do mosquito e que não podem ser destruídos, removidos ou limpos mecanicamente de forma fácil.',
    category: 'Combate a Vetores (ACE)',
    difficulty: 'Médio',
    source: 'Manual do ACE - Ministério da Saúde'
  },
  {
    id: 'q5',
    text: 'Segundo a Lei Orgânica do Município de Promissão, a iniciativa das leis complementares e ordinárias cabe ao Prefeito, a qualquer membro ou Comissão da Câmara Municipal e também aos cidadãos. A iniciativa popular de projetos de lei de interesse específico do Município exige a adesão de, no mínimo, qual percentual do eleitorado local?',
    options: [
      '1% dos eleitores inscritos no município',
      '5% dos eleitores inscritos no município',
      '10% dos eleitores inscritos no município',
      '15% dos eleitores inscritos no município'
    ],
    correctIndex: 1,
    explanation: 'Seguindo a regra geral das leis orgânicas municipais alinhadas com a Constituição Federal (e especificamente o estatuto de Promissão/SP), a iniciativa popular de interesse local exige que o projeto de lei seja subscrito por pelo menos 5% do eleitorado do município.',
    category: 'Lei Orgânica de Promissão',
    difficulty: 'Difícil',
    source: 'Câmara de Promissão/SP'
  },
  {
    id: 'q6',
    text: 'Durante uma visita domiciliar rotineira, o ACE encontra um quintal repleto de poças d\'água formadas pela chuva sobre lonas plásticas e recipientes descartáveis espalhados. Qual a primeira conduta pedagógica e operacional adequada que o agente deve adotar?',
    options: [
      'Aplicar inseticida de ultra baixo volume (UBV) no local imediatamente sem falar com o morador',
      'Aplicar multas e notificar judicialmente o proprietário da residência de imediato',
      'Orientar o morador sobre o descarte correto de materiais, demonstrar como eliminar os acúmulos de água de forma mecânica e pedir sua autorização para ajudar a limpar',
      'Ignorar o quintal e pedir ao morador que assine a ficha de visita sinalizando "recinto totalmente limpo"'
    ],
    correctIndex: 2,
    explanation: 'A educação em saúde é a principal ferramenta do ACE. Ele deve orientar o morador de forma clara e cortês, promovendo o controle mecânico (remoção manual de criadouros) e co-responsabilizando o morador pela manutenção contínua de seu espaço.',
    category: 'Visita Domiciliar e Comunicação',
    difficulty: 'Médio',
    source: 'Manual Operacional de Endemias'
  },
  {
    id: 'q7',
    text: 'A Leishmaniose Visceral Humana é uma doença infecciosa grave causada pelo protozoário Leishmania infantum. Assinale a alternativa que indica o vetor biológico responsável por essa transmissão ao homem e outros mamíferos:',
    options: [
      'Mosquito da malária (Anopheles darlingi)',
      'Mosquito-Palha ou Birigui (Lutzomyia longipalpis)',
      'Barbeiro (Triatoma infestans)',
      'Mosquito Comum (Culex quinquefasciatus)'
    ],
    correctIndex: 1,
    explanation: 'A Leishmaniose Visceral é transmitida pela picada de fêmeas infectadas do inseto conhecido popularmente como "Mosquito-palha", "birigui" ou "cangalhinha", pertencente à família dos flebotomíneos (Lutzomyia longipalpis).',
    category: 'Combate a Vetores (ACE)',
    difficulty: 'Médio',
    source: 'VUNESP - Biologia da Saúde'
  },
  {
    id: 'q8',
    text: 'Em relação ao Regime Jurídico Único dos Servidores de Promissão/SP, as penalidades disciplinares aplicáveis aos servidores públicos municipais que descumprirem seus deveres funcionais legais incluem:',
    options: [
      'Apenas Advertência verbal informal',
      'Advertência por escrito, Suspensão, Demissão, Cassação de Aposentadoria e Destituição de cargo em comissão',
      'Multa pecuniária equivalente ao dobro do salário anual e prisão temporária administrativa',
      'Afastamento sem remuneração por tempo indeterminado decidido pelo chefe do setor'
    ],
    correctIndex: 1,
    explanation: 'O Estatuto dos Servidores Municipais prevê penalidades formais estritas: Advertência escrita, Suspensão temporária aplicável após processo administrativo regular, Demissão direta (em casos graves previstos em lei), Cassação de aposentadorias ou disponibilidade e destituição de comissões.',
    category: 'Estatuto dos Servidores de Promissão',
    difficulty: 'Médio',
    source: 'Estatuto dos Funcionários Públicos de Promissão'
  }
];

export const initialAchievements: Achievement[] = [
  {
    id: 'ach_1',
    title: 'Comunidade Promissense',
    description: 'Inicie os estudos focados no concurso da Prefeitura de Promissão/SP.',
    icon: 'Compass',
    unlockedAt: new Date().toISOString(),
    xpValue: 100,
    category: 'special'
  },
  {
    id: 'ach_2',
    title: 'Foco de Elite (ACE)',
    description: 'Acerte 5 questões seguidas sobre Biologia do Vetor ou Combate à Dengue.',
    icon: 'ShieldAlert',
    xpValue: 250,
    category: 'accuracy'
  },
  {
    id: 'ach_3',
    title: 'Hábito Inabalável',
    description: 'Mantenha uma sequência (streak) de 3 dias seguidos estudando.',
    icon: 'Zap',
    xpValue: 300,
    category: 'streak'
  },
  {
    id: 'ach_4',
    title: 'Constitucional do SUS',
    description: 'Responda com sucesso um simulado completo focado na Lei 8.080/90.',
    icon: 'Scale',
    xpValue: 400,
    category: 'studies'
  },
  {
    id: 'ach_5',
    title: 'Cidadão Promissão',
    description: 'Obtenha 100% de aproveitamento na disciplina de História e Geografia de Promissão.',
    icon: 'MapPin',
    xpValue: 500,
    category: 'special'
  }
];

export const initialFlashcards: Flashcard[] = [
  {
    id: 'fc_1',
    front: 'O que caracteriza a Universalidade de Acesso no SUS?',
    back: 'É a garantia de que a saúde é um direito de todos e dever do Estado, cabendo aos serviços públicos garantir o acesso integral a qualquer cidadão brasileiro, independentemente de classe social, contribuição previdenciária, cor ou gênero.',
    category: 'Legislação do SUS',
    nextReviewDate: new Date().toISOString(),
    intervalDays: 1,
    easeFactor: 2.5
  },
  {
    id: 'fc_2',
    front: 'Qual o nome científico do mosquito transmissor da dengue e qual seu hábito de voo e alimentação preferidos?',
    back: 'Aedes aegypti. Possui hábitos preferencialmente diurnos (especialmente no início da manhã e fim da tarde), é antropofílico (alimenta-se de sangue humano) e fêmeas necessitam de hematofagia para maturação dos ovos.',
    category: 'Biologia do Vetor',
    nextReviewDate: new Date().toISOString(),
    intervalDays: 1,
    easeFactor: 2.5
  },
  {
    id: 'fc_3',
    front: 'O que rege a Lei 8.142 de 1990?',
    back: 'Dispõe sobre a participação da comunidade na gestão do Sistema Único de Saúde (SUS) e sobre as transferências intergovernamentais de recursos financeiros na área da saúde. Ela instituiu os Conselhos de Saúde e as Conferências de Saúde.',
    category: 'Legislação do SUS',
    nextReviewDate: new Date().toISOString(),
    intervalDays: 1,
    easeFactor: 2.5
  },
  {
    id: 'fc_4',
    front: 'Em que ano Promissão/SP foi oficialmente emancipada político-administrativamente?',
    back: 'Promissão foi emancipada e elevada à categoria de município em 29 de novembro de 1923 (desmembrando-se de Lins). É famosa pela histórica Colônia Aliança estabelecida por imigrantes liderados por Shuhei Uetsuka.',
    category: 'História e Geografia de Promissão',
    nextReviewDate: new Date(Date.now() + 86400000).toISOString(),
    intervalDays: 2,
    easeFactor: 2.6
  },
  {
    id: 'fc_5',
    front: 'Qual a diferença crucial entre Tratamento Focal e Tratamento Perifocal para o ACE?',
    back: 'Tratamento Focal: Aplicação de larvicida direto nos reservatórios de água. Tratamento Perifocal: Aplicação de inseticida de efeito residual nas paredes externas de depósitos (ex: borracharias, ferros-velhos) para atingir os mosquitos adultos que pousam nesses locais.',
    category: 'Combate a Vetores (ACE)',
    nextReviewDate: new Date().toISOString(),
    intervalDays: 1,
    easeFactor: 2.5
  }
];

export const localLawSummaries: LocalLawSummary[] = [
  {
    id: 'law_org',
    title: 'Lei Orgânica Municipal de Promissão/SP',
    subtitle: 'A "Constituição" do Município de Promissão',
    description: 'Documento fundamental que rege os poderes municipais, competências, organização legislativa e diretrizes administrativas locais de Promissão.',
    fullTextSummary: 'A Lei Orgânica do Município de Promissão organiza a governabilidade local. Ela define a separação entre o Poder Executivo (Prefeito e Secretários) e o Poder Legislativo (Câmara de Vereadores). Trata também dos princípios da administração pública, do plano diretor urbano, da preservação de mananciais hídricos e do fomento à agricultura e colonização japonesa tradicional.',
    keyArticles: [
      {
        article: 'Artigo 4º',
        text: 'Constituem bens do Município todas as coisas móveis e imóveis, direitos e ações que, a qualquer título, lhe pertençam.',
        note: 'Tema frequente na prova sobre patrimônio público municipal.'
      },
      {
        article: 'Artigo 12º',
        text: 'A Câmara Municipal é composta por representantes do povo direto, eleitos pelo sistema proporcional para legislaturas com duração de 4 anos.',
        note: 'Importante sobre os trâmites legislativos ordinários.'
      },
      {
        article: 'Artigo 78º',
        text: 'Compete privativamente ao Prefeito sancionar, promulgar e fazer publicar as leis aprovadas pela Câmara, bem como vetá-las no todo ou em parte.',
        note: 'Prerrogativa fundamental do executivo municipal na edição normativa local.'
      }
    ]
  },
  {
    id: 'law_est',
    title: 'Estatuto dos Servidores Públicos - Promissão/SP',
    subtitle: 'RJU (Regime Jurídico Único) - Lei Complementar Municipal',
    description: 'Dispõe sobre o regime estatutário do funcionalismo municipal, estabelecendo direitos, deveres, licenças, vencimentos adicionais e ritos de processo administrativo disciplinar (PAD).',
    fullTextSummary: 'Este estatuto garante a estabilidade do servidor após 3 anos de efetivo exercício, regula as férias de 30 dias com adicional de 1/3, a concessão da licença-prêmio por assiduidade a cada quinquênio trabalhado, gratificações por periculosidade e insalubridade de extrema importância para o cargo de Agente de Endemias (ACE), o qual manipula praguicidas periódicos.',
    keyArticles: [
      {
        article: 'Artigo 24º',
        text: 'A posse no cargo público dependerá de prévia inspeção médica oficial do Município, e só poderá ser empossado aquele julgado apto física e mentalmente.',
        note: 'Condição de investidura de extrema importância pós-aprovação.'
      },
      {
        article: 'Artigo 90º',
        text: 'O servidor que realizar atividades insalubres ou perigosas de forma contínua faz jus a um adicional incidente sobre o vencimento do cargo.',
        note: 'Regra de ouro para cargos de ACE envolvidos em manuseio químico de larvicidas e inseticidas.'
      },
      {
        article: 'Artigo 123º',
        text: 'São deveres do servidor: manter assiduidade, pontualidade, urbanidade no trato com os munícipes, observância às ordens de superiores legítimos e sigilo profissional.',
        note: 'Deveres funcionais lidos com frequência nas questões de ética no serviço público.'
      }
    ]
  }
];

export const initialVideoLessons: VideoLesson[] = [
  {
    id: 'v_1',
    title: 'Biologia Aplicada do Aedes aegypti e Vetores',
    duration: '18:45',
    instructor: 'Profa. Dra. Marina Mendes (EdTech Saúde)',
    category: 'Combate a Vetores (ACE)',
    thumbnail: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&q=80&w=300',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4'
  },
  {
    id: 'v_2',
    title: 'Introdução ao Sistema Único de Saúde (SUS) e Lei 8.080/90',
    duration: '24:12',
    instructor: 'Prof. Carlos Eduardo (Especialista Concursos)',
    category: 'Legislação do SUS',
    thumbnail: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=300',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4'
  },
  {
    id: 'v_3',
    title: 'Colonização Japonesa e a História Local de Promissão',
    duration: '12:30',
    instructor: 'Historiadora Ana Cláudia Sato',
    category: 'História e Geografia de Promissão',
    thumbnail: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&q=80&w=300',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4'
  },
  {
    id: 'v_4',
    title: 'Visitas Domiciliares, Abordagem Ética e Relatórios',
    duration: '16:05',
    instructor: 'Supervisor de Combate a Endemias Gerson Silva',
    category: 'Visita Domiciliar e Comunicação',
    thumbnail: 'https://images.unsplash.com/photo-1527689368864-3a821dbccc34?auto=format&fit=crop&q=80&w=300',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4'
  }
];

export const initialPdfMaterials: PdfMaterial[] = [
  {
    id: 'pdf_1',
    title: 'Apostila Completa do Agente de Combate às Endemias (ACE)',
    fileSize: '12.4 MB',
    pages: 142,
    author: 'Equipe Pedagógica Promissão Concursos',
    category: 'Combate a Vetores (ACE)',
    downloadCount: 382
  },
  {
    id: 'pdf_2',
    title: 'Caderno de Leis Municipais Anotadas - Promissão/SP',
    fileSize: '4.8 MB',
    pages: 65,
    author: 'Prof. Sérgio Nogueira (Direito Administrativo)',
    category: 'Lei Orgânica de Promissão',
    downloadCount: 201
  },
  {
    id: 'pdf_3',
    title: 'Guia Rápido dos Princípios Doutrinários e Organizativos do SUS',
    fileSize: '2.1 MB',
    pages: 28,
    author: 'Ministério da Saúde (Adaptado para Concursos)',
    category: 'Legislação do SUS',
    downloadCount: 412
  },
  {
    id: 'pdf_4',
    title: 'Resumo Ilustrado de História, Economia e Colonização de Promissão',
    fileSize: '3.7 MB',
    pages: 19,
    author: 'Decreto de Informações de Promissão/SP (2026)',
    category: 'História e Geografia de Promissão',
    downloadCount: 154
  }
];

export const initialForumPosts: ForumPost[] = [
  {
    id: 'p_1',
    authorName: 'Rodrigo Antunes',
    authorRole: 'Candidato',
    authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
    title: 'Dúvida cruel sobre o Artigo 123 da estatuto de Promissão',
    content: 'O Estatuto dos Servidores de Promissão estipula indenização de transporte para quem viaja a serviço em veículo próprio, mas li em uma questão que isso não era reembolsado sob certas circunstâncias. Alguém confirma a interpretação oficial para a banca VUNESP?',
    likes: 12,
    commentsCount: 4,
    category: 'Jurisprudência Local',
    timestamp: 'Há 2 horas'
  },
  {
    id: 'p_2',
    authorName: 'Profa. Eliane Souza',
    authorRole: 'Especialista',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    title: '🔥 Checklist Completo dos principais focos de Dengue na bacia do Dourado',
    content: 'Olá pessoal! Como muitos sabem, a região de Promissão, cortada pela bacia hidrográfica local, possui locais ideais de procriação em ferros-velhos de áreas periféricas e chácaras produtivas. A VUNESP ama misturar técnicas de vigilância ambiental com a geografia do Tietê-Batalha. Preparei um mini-resumo para vocês! Bons estudos!',
    likes: 45,
    commentsCount: 18,
    category: 'Combate a Vetores (ACE)',
    timestamp: 'Há 5 horas'
  },
  {
    id: 'p_3',
    authorName: 'Beatriz Yoshida',
    authorRole: 'Aprovado',
    authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150',
    title: 'Foco e consistência: Meu relato de aprovação de 3º para 1º lugar',
    content: 'O segredo absoluto para gabaritar a prova específica da Prefeitura de Promissão foi fazer simulados programados focando de forma obsessiva na curva de esquecimento semanal. A repetição espaçada e o tutor inteligente me ajudaram na época a identificar que eu errava muito a biologia do vetor. Sigam firmes que a vaga é de vocês!',
    likes: 88,
    commentsCount: 31,
    category: 'Dicas de Estudo',
    timestamp: 'Ontem'
  }
];

export const defaultSchedule: StudyScheduleItem[] = [
  {
    id: 'sch_1',
    day: 'Segunda',
    subject: 'Legislação do SUS',
    topic: 'Leis 8.080/90 e 8.142/90: Diretrizes',
    timeMinutes: 90,
    completed: true
  },
  {
    id: 'sch_2',
    day: 'Terça',
    subject: 'Combate a Vetores (ACE)',
    topic: 'Identificação e Biologia do Aedes aegypti',
    timeMinutes: 90,
    completed: true
  },
  {
    id: 'sch_3',
    day: 'Quarta',
    subject: 'História e Geografia de Promissão',
    topic: 'Colonização Japonesa e Bacia Tietê-Batalha',
    timeMinutes: 60,
    completed: false
  },
  {
    id: 'sch_4',
    day: 'Quinta',
    subject: 'Combate a Vetores (ACE)',
    topic: 'Vigilância Epidemiológica e Visitas Domiciliares',
    timeMinutes: 90,
    completed: false
  },
  {
    id: 'sch_5',
    day: 'Sexta',
    subject: 'Lei Orgânica de Promissão',
    topic: 'Regime Jurídico Único dos Servidores Municipais',
    timeMinutes: 90,
    completed: false
  },
  {
    id: 'sch_6',
    day: 'Sábado',
    subject: 'Simulados',
    topic: 'Simulado Semanal de Revisão Ativa',
    timeMinutes: 120,
    completed: false
  },
  {
    id: 'sch_7',
    day: 'Domingo',
    subject: 'Atividades',
    topic: 'Descanso Ativo & Revisão de Flashcards Fracos',
    timeMinutes: 45,
    completed: false
  }
];
