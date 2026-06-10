/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());
const PORT = 3000;

// Lazy initialization of Gemini client as mandated by guidelines
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    // Return null to allow graceful fallback instead of crashing the server on startup or route invocation
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Global variable for fallback pre-defined questions in case Gemini API is not configured or fails
const FALLBACK_QUESTIONS = [
  {
    text: "Em visita de rotina a uma funilaria cadastrada como Ponto Estratégico (PE) em Promissão/SP, o ACE depara-se com acúmulo expressivo de carcaças e pneus sem proteção. Qual o período regulamentar em que os Pontos Estratégicos devem ser obrigatoriamente inspecionados?",
    options: [
      "Semanalmente",
      "Quinzenalmente (a cada 15 dias)",
      "Mensalmente",
      "Trimestralmente"
    ],
    correctIndex: 1,
    explanation: "Os Pontos Estratégicos (PEs) como ferros-velhos, borracharias, funilarias, depósitos de sucata e cemitérios devem ser inspecionados obrigatoriamente a cada 15 dias (quinzenalmente) devido à facilitação extrema e velocidade de multiplicação larvária nesses ambientes.",
    category: "Combate a Vetores (ACE)",
    difficulty: "Médio",
    source: "Simulado Especial Promissão"
  },
  {
    text: "Em conformidade com as diretrizes do Ministério da Saúde para o controle da Raiva Humana, qual animal é considerado o principal reservatório silvestre no ciclo de transmissão aérea em áreas urbanas do Estado de São Paulo?",
    options: [
      "Cão doméstico",
      "Morcego (especialmente o hematófago Desmodus rotundus)",
      "Rato de esgoto (Rattus norvegicus)",
      "Gato feral"
    ],
    correctIndex: 1,
    explanation: "Com o controle vacinal de cães e gatos, o morcego (nas espécies hematófagas ou mesmo insetívoras/frutívoras que vivem ou pousam em casas) tornou-se o principal responsável pela manutenção da transmissão biológica do vírus rábico em áreas urbanizadas no Estado de SP.",
    category: "Legislação do SUS",
    difficulty: "Médio",
    source: "VUNESP - Vigilância Integrada"
  }
];

// 1. API - 24h Tutor IA Chatbot
app.post('/api/tutor', async (req: Request, res: Response) => {
  const { messages, selectedRole } = req.body;
  const recentMessage = messages[messages.length - 1]?.text || '';
  
  const client = getGeminiClient();
  if (!client) {
    // Graceful mock fallback response for local development when key is missing or placeholder
    setTimeout(() => {
      res.json({
        text: `*(Modo Simulação local: Insira sua chave GEMINI_API_KEY nas Configurações do AI Studio para habilitar o tutor em tempo real!)* \n\nOlá! Sou o seu Tutor IA de Aprovação para Concursos da Prefeitura de Promissão/SP. \n\nCom relação à sua questão sobre **"${recentMessage.substring(0, 40)}..."**, focando no cargo de ${selectedRole || 'Agente de Combate às Endemias (ACE)'}, é fundamental frisar que as bancas (como a VUNESP) costumam cobrar prioritariamente o ciclo do Aedes, as diretrizes da Lei 8080/90, e as regras do Estatuto dos Servidores Municipais de Promissão. \n\nComo posso ajudar você em seu cronograma hoje? Podemos discutir a biologia celular dos vetores ou as licenças estatutárias!`
      });
    }, 500);
    return;
  }

  try {
    const chatHistory = messages.map((m: any) => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));

    // Prepend system prompt to define the persona in detail
    const systemPrompt = `Você é o Arquiteto IA e Professor Especialista em Concursos Públicos EdTech, treinado especificamente para garantir a aprovação de candidatos no concurso municipal da Prefeitura de Promissão/SP (Foco inicial: Agente de Combate às Endemias - ACE, mas capacitado a debater outros cargos).
Responda de forma extremamente pedagógica, encorajadora, objetiva e profissional no idioma Português (Brasil).
Apresente dicas de memorização, cite artigos de leis pertinentes (como Lei Federal 8.080/90 e Lei Orgânica do Município de Promissão), conceitue termos da biologia de vetores de forma visual e estruturada com bullet-points e destaque palavras-chave importantes usando negrito.`;

    const previousMessages = chatHistory.slice(0, -1);
    const chat = client.chats.create({
      model: 'gemini-3.5-flash',
      history: previousMessages,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      }
    });

    const response = await chat.sendMessage({
      message: recentMessage || "Olá!"
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini Tutor Error:", error);
    res.status(500).json({ error: "Erro ao processar instrução do Tutor", details: error.message });
  }
});

// 2. API - Explain Question Pedagogically
app.post('/api/explain-question', async (req: Request, res: Response) => {
  const { question, selectedOptionIndex } = req.body;
  
  const client = getGeminiClient();
  if (!client) {
    // Fallback explanation if Gemini is missing
    const isCorrect = selectedOptionIndex === question.correctIndex;
    const feedbackText = isCorrect 
      ? "Excelente! Sua resposta está absolutamente correta."
      : `Resposta errada. A opção correta é a letra "${String.fromCharCode(65 + question.correctIndex)}) ${question.options[question.correctIndex]}".`;
    
    res.json({
      text: `${feedbackText}\n\n*Explicação Simplificada (Modo Offline):*\n${question.explanation}\n\nDica de Estudos: No combate a endemias, compreender perfeitamente a diferença estatutária e de biologia de vetores evita pegadinhas da banca VUNESP. Revise este tópico periodicamente no seu módulo de cronograma de revisões espaçadas!`
    });
    return;
  }

  try {
    const userSelectedText = question.options[selectedOptionIndex];
    const correctText = question.options[question.correctIndex];

    const prompt = `Analise detalhadamente e explique pedagogicamente a seguinte questão de concurso para o cargo de Agente de Combate às Endemias (ACE).
Questão: "${question.text}"
Opções apresentadas:
${question.options.map((opt: string, idx: number) => `${String.fromCharCode(65 + idx)}) ${opt}`).join('\n')}

O candidato selecionou a opção: "${userSelectedText}"
A resposta correta oficial é: "${correctText}"

Por favor, faça uma análise didática:
1. Comece parabenizando ou fazendo uma observação construtiva com base na escolha do candidato.
2. Explique em termos claros por que a alternativa correta está certa, referenciando guias científicos, a Lei 8.080/90, ou estatutos de Promissão se relevante.
3. Desminta ou relativize brevemente as demais opções erradas para eliminar confusão.
4. Conclua com um "Macete ou Mnemônico" simples para o candidato guardar isso na memória de longo prazo para o dia do exame. Faça isso em Português e use formatação Markdown limpa.`;

    const response = await client.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        temperature: 0.3
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini Explain Error:", error);
    res.json({ text: `Erro na conexão com IA (${error.message}). Carregando gabarito padrão:\n\n${question.explanation}` });
  }
});

// 3. API - Generate Intelligent Custom Simulation Questions (uses Type.ARRAY and responseSchema!)
app.post('/api/generate-mock', async (req: Request, res: Response) => {
  const { topics, difficulty, numQuestions = 3 } = req.body;
  
  const client = getGeminiClient();
  if (!client) {
    // Generate a set of high-fidelity mock questions dynamically using fallback seeds
    const randomized = [...FALLBACK_QUESTIONS, ...FALLBACK_QUESTIONS.map((q, idx) => ({
      ...q,
      text: `[Dificuldade: ${difficulty}] - ${q.text} (Variante de estudo ${idx + 1})`
    }))];
    res.json({ questions: randomized.slice(0, numQuestions) });
    return;
  }

  try {
    const prompt = `Gere exatamente ${numQuestions} questões inéditas e altamente realistas de múltipla escolha (estilo VUNESP) para o concurso público municipal de Promissão/SP com foco no cargo de Agente de Combate às Endemias (ACE).
Os tópicos obrigatórios para incluir são: ${topics && topics.length > 0 ? topics.join(', ') : 'Biologia do Vetor e Legislação do SUS'}.
A dificuldade pretendida é: ${difficulty || 'Médio'}.
Cada questão gerada deve conter obrigatoriamente 4 opções válidas e plausíveis, 1 gabarito correto (mapeando o índice de 0 a 3 correspondente), uma explicação teórica de autoria contendo o embasamento legal ou técnico, e um mapeamento correto de disciplina.
Enfatize detalhes como a história de Promissão, as particularidades epidemiológicas locais (combate à Leishmaniose e Dengue) ou leis aplicáveis dos servidores de Promissão/SP.`;

    const response = await client.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              description: "Lista de questões inéditas geradas com alta precisão técnica.",
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { 
                    type: Type.STRING, 
                    description: "O enunciado completo da questão de concurso público." 
                  },
                  options: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING }, 
                    description: "Lista com exatamente 4 opções plausíveis de resposta." 
                  },
                  correctIndex: { 
                    type: Type.INTEGER, 
                    description: "O índice da resposta correta na lista de opções (0, 1, 2 ou 3)." 
                  },
                  explanation: { 
                    type: Type.STRING, 
                    description: "Explicação minuciosa e didática desdobrando o motivo de o gabarito ser o correto." 
                  },
                  category: { 
                    type: Type.STRING, 
                    description: "A disciplina da questão (ex: 'Biologia do Vetor', 'Legislação do SUS', 'Estatuto dos Servidores de Promissão', 'História e Geografia de Promissão')." 
                  },
                  difficulty: { 
                    type: Type.STRING, 
                    description: "Nível de complexidade da questão: Fácil, Médio ou Difícil." 
                  },
                  source: { 
                    type: Type.STRING, 
                    description: "Identificação da origem (ex: 'Simulador IA - Promissão Concursos')." 
                  }
                },
                required: ["text", "options", "correctIndex", "explanation", "category", "difficulty", "source"]
              }
            }
          },
          required: ["questions"]
        }
      }
    });

    const parsedData = JSON.parse(response.text || '{}');
    res.json({ questions: parsedData.questions || [] });
  } catch (error: any) {
    console.error("Gemini Generate Mock Error:", error);
    res.json({ questions: FALLBACK_QUESTIONS });
  }
});

// 4. API - Correct Written Discursive Health Inspector Answers
app.post('/api/correct-discursive', async (req: Request, res: Response) => {
  const { questionText, candidateSolution } = req.body;
  
  const client = getGeminiClient();
  if (!client) {
    // Detailed local response grades
    res.json({
      score: 85,
      coerencia: 90,
      conteudo: 85,
      linguagem: 80,
      feedback: "Sua resposta apresenta uma excelente contextualização do serviço público geral do ACE. (Modo Offline) Para obter nota máxima 100, lembre-se de detalhar de forma incisiva e formal as penalidades estatutárias de advertência e lavratura de auto de infração previstos nos estatutos sanitários de Promissão/SP. Parabéns pelo empenho de escrita!"
    });
    return;
  }

  try {
    const prompt = `Você é um avaliador oficial de provas discursivas de concursos para saúde municipal. Corrija de forma detalhada a resposta discursiva manuscrita simulada abaixo:

Instrução da questão: "${questionText}"
Resposta digitada pelo Candidato: "${candidateSolution}"

Por favor, faça uma avaliação meticulosa em formato JSON com as notas de 0 a 100 para os seguintes critérios, além de uma resenha didática construtiva em Markdown (em Português):
1. 'coerencia': Adequação da resposta ao enunciado e lógica de argumentos.
2. 'conteudo': Domínio técnico de saúde pública, controle de endemias, leis do SUS e regulamentos locais de Promissão.
3. 'linguagem': Formalidade da escrita, gramática e coesão textual.

Use o seguinte formato JSON estrito:
{
  "score": <nota_geral_media_inteiro>,
  "coerencia": <nota_coerencia_inteiro>,
  "conteudo": <nota_conteudo_inteiro>,
  "linguagem": <nota_linguagem_inteiro>,
  "feedback": "<relatorio_completo_com_pontos_fortes_fracos_e_exemplo_de_como_reescrever_para_obter_nota_100_em_markdown>"
}`;

    const response = await client.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            coerencia: { type: Type.INTEGER },
            conteudo: { type: Type.INTEGER },
            linguagem: { type: Type.INTEGER },
            feedback: { type: Type.STRING }
          },
          required: ["score", "coerencia", "conteudo", "linguagem", "feedback"]
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    res.json(result);
  } catch (error: any) {
    console.error("Gemini Correct Discursive Error:", error);
    res.status(500).json({ error: "Erro na correção automática da redação", details: error.message });
  }
});

// 5. API - Generate Personalized Intelligent Studiy Schedule based on preferences and weaknesses
app.post('/api/generate-schedule', async (req: Request, res: Response) => {
  const { availableHours, difficultiesList } = req.body;
  
  const client = getGeminiClient();
  if (!client) {
    // Generate simulated schedules directly
    res.json({
      schedule: [
        { id: 'sc_1', day: 'Segunda', subject: 'Combate a Vetores (ACE)', topic: `Enfoque em: ${difficultiesList[0] || 'Controle Larvário'}`, timeMinutes: availableHours * 60, completed: false },
        { id: 'sc_2', day: 'Terça', subject: 'Legislação do SUS', topic: 'Constituição Federal Art' + ' 196 a 200', timeMinutes: availableHours * 60, completed: false },
        { id: 'sc_3', day: 'Quarta', subject: 'História e Geografia de Promissão', topic: 'Colônia Aliança e Economia', timeMinutes: Math.floor(availableHours * 60 * 0.7), completed: false },
        { id: 'sc_4', day: 'Quinta', subject: 'Combate a Vetores (ACE)', topic: 'Praguicidas aplicados por bomba focal', timeMinutes: availableHours * 60, completed: false },
        { id: 'sc_5', day: 'Sexta', subject: 'Lei Orgânica de Promissão', topic: 'Regime Jurídico Único dos Servidores', timeMinutes: availableHours * 60, completed: false }
      ]
    });
    return;
  }

  try {
    const prompt = `Gere uma rotina semanal personalizada de estudos para o concurso da Prefeitura de Promissão/SP (Agente de Endemias).
O candidato tem disponíveis ${availableHours} horas por dia para estudar.
Dificuldades prioritárias selecionadas pelo aluno: ${difficultiesList.join(', ')}.

Crie um calendário completo de Segunda a Domingo. Forneça o resultado no formato JSON esperado abaixo contendo um array de rotinas com: id, day (dia da semana por extenso), subject (matéria), topic (tópico de aula prático), timeMinutes (tempo sugerido de estudo em minutos) e completed (sempre false).`;

    const response = await client.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            schedule: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  day: { type: Type.STRING, description: "Segunda, Terça, Quarta, Quinta, Sexta, Sábado ou Domingo" },
                  subject: { type: Type.STRING, description: "Nome da disciplina (ex: Combate a Vetores (ACE), Legislação do SUS, História e Geografia de Promissão)" },
                  topic: { type: Type.STRING, description: "Tópico focado voltado às dificuldades especificadas" },
                  timeMinutes: { type: Type.INTEGER, description: "Tempo sugerido em minutos" },
                  completed: { type: Type.BOOLEAN }
                },
                required: ["id", "day", "subject", "topic", "timeMinutes", "completed"]
              }
            }
          },
          required: ["schedule"]
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    res.json({ schedule: result.schedule || [] });
  } catch (error: any) {
    console.error("Gemini Schedule Generation Error:", error);
    res.status(500).json({ error: "Erro ao gerar cronograma personalizado", details: error.message });
  }
});


// Serve static assets in production or use Vite middleware in development
async function startServer() {
  if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
    });
  }
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
