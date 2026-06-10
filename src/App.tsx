/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Menu, X, Sparkles, Brain, GraduationCap, CheckSquare, 
  HelpCircle, Award, Compass, Search, Bookmark, CheckCircle, 
  XCircle, Send, MessageSquare, BookOpen, Clock, Play, FileText, 
  Plus, BarChart2, ShieldCheck, MapPin, Zap, RefreshCw, Layers,
  Volume2, VolumeX, Flame, Heart, Target, AlertTriangle
} from 'lucide-react';
import { 
  initialQuestions, initialAchievements, initialFlashcards, 
  localLawSummaries, initialVideoLessons, initialPdfMaterials, 
  initialForumPosts, defaultSchedule 
} from './data';
import { Question, Flashcard, ForumPost, LocalLawSummary, VideoLesson, PdfMaterial, StudyScheduleItem } from './types';
import AILoading from './components/AILoading';

// Web Audio API Synthesizer for high-fidelity immersive gameplay feedback
let audioCtx: AudioContext | null = null;
const playAudioEffect = (type: 'click' | 'correct' | 'wrong' | 'unlock' | 'ticking' | 'laser') => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.connect(g);
    g.connect(audioCtx.destination);

    const now = audioCtx.currentTime;

    if (type === 'click') {
      o.type = 'sine';
      o.frequency.setValueAtTime(600, now);
      o.frequency.exponentialRampToValueAtTime(150, now + 0.08);
      g.gain.setValueAtTime(0.05, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      o.start(now);
      o.stop(now + 0.08);
    } else if (type === 'correct') {
      o.type = 'triangle';
      o.frequency.setValueAtTime(523.25, now); // C5
      o.frequency.setValueAtTime(659.25, now + 0.1); // E5
      g.gain.setValueAtTime(0.08, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      o.start(now);
      o.stop(now + 0.3);
    } else if (type === 'wrong') {
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(130, now);
      o.frequency.linearRampToValueAtTime(80, now + 0.35);
      g.gain.setValueAtTime(0.09, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      o.start(now);
      o.stop(now + 0.35);
    } else if (type === 'unlock') {
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99]; // C Major
      notes.forEach((freq, idx) => {
        const osc = audioCtx!.createOscillator();
        const gainNode = audioCtx!.createGain();
        osc.connect(gainNode);
        gainNode.connect(audioCtx!.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);
        gainNode.gain.setValueAtTime(0.06, now + idx * 0.06);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.45);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.45);
      });
    } else if (type === 'ticking') {
      o.type = 'sine';
      o.frequency.setValueAtTime(1100, now);
      g.gain.setValueAtTime(0.015, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
      o.start(now);
      o.stop(now + 0.03);
    } else if (type === 'laser') {
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(1400, now);
      o.frequency.exponentialRampToValueAtTime(120, now + 0.28);
      g.gain.setValueAtTime(0.07, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      o.start(now);
      o.stop(now + 0.28);
    }
  } catch (err) {
    console.warn('Audio synthesis bypassed or muted:', err);
  }
};

// Standard native mobile browser physical vibration haptic response
const vibrateDevice = (pattern: number | number[]) => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate(pattern);
    } catch {}
  }
};

// Web Speech API Text-to-Speech (TTS) voice engine for speaking AI Tutor
let speechVoice: SpeechSynthesisVoice | null = null;
const handleSpeakText = (text: string) => {
  if ('speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      const cleaned = text.replace(/[*#_`~]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleaned);
      utterance.lang = 'pt-BR';
      utterance.rate = 1.05;
      
      const voices = window.speechSynthesis.getVoices();
      const ptVoice = voices.find(v => v.lang.startsWith('pt'));
      if (ptVoice) {
        utterance.voice = ptVoice;
      }
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn("Speech Synthesis engine exception:", err);
    }
  }
};

export default function App() {
  // Navigation & General App State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tutor' | 'questions' | 'simulados' | 'flashcards' | 'promissao' | 'materials' | 'comunidade' | 'admin' | 'arena'>('dashboard');
  const [selectedRole, setSelectedRole] = useState<'Agente de Combate às Endemias' | 'Agente Comunitário de Saúde' | 'Vigilante Sanitário'>('Agente de Combate às Endemias');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMoreDrawerOpen, setIsMoreDrawerOpen] = useState(false);
  const [expandedLawId, setExpandedLawId] = useState<string | null>('l1');
  
  const [stats, setStats] = useState({
    xp: 2400,
    level: 24,
    dailyStreak: 15,
    studiedHours: 142,
    estimatedApproval: 84,
    questionsAnswered: 135,
    questionsCorrect: 110,
    rankingPosition: 12,
    rankingTotal: 450,
  });

  // Notifications or toast messages
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>({
    message: "Bem-vindo ao Promissão Concursos! Sua jornada rumo à aprovação de ACE começou.",
    type: "success"
  });

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // State Persistence for Questions / Quizzing
  const [questions, setQuestions] = useState<Question[]>(() => {
    try {
      const saved = localStorage.getItem('pm_questions');
      return saved ? JSON.parse(saved) : initialQuestions;
    } catch {
      return initialQuestions;
    }
  });

  useEffect(() => {
    localStorage.setItem('pm_questions', JSON.stringify(questions));
  }, [questions]);

  // Selected state for answering questions
  const [currQuestionIndex, setCurrQuestionIndex] = useState(0);
  const [selectedAnswerIdx, setSelectedAnswerIdx] = useState<number | null>(null);
  const [hasSubmittedAnswer, setHasSubmittedAnswer] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const [filters, setFilters] = useState({ category: 'Todos', difficulty: 'Todos' });

  // Filtered Questions List
  const filteredQuestions = questions.filter(q => {
    const matchCat = filters.category === 'Todos' || q.category === filters.category;
    const matchDiff = filters.difficulty === 'Todos' || q.difficulty === filters.difficulty;
    return matchCat && matchDiff;
  });

  // Bookmark toggles
  const handleToggleBookmark = (id: string) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, isBookmarked: !q.isBookmarked } : q));
    const isBooked = !questions.find(q => q.id === id)?.isBookmarked;
    showToast(isBooked ? "Questão favoritada com sucesso para revisão rápida!" : "Questão removida dos favoritos.", "info");
  };

  // Submit Answer & Calculate Stats
  const handleSubmitAnswer = (chosenIndex: number) => {
    if (hasSubmittedAnswer) return;
    setSelectedAnswerIdx(chosenIndex);
    setHasSubmittedAnswer(true);

    const isCorrect = chosenIndex === filteredQuestions[currQuestionIndex].correctIndex;
    
    // Play sounds and haptic vibration feedback
    if (isCorrect) {
      playAudioEffect('correct');
      vibrateDevice(50);
    } else {
      playAudioEffect('wrong');
      vibrateDevice([100, 50, 100]);
    }
    
    // Update question status
    setQuestions(prev => prev.map(q => q.id === filteredQuestions[currQuestionIndex].id ? { ...q, userAnswer: chosenIndex } : q));

    // Update global stats
    const xpGained = isCorrect ? 35 : 10;
    setStats(prev => {
      const newAnswers = prev.questionsAnswered + 1;
      const newCorrect = prev.questionsCorrect + (isCorrect ? 1 : 0);
      const newApproval = Math.round((newCorrect / newAnswers) * 100);
      const newXp = prev.xp + xpGained;
      const newLevel = Math.floor(newXp / 100);
      return {
        ...prev,
        questionsAnswered: newAnswers,
        questionsCorrect: newCorrect,
        estimatedApproval: Math.min(98, Math.max(20, newApproval + 10)), // Simulated approval rate formula
        xp: newXp,
        level: newLevel > prev.level ? newLevel : prev.level
      };
    });

    if (isCorrect) {
      showToast(`Certo! +35 XP. Excelente domínio de ${filteredQuestions[currQuestionIndex].category}!`, 'success');
    } else {
      showToast('Errado. Ative a explicação da IA para solidificar este conceito. +10 XP.', 'error');
    }
  };

  // 1. Tutor Chat State
  const [chatMessages, setChatMessages] = useState<any[]>([
    { sender: 'tutor', text: 'Olá, futuro servidor! Sou seu tutor inteligente de Promissão/SP. Qual dúvida você possui sobre a saúde pública municipal, a colonização de Shuhei Uetsuka, ou as diretrizes do SUS em 2026?' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMsg = { sender: 'user', text: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    const inputToSubmit = chatInput;
    setChatInput('');
    setIsChatLoading(true);

    try {
      const response = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...chatMessages, userMsg],
          selectedRole
        })
      });
      const data = await response.json();
      setChatMessages(prev => [...prev, { sender: 'tutor', text: data.text }]);
    } catch (err) {
      showToast("Não foi possível conectar ao servidor IA. Carregando resposta de segurança.", "error");
      setChatMessages(prev => [...prev, { 
        sender: 'tutor', 
        text: `*(Modo offline)*: O concurso de Promissão foca severamente na bacia hidrográfica do Tietê e na Lei 8.080. Para dúvidas de ${selectedRole}, revise o plano de vacinação e combate a vetores!` 
      }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleForceUpdateApp = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        for (const key of keys) {
          await caches.delete(key);
        }
      }
      showToast("Cache limpo! Recarregando aplicativo em instantes...", "success");
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch (err) {
      showToast("Erro ao limpar cache. Recarregando de forma simples...", "error");
      setTimeout(() => {
        window.location.reload();
      }, 800);
    }
  };

  // Request Tutor AI Question Explanation
  const handleGetAiQuestionExplanation = async () => {
    if (selectedAnswerIdx === null) return;
    setIsExplaining(true);
    setAiExplanation(null);

    try {
      const response = await fetch('/api/explain-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: filteredQuestions[currQuestionIndex],
          selectedOptionIndex: selectedAnswerIdx
        })
      });
      const data = await response.json();
      setAiExplanation(data.text);
    } catch {
      setAiExplanation("*(Gabarito Padrão)*: " + filteredQuestions[currQuestionIndex].explanation);
    } finally {
      setIsExplaining(false);
    }
  };

  // 2. Custom Intelligent Simulation State
  const [selectedTopics, setSelectedTopics] = useState<string[]>(['Combate a Vetores (ACE)', 'Legislação do SUS']);
  const [simDifficulty, setSimDifficulty] = useState<'Fácil' | 'Médio' | 'Difícil'>('Médio');
  const [simQuestionsCount, setSimQuestionsCount] = useState(3);
  const [customMockQuestions, setCustomMockQuestions] = useState<Question[]>([]);
  const [isGeneratingMock, setIsGeneratingMock] = useState(false);
  const [activeSimulationMode, setActiveSimulationMode] = useState<boolean>(false);
  const [simAnswers, setSimAnswers] = useState<{ [key: string]: number }>({});
  const [simCompleted, setSimCompleted] = useState(false);
  const [timerLeft, setTimerLeft] = useState(600); // 10 minutes

  // Handle topic toggling
  const toggleTopic = (topic: string) => {
    setSelectedTopics(prev => prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]);
  };

  // Call /api/generate-mock
  const handleGenerateCustomSimulation = async () => {
    setIsGeneratingMock(true);
    setActiveSimulationMode(false);
    setSimCompleted(false);
    setSimAnswers({});
    
    try {
      const response = await fetch('/api/generate-mock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topics: selectedTopics,
          difficulty: simDifficulty,
          numQuestions: simQuestionsCount
        })
      });
      const data = await response.json();
      if (data.questions && data.questions.length > 0) {
        setCustomMockQuestions(data.questions);
        setActiveSimulationMode(true);
        setTimerLeft(simQuestionsCount * 120); // 2 minutes per question
        showToast(`Simulado IA de ${data.questions.length} questões carregado com sucesso!`, 'success');
      } else {
        throw new Error();
      }
    } catch {
      showToast("Não foi possível gerar via IA. Carregando simulado padrão local.", "info");
      setCustomMockQuestions(questions.slice(0, Math.min(questions.length, simQuestionsCount)));
      setActiveSimulationMode(true);
      setTimerLeft(simQuestionsCount * 120);
    } finally {
      setIsGeneratingMock(false);
    }
  };

  // Timer logic
  useEffect(() => {
    if (!activeSimulationMode || simCompleted) return;
    if (timerLeft <= 0) {
      handleFinishSimulation();
      return;
    }
    const interval = setInterval(() => {
      setTimerLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [activeSimulationMode, simCompleted, timerLeft]);

  const handleFinishSimulation = () => {
    setSimCompleted(true);
    // Count hits
    let correctCount = 0;
    customMockQuestions.forEach((q, idx) => {
      if (simAnswers[idx] === q.correctIndex) {
        correctCount++;
      }
    });

    const percentGained = Math.round((correctCount / customMockQuestions.length) * 100);
    const xpBonus = correctCount * 50;

    setStats(prev => ({
      ...prev,
      xp: prev.xp + xpBonus,
      questionsAnswered: prev.questionsAnswered + customMockQuestions.length,
      questionsCorrect: prev.questionsCorrect + correctCount
    }));

    showToast(`Simulado finalizado! Nota: ${percentGained}%. Você ganhou ${xpBonus} XP de bônus acadêmico!`, 'success');
  };

  // 3. Spaced Repetition Flashcards State
  const [flashcards, setFlashcards] = useState<Flashcard[]>(() => {
    try {
      const saved = localStorage.getItem('pm_flashcards');
      return saved ? JSON.parse(saved) : initialFlashcards;
    } catch {
      return initialFlashcards;
    }
  });

  const [currCardIdx, setCurrCardIdx] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  useEffect(() => {
    localStorage.setItem('pm_flashcards', JSON.stringify(flashcards));
  }, [flashcards]);

  const handleGradeCard = (ease: 'hard' | 'good' | 'easy') => {
    const card = flashcards[currCardIdx];
    let newInterval = card.intervalDays;
    let newEaseFactor = card.easeFactor;

    if (ease === 'hard') {
      newInterval = 1;
      newEaseFactor = Math.max(1.3, card.easeFactor - 0.2);
    } else if (ease === 'good') {
      newInterval = Math.round(card.intervalDays * card.easeFactor);
      newEaseFactor = card.easeFactor;
    } else {
      newInterval = Math.round(card.intervalDays * card.easeFactor * 1.3);
      newEaseFactor = card.easeFactor + 0.15;
    }

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + newInterval);

    setFlashcards(prev => prev.map((c, idx) => {
      if (idx === currCardIdx) {
        return {
          ...c,
          intervalDays: newInterval,
          easeFactor: newEaseFactor,
          nextReviewDate: nextDate.toISOString()
        };
      }
      return c;
    }));

    setIsCardFlipped(false);
    setCurrCardIdx((prev) => (prev + 1) % flashcards.length);
    showToast(`Intervalo de repetição memorizado: ${newInterval} dias de folga estratégica!`, 'info');
  };

  // 4. Discursive Health inspector Assessment Simulation
  const [discursiveQuestion, setDiscursiveQuestion] = useState("Descreva em até 15 linhas como um ACE deve proceder ao identificar depósitos com larvas em um quintal habitável contendo materiais recicláveis, e cite os itens de segurança (EPI) necessários para o preparo do inseticida residual.");
  const [candidateResponse, setCandidateResponse] = useState("");
  const [isAssessingDiscursive, setIsAssessingDiscursive] = useState(false);
  const [discursiveRating, setDiscursiveRating] = useState<any | null>(null);

  const handleCorrectDiscursive = async () => {
    if (!candidateResponse.trim()) {
      showToast("Por favor digite sua redação técnica antes de submeter para nota.", "error");
      return;
    }
    setIsAssessingDiscursive(true);
    setDiscursiveRating(null);

    try {
      const response = await fetch('/api/correct-discursive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionText: discursiveQuestion,
          candidateSolution: candidateResponse
        })
      });
      const data = await response.json();
      setDiscursiveRating(data);
      showToast(`Redação Corrigida! Nota Geral: ${data.score}/100`, 'success');
    } catch {
      setDiscursiveRating({
        score: 80,
        coerencia: 85,
        conteudo: 80,
        linguagem: 75,
        feedback: "### Correção offline de segurança\n\n- Sua resposta cobre de forma direta os protocolos de abordagem amigável sanitária.\n- Você listou corretamente o descarte e manejo mecânico ambiental.\n- **Dica de Bônus**: Detalhe os EPIs básicos como máscara respiratória química contra gases, óculos panorâmicos protetores e luvas de nitrila reforçadas."
      });
    } finally {
      setIsAssessingDiscursive(false);
    }
  };

  // 6. Pomodoro Study Clock State
  const [pomodoroTimeLeft, setPomodoroTimeLeft] = useState(1500); // 25 Min
  const [pomodoroRunning, setPomodoroRunning] = useState(false);
  const [pomodoroMode, setPomodoroMode] = useState<'work' | 'break'>('work');

  // Pomodoro effect
  useEffect(() => {
    let interval: any = null;
    if (pomodoroRunning) {
      interval = setInterval(() => {
        setPomodoroTimeLeft(prev => {
          if (prev <= 1) {
            playAudioEffect('unlock');
            vibrateDevice([100, 50, 100]);
            const nextMode = pomodoroMode === 'work' ? 'break' : 'work';
            const nextTime = nextMode === 'work' ? 1500 : 300;
            setPomodoroMode(nextMode);
            setPomodoroRunning(false);
            showToast(nextMode === 'work' ? "Fim do intervalo! Hora de focar." : "Foco concluído! Aproveite 5 minutinhos de descanso.", "success");
            
            if (nextMode === 'break') {
              setStats(s => ({ ...s, xp: s.xp + 150, studiedHours: s.studiedHours + 1 }));
            }
            return nextTime;
          }
          if (prev % 10 === 0) {
            playAudioEffect('ticking');
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [pomodoroRunning, pomodoroMode]);

  // 7. Combat Arena Minigame State
  const [enemyHp, setEnemyHp] = useState(100);
  const [playerHp, setPlayerHp] = useState(100);
  const [combatLevel, setCombatLevel] = useState(1);
  const [enemyName, setEnemyName] = useState("Vetor Aedes Mutante");
  const [enemyEmoji, setEnemyEmoji] = useState("🦟");
  const [combatQuestion, setCombatQuestion] = useState<Question | null>(null);
  const [combatSelectedAnswerIdx, setCombatSelectedAnswerIdx] = useState<number | null>(null);
  const [combatAnswered, setCombatAnswered] = useState(false);
  const [isEnemyDamaged, setIsEnemyDamaged] = useState(false);
  const [isPlayerDamaged, setIsPlayerDamaged] = useState(false);
  const [damageFeedback, setDamageFeedback] = useState("");
  const [combatHistory, setCombatHistory] = useState<string[]>(["Arena de Combate instalada! Vença os criadouros para ganhar XP massivo."]);

  // Load a random combat question focus target
  const handleLoadCombatQuestion = () => {
    const list = questions.length > 0 ? questions : initialQuestions;
    const randomQ = list[Math.floor(Math.random() * list.length)];
    setCombatQuestion(randomQ);
    setCombatSelectedAnswerIdx(null);
    setCombatAnswered(false);
    setIsEnemyDamaged(false);
    setIsPlayerDamaged(false);
    setDamageFeedback("");
  };

  // Start a new Battle from scratch
  const handleStartNewBattle = () => {
    const monsters = [
      { name: "Super Criadouro Caixa D'Água Aberta", emoji: "🛢️", hpMultiplier: 1.0 },
      { name: "Aedes Mutante do Rio Tietê", emoji: "🦟", hpMultiplier: 1.25 },
      { name: "Ácaro Gigante da Vigilância", emoji: "🦠", hpMultiplier: 1.15 },
      { name: "Invasão Silvestre de Leishmaniose", emoji: "🐕", hpMultiplier: 1.35 },
    ];
    const pickedMonster = monsters[Math.floor(Math.random() * monsters.length)];
    setEnemyName(pickedMonster.name);
    setEnemyEmoji(pickedMonster.emoji);
    setEnemyHp(Math.round(100 * pickedMonster.hpMultiplier));
    setPlayerHp(100);
    setCombatHistory([`Uma nova ameaça surge em Promissão/SP: o violento "${pickedMonster.name}" com ${Math.round(100 * pickedMonster.hpMultiplier)} HP. Prepare-se!`]);
    // Set first question
    const list = questions.length > 0 ? questions : initialQuestions;
    setCombatQuestion(list[Math.floor(Math.random() * list.length)]);
    setCombatSelectedAnswerIdx(null);
    setCombatAnswered(false);
    setIsEnemyDamaged(false);
    setIsPlayerDamaged(false);
    setDamageFeedback("");
    playAudioEffect('unlock');
    vibrateDevice(50);
  };

  // Handle answering a battle question
  const handleAnswerCombatQuestion = (optIdx: number) => {
    if (combatAnswered || !combatQuestion) return;
    setCombatSelectedAnswerIdx(optIdx);
    setCombatAnswered(true);

    const isCorrect = optIdx === combatQuestion.correctIndex;
    if (isCorrect) {
      playAudioEffect('laser');
      vibrateDevice(40);
      setIsEnemyDamaged(true);
      const dmg = Math.round(25 + Math.random() * 15);
      const nextEnemyHp = Math.max(0, enemyHp - dmg);
      setEnemyHp(nextEnemyHp);
      setDamageFeedback(`⚡ HIT! Você atingiu o criadouro causando -${dmg} de Dano com Spray Focal!`);
      setCombatHistory(prev => [
        `Candidato acertou! Disparou ataque químico técnico. -${dmg} HP no inimigo.`,
        ...prev
      ]);

      if (nextEnemyHp <= 0) {
        setTimeout(() => {
          playAudioEffect('unlock');
          vibrateDevice([150, 100, 150]);
          setCombatLevel(cl => cl + 1);
          setStats(s => ({
            ...s,
            xp: s.xp + 300,
            studiedHours: s.studiedHours + 2,
            questionsAnswered: s.questionsAnswered + 1,
            questionsCorrect: s.questionsCorrect + 1
          }));
          setCombatHistory(prev => [
            `🏆 VITÓRIA! Você aniquilou o "${enemyName}" e resgatou Promissão da infestação! +300 XP acadêmicos!`,
            ...prev
          ]);
          showToast(`VITÓRIA! +300 XP. Criadouro Sanitário Purificado!`, 'success');
        }, 1200);
      }
    } else {
      playAudioEffect('wrong');
      vibrateDevice([100, 50, 100]);
      setIsPlayerDamaged(true);
      const enemyDmg = Math.round(20 + Math.random() * 10);
      const nextPlayerHp = Math.max(0, playerHp - enemyDmg);
      setPlayerHp(nextPlayerHp);
      setDamageFeedback(`🚨 DANO! O criadouro revidou gerando -${enemyDmg} de Dano ao seu Escudo de Estabilidade!`);
      setCombatHistory(prev => [
        `Erro de conceito! O vetor se proliferou em áreas urbanas de Promissão e atacou seu escudo: -${enemyDmg} HP.`,
        `Resposta correta era letra: ${String.fromCharCode(65 + combatQuestion.correctIndex)}) ${combatQuestion.options[combatQuestion.correctIndex]}`,
        ...prev
      ]);

      if (nextPlayerHp <= 0) {
        setTimeout(() => {
          setCombatHistory(prev => [
            `💔 DERROTA! Seu escudo esgotou. Revise flashcards ou estude leis locais para reenergizar!`,
            ...prev
          ]);
          showToast(`Simulador Desativado. Seu escudo sanitário zerou!`, 'error');
        }, 1200);
      }
    }
  };

  // 5. Intelligent Study Schedule Generator State
  const [schedule, setSchedule] = useState<StudyScheduleItem[]>(defaultSchedule);
  const [availableDailyHours, setAvailableDailyHours] = useState(3);
  const [primaryWeaknesses, setPrimaryWeaknesses] = useState<string[]>(['Direito Municipal', 'Vigilância Sanitária']);
  const [isGeneratingSchedule, setIsGeneratingSchedule] = useState(false);

  const handleGenerateAISchedule = async () => {
    setIsGeneratingSchedule(true);
    try {
      const response = await fetch('/api/generate-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          availableHours: availableDailyHours,
          difficultiesList: primaryWeaknesses
        })
      });
      const data = await response.json();
      if (data.schedule && data.schedule.length > 0) {
        setSchedule(data.schedule);
        showToast("Seu cronograma inteligente foi reajustado pela IA com base em suas prioridades!", "success");
      }
    } catch {
      showToast("Erro de conexão. Seu cronograma padrão foi mantido.", "error");
    } finally {
      setIsGeneratingSchedule(false);
    }
  };

  // Switch complete status of schedule day
  const toggleScheduleCompleted = (id: string) => {
    setSchedule(prev => prev.map(s => s.id === id ? { ...s, completed: !s.completed } : s));
  };


  // 6. Community Forum state
  const [forumPosts, setForumPosts] = useState<ForumPost[]>(initialForumPosts);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [forumCategory, setForumCategory] = useState('Geral');

  const handleCreateForumPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostContent.trim()) return;

    const newPost: ForumPost = {
      id: `p_${Date.now()}`,
      authorName: 'Você (Candidato)',
      authorRole: 'Candidato',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      title: newPostTitle,
      content: newPostContent,
      likes: 1,
      commentsCount: 0,
      category: forumCategory,
      timestamp: 'Agora mesmo'
    };

    setForumPosts([newPost, ...forumPosts]);
    setNewPostTitle('');
    setNewPostContent('');
    showToast("Tópico compartilhado no mural de estudos municipal!", "success");
  };

  const handleLikePost = (id: string) => {
    setForumPosts(prev => prev.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p));
  };


  // 7. Admin Simulation State (adding custom client question)
  const [adminQuestionText, setAdminQuestionText] = useState('');
  const [adminOptA, setAdminOptA] = useState('');
  const [adminOptB, setAdminOptB] = useState('');
  const [adminOptC, setAdminOptC] = useState('');
  const [adminOptD, setAdminOptD] = useState('');
  const [adminCorrectIndex, setAdminCorrectIndex] = useState(0);
  const [adminExplanation, setAdminExplanation] = useState('');
  const [adminCategory, setAdminCategory] = useState('História e Geografia de Promissão');

  const handleAdminAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminQuestionText || !adminOptA || !adminOptB || !adminOptC || !adminOptD) {
      showToast("Preencha todos os campos obrigatórios da questão.", "error");
      return;
    }

    const newQ: Question = {
      id: `q_admin_${Date.now()}`,
      text: adminQuestionText,
      options: [adminOptA, adminOptB, adminOptC, adminOptD],
      correctIndex: adminCorrectIndex,
      explanation: adminExplanation || "Parâmetro inserido manualmente pelo administrador do módulo.",
      category: adminCategory,
      difficulty: 'Médio',
      source: 'Módulo de Gestão Administrativa'
    };

    setQuestions([newQ, ...questions]);
    showToast("Questão injetada com sucesso no banco principal de dados!", "success");

    // Reset controls
    setAdminQuestionText('');
    setAdminOptA('');
    setAdminOptB('');
    setAdminOptC('');
    setAdminOptD('');
    setAdminExplanation('');
  };


  // Quick stats calculations
  const totalQuestions = questions.length;
  const questionsCompleted = questions.filter(q => q.userAnswer !== undefined).length;
  const correctnessPercent = questionsCompleted > 0 
    ? Math.round((questions.filter(q => q.userAnswer !== undefined && q.userAnswer === q.correctIndex).length / questionsCompleted) * 100)
    : 0;

  return (
    <div id="app-root" className="min-h-screen bg-[#F4F7FA] font-sans text-slate-800 flex flex-col md:flex-row pb-20 md:pb-0">
      
      {/* Toast Notification */}
      {notification && (
        <div id="toast-notif" className={`fixed bottom-24 right-6 md:bottom-6 z-50 transform translate-y-0 transition-all duration-300 max-w-sm p-4 rounded-xl shadow-2xl flex items-center space-x-3 border-l-4 ${
          notification.type === 'success' ? 'bg-[#002B5B] text-white border-green-400' :
          notification.type === 'error' ? 'bg-red-950 text-red-100 border-red-500' :
          'bg-slate-900 text-slate-100 border-[#C5A059]'
        }`}>
          <span>{notification.type === 'success' ? '🏆' : notification.type === 'error' ? '⚠️' : '💡'}</span>
          <p className="text-xs font-medium leading-relaxed">{notification.message}</p>
          <button onClick={() => setNotification(null)} className="text-white/60 hover:text-white text-xs font-bold pl-2">✖</button>
        </div>
      )}

      {/* Mobile Sidebar BackDrop */}
      {isSidebarOpen && (
        <div className="md:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-30 transition-all" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar Navigation conforming to "Geometric Balance" */}
      <aside className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} fixed md:relative top-0 bottom-0 left-0 w-72 md:w-64 bg-[#002B5B] flex flex-col border-r border-slate-200 transition-transform duration-300 overflow-hidden shrink-0 z-40 h-full`}>
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#C5A059] rounded-lg flex items-center justify-center font-bold text-white shadow-lg">PA</div>
            <h1 className="text-white font-bold leading-tight text-sm">PROMISSAO<br/>
              <span className="text-[#C5A059] text-[10px] tracking-widest uppercase">Aprovação</span>
            </h1>
          </div>
          <button className="md:hidden text-white w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors" onClick={() => setIsSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Dynamic Role Switcher */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/40">
          <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1 font-mono font-bold">CARGO ALVO</label>
          <select 
            className="w-full bg-slate-800 text-white text-xs rounded px-2 py-1.5 border border-slate-755 focus:outline-none focus:border-[#C5A059]"
            value={selectedRole}
            onChange={(e: any) => {
              setSelectedRole(e.target.value);
              showToast(`Cargo alterado. Carregando recursos customizados para ${e.target.value}!`, 'info');
            }}
          >
            <option value="Agente de Combate às Endemias">ACS / Combate às Endemias (ACE)</option>
            <option value="Agente Comunitário de Saúde">Agente Comunitário de Saúde (ACS)</option>
            <option value="Vigilante Sanitário">Vigilante Sanitário Municipal</option>
          </select>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
          <button 
            onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }} 
            className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all ${
              activeTab === 'dashboard' ? 'bg-white/10 text-white border border-white/10 font-bold' : 'text-white/70 hover:bg-white/5'
            }`}
          >
            <span className="text-lg">📊</span>
            <span className="text-xs font-medium">Dashboard</span>
          </button>

          <button 
            onClick={() => { setActiveTab('tutor'); setIsSidebarOpen(false); }} 
            className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all ${
              activeTab === 'tutor' ? 'bg-white/10 text-white border border-white/10 font-bold' : 'text-white/70 hover:bg-white/5'
            }`}
          >
            <span className="text-lg">🤖</span>
            <span className="text-xs font-medium">Tutor IA & Redação</span>
          </button>

          <button 
            onClick={() => { 
              setActiveTab('arena'); 
              setIsSidebarOpen(false); 
              if (playerHp <= 0 || !combatQuestion) { 
                handleStartNewBattle(); 
              } 
            }} 
            className={`w-full text-left p-3 rounded-xl flex items-center justify-between transition-all ${
              activeTab === 'arena' ? 'bg-[#C5A059] text-white font-bold' : 'text-[#C5A059] hover:bg-white/5 border border-[#C5A059]/30 bg-[#C5A059]/5 animate-bounce-slow'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">🎮</span>
              <span className="text-xs font-medium">Arena de Combate</span>
            </div>
            <span className="bg-red-600 text-[8px] text-white px-1.5 py-0.5 rounded-full font-bold uppercase animate-pulse">RPG</span>
          </button>

          <button 
            onClick={() => { setActiveTab('questions'); setIsSidebarOpen(false); }} 
            className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all ${
              activeTab === 'questions' ? 'bg-white/10 text-white border border-white/10 font-bold' : 'text-white/70 hover:bg-white/5'
            }`}
          >
            <span className="text-lg">📝</span>
            <span className="text-xs font-medium">Banco de Questões</span>
          </button>

          <button 
            onClick={() => { setActiveTab('simulados'); setIsSidebarOpen(false); }} 
            className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all ${
              activeTab === 'simulados' ? 'bg-white/10 text-white border border-white/10 font-bold' : 'text-white/70 hover:bg-white/5'
            }`}
          >
            <span className="text-lg">📑</span>
            <span className="text-xs font-medium">Simuladores VUNESP</span>
          </button>

          <button 
            onClick={() => { setActiveTab('flashcards'); setIsSidebarOpen(false); }} 
            className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all ${
              activeTab === 'flashcards' ? 'bg-white/10 text-white border border-white/10 font-bold' : 'text-white/70 hover:bg-white/5'
            }`}
          >
            <span className="text-lg">⚡</span>
            <span className="text-xs font-medium">Repetição Espaçada</span>
          </button>

          <button 
            onClick={() => { setActiveTab('promissao'); setIsSidebarOpen(false); }} 
            className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all ${
              activeTab === 'promissao' ? 'bg-white/10 text-white border border-white/10 font-bold' : 'text-white/70 hover:bg-white/5'
            }`}
          >
            <span className="text-lg">📍</span>
            <span className="text-xs font-medium">Área Promissão/SP</span>
          </button>

          <button 
            onClick={() => { setActiveTab('materials'); setIsSidebarOpen(false); }} 
            className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all ${
              activeTab === 'materials' ? 'bg-white/10 text-white border border-white/10 font-bold' : 'text-white/70 hover:bg-white/5'
            }`}
          >
            <span className="text-lg">📚</span>
            <span className="text-xs font-medium">Aulas & PDFs</span>
          </button>

          <button 
            onClick={() => { setActiveTab('comunidade'); setIsSidebarOpen(false); }} 
            className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all ${
              activeTab === 'comunidade' ? 'bg-white/10 text-white border border-white/10 font-bold' : 'text-white/70 hover:bg-white/5'
            }`}
          >
            <span className="text-lg">💬</span>
            <span className="text-xs font-medium">Mural da Comunidade</span>
          </button>

          <button 
            onClick={() => { setActiveTab('admin'); setIsSidebarOpen(false); }} 
            className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all ${
              activeTab === 'admin' ? 'bg-white/10 text-[#C5A059] border border-white/10 font-bold' : 'text-white/40 hover:bg-white/5'
            }`}
          >
            <span className="text-lg">⚙️</span>
            <span className="text-xs font-medium">Configurar Banco</span>
          </button>
        </nav>

        {/* Access Plan Details */}
        <div className="p-6">
          <div className="bg-[#C5A059]/10 border border-[#C5A059]/30 rounded-2xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[#C5A059] text-[9px] font-bold uppercase tracking-wider">PREFEITURA</span>
              <div className="w-2 h-2 rounded-full bg-green-400 animate-ping"></div>
            </div>
            <p className="text-white text-xs font-bold font-serif">Acesso Assinatura</p>
            <p className="text-[10px] text-slate-300 mt-1">Status: Servidor Ativo 2026</p>
          </div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col overflow-x-hidden">
        
        {/* Header conforming to Design HTML */}
        <header className="h-16 md:h-20 bg-white/90 backdrop-blur-md sticky top-0 border-b border-slate-200 px-4 md:px-6 flex items-center justify-between z-30">
          <div className="flex items-center gap-2 md:gap-4">
            <button className="md:hidden text-[#002B5B] w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-1.5 md:gap-2">
              <span className="text-[10px] md:text-xs text-slate-500 font-medium hidden xs:inline">Cargo Alvo:</span>
              <span 
                onClick={() => setIsMoreDrawerOpen(true)}
                className="bg-[#002B5B]/5 hover:bg-[#002B5B]/10 active:scale-95 transition-all px-2.5 py-1 rounded-full text-[9px] md:text-[11px] font-bold text-[#002B5B] border border-[#002B5B]/10 uppercase tracking-tight cursor-pointer"
              >
                {selectedRole.length > 20 ? selectedRole.substring(0, 18) + '...' : selectedRole} ▾
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium font-serif">Prova Edital:</span>
              <span className="text-[#002B5B] text-xs font-bold bg-[#C5A059]/10 text-[#002B5B] px-2 py-0.5 rounded">42 DIAS RESTANTES</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
              <span className="text-base select-none">🔥</span>
              <span className="font-bold text-amber-600 text-xs">{stats.dailyStreak} DIAS SEGUIDOS</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden xs:block">
                <p className="text-[10px] font-bold text-slate-400">Nível {stats.level}</p>
                <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                  <div className="bg-[#C5A059] h-full" style={{ width: `${(stats.xp % 100)}%` }}></div>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#002B5B] to-[#C5A059] text-white flex items-center justify-center font-bold text-xs ring-2 ring-white shadow">
                PR
              </div>
            </div>
          </div>
        </header>

        {/* Content Tabs Switcher */}
        <div className="flex-1 p-4 md:p-8">

          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              
              {/* Top Banner Alert conforming to Geometric Balance */}
              <section className="bg-[#002B5B] text-white rounded-3xl p-6 relative overflow-hidden shadow-xl border border-slate-700">
                <div className="absolute top-0 right-0 p-8 opacity-10 select-none">
                  <span className="text-9xl">🤖</span>
                </div>
                <div className="relative z-10 max-w-2xl">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2.5 py-0.5 bg-[#C5A059] text-white text-[10px] font-bold rounded uppercase tracking-widest flex items-center gap-1">
                      <Sparkles size={10} /> IA - Treinador Pessoal
                    </span>
                    <span className="text-xs text-slate-300">Atualizado agora mesmo baseado nos seus erros</span>
                  </div>
                  <h2 className="text-2xl font-serif italic text-white mb-2 underline decoration-[#C5A059] decoration-2">
                    "Fortalecer Vigilância Ambiental (História e Geografia)"
                  </h2>
                  <p className="text-white/80 text-xs leading-relaxed mb-4">
                    Sua taxa de acertos em <strong className="text-[#C5A059]">História e Geografia de Promissão</strong> está em {correctnessPercent}% (Abaixo dos 85% recomendados para aprovação). O robô mapeou 3 novas questões sobre a colonização do Dr. Shuhei Uetsuka e herança de Lins no seu simulador.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button 
                      onClick={() => { setActiveTab('questions'); setFilters({ category: 'História e Geografia de Promissão', difficulty: 'Todos' }); }}
                      className="bg-white text-[#002B5B] px-5 py-2 rounded-full font-bold text-xs uppercase tracking-wider hover:bg-[#C5A059] hover:text-white transition-colors cursor-pointer"
                    >
                      Corrigir Fraqueza Agora
                    </button>
                    <button 
                      onClick={() => setActiveTab('tutor')}
                      className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-5 py-2 rounded-full font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Conversar com Treinador IA
                    </button>
                  </div>
                </div>
              </section>

              {/* Pomodoro Focus Clock Widget */}
              <section className="bg-white rounded-3xl p-5 border border-[#C5A059]/30 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center text-xl animate-pulse">
                    ⏱️
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 flex-wrap">
                      Pomodoro Concurseiro de Alta Performance 
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${pomodoroMode === 'work' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {pomodoroMode === 'work' ? '🛠️ Foco Ativo (25 min)' : '🍃 Descanso (5 min)'}
                      </span>
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Ative o relógio de foco profundo para estudos técnicos. Ao finalizar, receba um bônus de <strong>+150 XP</strong> de dedicação de cargo!
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="font-mono text-2xl font-black text-[#002B5B]">
                    {Math.floor(pomodoroTimeLeft / 60).toString().padStart(2, '0')}:{(pomodoroTimeLeft % 60).toString().padStart(2, '0')}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setPomodoroRunning(!pomodoroRunning);
                        playAudioEffect('click');
                      }}
                      className={`text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer active:scale-95 ${
                        pomodoroRunning ? 'bg-amber-600 text-white' : 'bg-[#002B5B] text-white hover:bg-[#C5A059]'
                      }`}
                    >
                      {pomodoroRunning ? 'Pausar ⏸️' : 'Iniciar Foco ▶️'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPomodoroRunning(false);
                        setPomodoroTimeLeft(pomodoroMode === 'work' ? 1500 : 300);
                        playAudioEffect('click');
                        showToast("Cronômetro resetado devidamente!");
                      }}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-650 text-xs font-bold px-3 py-2 rounded-xl cursor-pointer active:scale-95"
                    >
                      Resetar
                    </button>
                  </div>
                </div>
              </section>

              {/* Grid Widgets dashboard */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Estimador de Aprovação */}
                <section className="lg:col-span-4 bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
                  <h3 className="text-slate-400 uppercase text-[10px] font-bold tracking-widest mb-4">Chance Geral de Aprovação</h3>
                  
                  <div className="relative flex items-center justify-center">
                    {/* SVG Gauge Circle */}
                    <svg className="w-40 h-40 transform -rotate-90">
                      <circle cx="80" cy="80" r="70" stroke="#f1f5f9" strokeWidth="10" fill="transparent" />
                      <circle 
                        cx="80" 
                        cy="80" 
                        r="70" 
                        stroke="#002B5B" 
                        strokeWidth="10" 
                        fill="transparent" 
                        strokeDasharray="439.8" 
                        strokeDashoffset={439.8 - (439.8 * stats.estimatedApproval) / 100}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <div className="absolute text-center">
                      <span className="text-4xl font-extrabold text-[#002B5B]">{stats.estimatedApproval}%</span>
                      <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-tighter mt-1">Nota Esperada VUNESP</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 mt-4 leading-relaxed px-2">
                    Excelente! Seus acertos acumulados indicam uma nota simulada de corte de <strong>8.4 de 10.0</strong> para as vagas de {selectedRole} de Promissão.
                  </p>

                  <div className="mt-6 grid grid-cols-3 w-full border-t border-slate-100 pt-4 gap-2">
                    <div className="text-center">
                      <p className="text-lg font-bold text-slate-800">{stats.questionsAnswered}</p>
                      <p className="text-[9px] text-slate-400 uppercase">Feitas</p>
                    </div>
                    <div className="text-center border-x border-slate-100">
                      <p className="text-lg font-bold text-slate-850">{stats.questionsCorrect}</p>
                      <p className="text-[9px] text-slate-400 uppercase">Gabaritadas</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-[#C5A059]">{stats.studiedHours}h</p>
                      <p className="text-[9px] text-slate-400 uppercase">Estudadas</p>
                    </div>
                  </div>
                </section>

                {/* Pontos de Matérias & Força */}
                <section className="lg:col-span-8 bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-slate-400 uppercase text-[10px] font-bold tracking-widest">Evolução de Conhecimento Ativo</h3>
                      <span className="text-xs text-[#002B5B] font-mono bg-[#C5A059]/10 px-2.5 py-0.5 rounded font-bold uppercase">Edital Prefeitura de Promissão</span>
                    </div>

                    <div className="space-y-4">
                      {/* Item 1 */}
                      <div>
                        <div className="flex justify-between text-xs font-bold mb-1">
                          <span className="flex items-center gap-1 text-slate-700">🌱 Combate a Vetores (ACE) <span className="text-[10px] text-emerald-600 font-normal">(Forte)</span></span>
                          <span className="text-[#002B5B] font-mono font-bold">94%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: '94%' }} />
                        </div>
                      </div>

                      {/* Item 2 */}
                      <div>
                        <div className="flex justify-between text-xs font-bold mb-1">
                          <span className="flex items-center gap-1 text-slate-700">⚖️ Legislação do SUS (Lei 8080/90) <span className="text-[10px] text-indigo-600 font-normal">(Médio)</span></span>
                          <span className="text-[#002B5B] font-mono font-bold">78%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-[#C5A059] rounded-full" style={{ width: '78%' }} />
                        </div>
                      </div>

                      {/* Item 3 */}
                      <div>
                        <div className="flex justify-between text-xs font-bold mb-1">
                          <span className="flex items-center gap-1 text-slate-700">🏙️ História e Geografia de Promissão <span className="text-[10px] text-amber-600 font-normal">(Abaixo do Esperado)</span></span>
                          <span className="text-amber-600 font-mono font-bold">45%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full" style={{ width: '45%' }} />
                        </div>
                      </div>

                      {/* Item 4 */}
                      <div>
                        <div className="flex justify-between text-xs font-bold mb-1">
                          <span className="flex items-center gap-1 text-slate-700">📋 Lei Orgânica Municipal de Promissão <span className="text-[10px] text-red-600 font-normal">(Ponto de Alerta)</span></span>
                          <span className="text-red-500 font-mono font-bold">36%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-red-505 bg-red-400 rounded-full" style={{ width: '36%' }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 border-t border-slate-100 pt-4 flex flex-col sm:flex-row justify-between items-center bg-[#F4F7FA] p-3 rounded-xl gap-2">
                    <span className="text-xs text-slate-500 font-medium">Reorganizar metas de estudos com base nestas estatísticas?</span>
                    <button 
                      onClick={handleGenerateAISchedule}
                      disabled={isGeneratingSchedule}
                      className="bg-[#002B5B] hover:bg-[#C5A059] text-white text-[11px] font-bold px-4 py-1.5 rounded-lg shadow-sm font-mono flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw size={12} className={isGeneratingSchedule ? 'animate-spin' : ''} /> Ajustar Cronograma Ativo
                    </button>
                  </div>
                </section>
              </div>

              {/* Seção Meta Diária, Simulado e Ranking */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Meta Diária */}
                <div className="bg-white border-2 border-[#C5A059] rounded-3xl p-5 flex items-center gap-4 relative">
                  <div className="w-12 h-12 bg-[#C5A059]/10 rounded-2xl flex items-center justify-center text-xl shadow-inner text-[#C5A059] font-bold">🏆</div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Meta de Hoje</p>
                    <p className="font-bold text-slate-750 text-sm">Gabaritar 5 questões de SUS</p>
                    <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Status: Em Progresso (+80 XP)</p>
                  </div>
                  <button onClick={() => setActiveTab('questions')} className="absolute right-4 top-1/2 -translate-y-1/2 bg-[#002B5B] hover:bg-[#C5A059] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow">➔</button>
                </div>

                {/* Cronograma de Revisão Inteligente */}
                <div className="bg-white border border-slate-100 rounded-3xl p-5 flex items-center gap-4 relative">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-xl shadow-inner text-indigo-500">⚡</div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Próxima Revisão</p>
                    <p className="font-bold text-slate-750 text-sm">Curva das 24 Horas Ativa</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Foco: {flashcards[currCardIdx]?.category || 'Dengue'}</p>
                  </div>
                  <button onClick={() => setActiveTab('flashcards')} className="absolute right-4 top-1/2 -translate-y-1/2 bg-[#002B5B] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow">➔</button>
                </div>

                {/* Ranking Municipal */}
                <div className="bg-white border border-slate-100 rounded-3xl p-5 flex items-center gap-4 relative">
                  <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-xl shadow-inner text-amber-500">🥇</div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Ranking Promissão</p>
                    <p className="font-bold text-slate-750 text-sm">12º Lugar Geral de 450</p>
                    <p className="text-[10px] text-[#C5A059] font-bold mt-0.5">Topo 3%! Zona de Aprovação</p>
                  </div>
                  <button onClick={() => showToast("Você está no Top 3% de candidatos da cidade! Continue a sequência diária.", "success")} className="absolute right-4 top-1/2 -translate-y-1/2 bg-[#002B5B] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow">➔</button>
                </div>
              </div>

              {/* Conquistas da Gamificação e Cronograma de Estudos */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Cronograma de estudo dinâmico */}
                <section className="lg:col-span-7 bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-slate-400 uppercase text-[10px] font-bold tracking-widest">Cronograma Inteligente Individual</h3>
                    <span className="text-[10px] bg-[#C5A059]/20 text-[#002B5B] px-2 py-0.5 rounded font-bold font-mono">SEMANA ATIVA 24</span>
                  </div>

                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {schedule.map((item) => (
                      <div 
                        key={item.id} 
                        className={`p-3 rounded-2xl flex items-center justify-between border transition-all ${
                          item.completed 
                            ? 'bg-emerald-50/50 border-emerald-100 text-slate-400' 
                            : 'bg-[#F4F7FA]/70 border-slate-100 hover:border-[#C5A059]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => {
                              toggleScheduleCompleted(item.id);
                              showToast(item.completed ? "Meta marcada como pendente." : `Parabéns! Você concluiu os estudos de ${item.subject}. +15 XP`, "success");
                              if (!item.completed) {
                                setStats(prev => ({ ...prev, xp: prev.xp + 15, studiedHours: prev.studiedHours + 1 }));
                              }
                            }}
                            className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                              item.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 hover:border-[#002B5B]'
                            }`}
                          >
                            {item.completed && '✓'}
                          </button>
                          <div>
                            <p className="text-xs font-bold text-slate-750 flex items-center gap-2">
                              <span className="bg-[#002B5B] text-white font-mono text-[9px] px-1.5 py-0.2 rounded">{item.day}</span>
                              {item.subject}
                            </p>
                            <p className="text-[10px] text-slate-500 font-mono italic">{item.topic}</p>
                          </div>
                        </div>
                        <span className="text-xs font-mono font-bold text-[#C5A059]">{item.timeMinutes}m</span>
                      </div>
                    ))}
                  </div>

                  {/* Settings dynamic hours panel inside Dashboard */}
                  <div className="mt-4 p-4 bg-[#002B5B]/5 rounded-2xl border border-[#002B5B]/10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Horas Disponíveis / Dia</label>
                      <input 
                        type="number" 
                        min="1" 
                        max="12" 
                        className="w-full bg-white text-xs rounded border border-slate-250 p-1.5 focus:outline-none focus:border-[#002B5B]" 
                        value={availableDailyHours} 
                        onChange={(e) => setAvailableDailyHours(parseInt(e.target.value) || 2)}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Mapear Maior Dificuldade</label>
                      <select 
                        className="w-full bg-white text-xs rounded border border-slate-250 p-1.5 focus:outline-none"
                        onChange={(e) => setPrimaryWeaknesses([e.target.value])}
                      >
                        <option value="Biologia do Vetor (ACE)">Biologia do Aedes aegypti</option>
                        <option value="História e Geografia de Promissão">História de Promissão/SP</option>
                        <option value="Lei Orgânica de Promissão">Legislação Orgânica do Município</option>
                        <option value="Lei Federal 8.080/90 do SUS">Estatutos Federais do SUS</option>
                      </select>
                    </div>
                  </div>
                </section>

                {/* Gamificação / Conquistas */}
                <section className="lg:col-span-5 bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
                  <div>
                    <h3 className="text-slate-400 uppercase text-[10px] font-bold tracking-widest mb-4">Suas Conquistas Acadêmicas</h3>
                    
                    <div className="space-y-3">
                      {initialAchievements.map((ach) => {
                        const isUnlocked = ach.unlockedAt !== undefined;
                        return (
                          <div 
                            key={ach.id} 
                            className={`p-3 rounded-2xl flex items-center gap-3 border transition-all ${
                              isUnlocked ? 'bg-[#C5A059]/5 border-[#C5A059]/30' : 'bg-slate-50/50 border-slate-100 opacity-60'
                            }`}
                          >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                              isUnlocked ? 'bg-[#C5A059] text-white shadow-md' : 'bg-slate-200 text-slate-400 animate-pulse'
                            }`}>
                              {ach.icon === 'Zap' && '⚡'}
                              {ach.icon === 'MapPin' && '📍'}
                              {ach.icon === 'Compass' && '🧭'}
                              {ach.icon === 'ShieldAlert' && '🛡️'}
                              {ach.icon === 'Scale' && '⚖️'}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-800">{ach.title}</p>
                              <p className="text-[10px] text-slate-500 leading-tight">{ach.description}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="bg-[#002B5B] text-white font-mono text-[9px] px-1.5 py-0.2 rounded">+{ach.xpValue} XP</span>
                                {isUnlocked && <span className="text-emerald-600 font-bold text-[9px] uppercase tracking-wider">Desbloqueado</span>}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-4 text-center">
                    <button 
                      onClick={() => showToast("Mais desafios de final de semana chegam no sábado!", "info")}
                      className="text-xs font-bold text-[#002B5B] hover:text-[#C5A059] flex items-center justify-center gap-1 mx-auto py-2 cursor-pointer"
                    >
                      Ver Todas as 28 Conquistas da Cidade ➔
                    </button>
                  </div>
                </section>
              </div>

            </div>
          )}


          {/* TAB 2: TUTOR Inteligência Artificial & CORREÇÃO DE REDAÇÃO */}
          {activeTab === 'tutor' && (
            <div className="space-y-6">
              
              {/* Info Header */}
              <div className="p-4 bg-white border border-slate-100 rounded-3xl">
                <h2 className="text-lg font-bold text-[#002B5B] flex items-center gap-2">
                  <span>🤖</span> Tutor IA Integrado & Simulador de Escrita Técnica
                </h2>
                <p className="text-slate-500 text-xs mt-1">
                  Obtenha explicações personalizadas no edital de Promissão/SP, use mnemônicos rápidos, ou digite respostas para auditoria mecânica das diretrizes de fiscalização do ACE de nível sênior.
                </p>
              </div>

              {/* Grid 2 Columns: Chat / written assessment */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* 1. Chatbot Tutor 24 Horas */}
                <section className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[550px]">
                  <div className="p-4 bg-[#002B5B] text-white rounded-t-3xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                      <span className="font-bold text-xs">Mestre de Banca IA - Promissão/SP</span>
                    </div>
                    <span className="text-[10px] uppercase font-mono tracking-widest bg-white/10 px-2 py-0.5 rounded text-[#C5A059] font-bold">2026 Ativo</span>
                  </div>

                  {/* Chat messages roll */}
                  <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    {chatMessages.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs sm:max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                          msg.sender === 'user' 
                            ? 'bg-[#002B5B] text-white rounded-tr-none' 
                            : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200'
                        }`}>
                          <div className="flex items-center justify-between mb-1 gap-4">
                            <span className="font-bold font-mono text-[9px] text-[#C5A059] uppercase tracking-widest">
                              {msg.sender === 'user' ? 'Você (Candidato)' : 'Tutor IA de Aprovação'}
                            </span>
                            {msg.sender !== 'user' && (
                              <button
                                type="button"
                                onClick={() => handleSpeakText(msg.text)}
                                className="text-slate-400 hover:text-[#002B5B] transition-colors flex items-center gap-1 p-0.5 rounded cursor-pointer bg-slate-200/30 px-1.5 active:scale-95"
                                title="Ouvir explicações por voz"
                              >
                                <Volume2 size={11} />
                                <span className="text-[8px] font-bold">Falar / Ouvir</span>
                              </button>
                            )}
                          </div>
                          <div className="whitespace-pre-wrap">{msg.text}</div>
                        </div>
                      </div>
                    ))}
                    {isChatLoading && (
                      <div className="flex justify-start">
                        <div className="bg-slate-100 p-4 border border-indigo-100 rounded-2xl rounded-tl-none animate-pulse flex items-center space-x-2">
                          <span className="text-xs text-[#002B5B] font-mono font-bold">Gerando explicação didática...</span>
                          <div className="w-2 h-2 rounded-full bg-[#C5A059] animate-bounce"></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Quick Suggestion Pills for Mobile Ease */}
                  <div className="px-4 pb-2 pt-1.5 flex gap-2 overflow-x-auto scrollbar-none shrink-0 border-t border-slate-100 bg-slate-50/50">
                    {[
                      { key: "Mnemônico dengue", text: "Mnemônico Dengue 🦟", prompt: "Crie um mnemônico divertido e fácil de memorizar sobre as fases e sintomas da dengue clássica de forma resumida." },
                      { key: "Lei 8080 artigo 7", text: "Lei 8080 - Art 7 ⚖️", prompt: "Quais são os principais princípios do SUS listados no Artigo 7º da Lei 8.080 de forma resumida para concurso?" },
                      { key: "Vetor Aedes", text: "Ciclo do Vetor 🧪", prompt: "Explique de forma detalhada o ciclo reprodutivo do mosquito transmissor Aedes aegypti de forma simples." },
                      { key: "LIP Promissão", text: "Licença Servidor 📍", prompt: "O que a Lei Orgânica de Promissão prevê sobre a licença para tratar de interesses particulares e estabilidade de forma resumida?" }
                    ].map((sug) => (
                      <button
                        key={sug.key}
                        type="button"
                        onClick={() => {
                          setChatInput(sug.prompt);
                          showToast("Sugestão selecionada! Edite ou clique em Enviar.");
                        }}
                        className="bg-white hover:bg-[#002B5B] hover:text-white transition-all text-[11px] font-medium text-[#002B5B] border border-slate-200 px-3 py-1.5 rounded-full whitespace-nowrap cursor-pointer shadow-sm shrink-0 active:scale-95"
                      >
                        {sug.text}
                      </button>
                    ))}
                  </div>

                  {/* Input form */}
                  <form onSubmit={handleSendChatMessage} className="p-3 border-t border-slate-200 flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Diga: 'Crie um mnemônico para vírus da Dengue' ou peça uma lei..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      disabled={isChatLoading}
                      className="flex-1 text-xs rounded-xl border border-slate-300 p-3 focus:outline-none focus:border-[#C5A059] bg-[#F4F7FA]"
                    />
                    <button 
                      type="submit" 
                      disabled={isChatLoading}
                      className="bg-[#002B5B] hover:bg-[#C5A059] text-white px-5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Send size={14} /> Enviar
                    </button>
                  </form>
                </section>

                {/* 2. Discursive Redação Simulator */}
                <section className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="text-[#002B5B] font-bold text-sm mb-2 flex items-center gap-1">
                      <Layers size={16} className="text-[#C5A059]" /> Corretor IA de Questão Discursiva
                    </h3>
                    
                    <div className="bg-amber-50/50 border border-amber-200/50 p-3.5 rounded-2xl mb-4">
                      <p className="text-[10px] uppercase font-bold text-[#C5A059] py-0.5">ENUNCIADO CASO CLÍNICO SANITÁRIO</p>
                      <p className="text-xs text-slate-750 font-serif italic mt-1 leading-relaxed">
                        "{discursiveQuestion}"
                      </p>
                      <button 
                        onClick={() => {
                          setDiscursiveQuestion("Disserte a respeito dos direitos estatutários do servidor de Promissão/SP no tocante à Licença para Tratar de Interesses Particulares (LIP) e os limites de estabilidade de cargo.");
                          setCandidateResponse("");
                          setDiscursiveRating(null);
                          showToast("Novo caso discursivo gerado pela banca!", "info");
                        }}
                        className="text-[9px] font-bold text-slate-500 hover:text-[#002B5B] block mt-2 text-right cursor-pointer"
                      >
                        Mudar tema de Redação ➔
                      </button>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Sua Resposta Escrita de Agente (Máximo 20 linhas):</label>
                      <textarea 
                        rows={8}
                        value={candidateResponse}
                        onChange={(e) => setCandidateResponse(e.target.value)}
                        placeholder="Ex: Primeiramente, o Agente de Combate às Endemias (ACE) deve aproximar-se do munícipe de modo amigável e explicativo. Diante das larvas..."
                        className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-250 rounded-2xl focus:outline-none focus:border-[#002B5B] leading-relaxed resize-none"
                      />
                    </div>
                  </div>

                  {discursiveRating && (
                    <div className="mt-4 p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl space-y-3">
                      <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-emerald-100">
                        <div>
                          <p className="text-[11px] font-bold text-slate-700">RESULTADO DA BANCA IA</p>
                          <span className="text-2xl font-black text-[#002B5B]">{discursiveRating.score}</span> <span className="text-xs text-slate-500">/ 100</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
                          <div className="bg-indigo-50 px-1.5 py-0.5 rounded text-indigo-700">Coerência: <strong>{discursiveRating.coerencia}</strong></div>
                          <div className="bg-amber-50 px-1.5 py-0.5 rounded text-amber-700">Conteúdo: <strong>{discursiveRating.conteudo}</strong></div>
                          <div className="bg-[#002B5B]/15 px-1.5 py-0.5 rounded text-[#002B5B]">Normativa: <strong>{discursiveRating.linguagem}</strong></div>
                        </div>
                      </div>
                      <div className="text-[11px] text-slate-600 prose leading-relaxed prose-sm max-h-40 overflow-y-auto whitespace-pre-line bg-white p-3 rounded-xl border border-slate-100">
                        {discursiveRating.feedback}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 border-t border-slate-100 pt-4">
                    <button 
                      onClick={handleCorrectDiscursive}
                      disabled={isAssessingDiscursive}
                      className="w-full p-3.5 bg-[#C5A059] hover:bg-[#002B5B] text-white font-bold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isAssessingDiscursive ? 'Avaliando critérios gramaticais...' : 'Submeter Resposta para Avaliação IA ➔'}
                    </button>
                    <p className="text-[9px] text-center text-slate-400 mt-2">Dica: No concurso real, erros gramaticais de português decrescem 0.5 ponto por desvio.</p>
                  </div>
                </section>
              </div>

            </div>
          )}


          {/* TAB 3: BANCO DE QUESTÕES INTELECTIVO */}
          {activeTab === 'questions' && (
            <div className="space-y-6">
              
              {/* Filter controls Row */}
              <div className="bg-white p-4 rounded-3xl border border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center shadow-sm">
                <div className="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto">
                  
                  {/* Category Filter */}
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Filtrar por Disciplina</label>
                    <select 
                      className="bg-slate-100 text-xs px-3 py-1.5 rounded-lg border border-slate-205 text-slate-700 focus:outline-none"
                      value={filters.category}
                      onChange={(e) => {
                        setFilters(prev => ({ ...prev, category: e.target.value }));
                        setCurrQuestionIndex(0);
                        setSelectedAnswerIdx(null);
                        setHasSubmittedAnswer(false);
                        setAiExplanation(null);
                      }}
                    >
                      <option value="Todos">Todas as Disciplinas</option>
                      <option value="Combate a Vetores (ACE)">Combate a Vetores e Agentes (ACE)</option>
                      <option value="Legislação do SUS">Legislação Integral do SUS</option>
                      <option value="História e Geografia de Promissão">História de Promissão/SP</option>
                      <option value="Lei Orgânica de Promissão">Leis do Município</option>
                    </select>
                  </div>

                  {/* Difficulty Filter */}
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Dificuldade</label>
                    <select 
                      className="bg-slate-100 text-xs px-3 py-1.5 rounded-lg border border-slate-205 text-slate-700 focus:outline-none"
                      value={filters.difficulty}
                      onChange={(e) => {
                        setFilters(prev => ({ ...prev, difficulty: e.target.value }));
                        setCurrQuestionIndex(0);
                        setSelectedAnswerIdx(null);
                        setHasSubmittedAnswer(false);
                        setAiExplanation(null);
                      }}
                    >
                      <option value="Todos">Qualquer Dificuldade</option>
                      <option value="Fácil">Fácil</option>
                      <option value="Médio">Médio</option>
                      <option value="Difícil">Difícil</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 w-full sm:w-auto items-center justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0">
                  <span className="text-xs text-slate-500 font-mono">Encontradas: <strong className="text-[#002B5B]">{filteredQuestions.length}</strong> questões</span>
                  <button 
                    onClick={() => {
                      setFilters({ category: 'Todos', difficulty: 'Todos' });
                      setCurrQuestionIndex(0);
                      setSelectedAnswerIdx(null);
                      setHasSubmittedAnswer(false);
                      setAiExplanation(null);
                      showToast("Filtros reajustados!");
                    }}
                    className="text-xs text-indigo-600 hover:text-[#002B5B] font-bold cursor-pointer underline"
                  >
                    Limpar Filtros
                  </button>
                </div>
              </div>

              {/* Quiz Main Stage */}
              {filteredQuestions.length > 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 md:p-8 space-y-6">
                  
                  {/* Item Header */}
                  <div className="flex justify-between items-start gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="bg-[#002B5B] text-white font-mono text-[9px] px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">{filteredQuestions[currQuestionIndex].category}</span>
                        <span className="bg-[#C5A059]/10 text-[#002B5B] font-mono text-[9px] px-2 py-0.5 rounded font-bold uppercase">{filteredQuestions[currQuestionIndex].difficulty}</span>
                        <span className="text-slate-400 text-[10px] font-mono">Banca: VUNESP original adaptada</span>
                      </div>
                      <p className="text-[10px] text-slate-400 italic mt-1">Origem: {filteredQuestions[currQuestionIndex].source}</p>
                    </div>

                    <button 
                      onClick={() => handleToggleBookmark(filteredQuestions[currQuestionIndex].id)} 
                      className={`p-2.5 rounded-full border transition-all ${
                        filteredQuestions[currQuestionIndex].isBookmarked 
                          ? 'bg-[#C5A059]/20 border-[#C5A059] text-[#C5A059]' 
                          : 'border-slate-200 text-slate-400 hover:border-slate-350 hover:bg-slate-50'
                      }`}
                      title="Salvar Questão para Revisão"
                    >
                      <Bookmark size={18} className={filteredQuestions[currQuestionIndex].isBookmarked ? 'fill-current' : ''} />
                    </button>
                  </div>

                  {/* Question Prompt */}
                  <div className="space-y-2">
                    <p className="text-xs text-slate-400 font-bold font-mono">QUESTÃO {currQuestionIndex + 1} DE {filteredQuestions.length}</p>
                    <p className="text-sm md:text-base text-slate-800 leading-relaxed font-serif font-bold p-3 bg-slate-50 border-l-4 border-[#C5A059] rounded-r-xl">
                      {filteredQuestions[currQuestionIndex].text}
                    </p>
                  </div>

                  {/* Options List */}
                  <div className="space-y-2.5 pt-2">
                    {filteredQuestions[currQuestionIndex].options.map((option, idx) => {
                      const letter = String.fromCharCode(65 + idx);
                      let optionStyle = "border-slate-200 hover:border-[#002B5B] hover:bg-slate-50/50";
                      
                      if (hasSubmittedAnswer) {
                        if (idx === filteredQuestions[currQuestionIndex].correctIndex) {
                          optionStyle = "bg-emerald-50 border-emerald-500 text-emerald-800 font-bold ring-1 ring-emerald-500";
                        } else if (idx === selectedAnswerIdx) {
                          optionStyle = "bg-red-50 border-red-500 text-red-800 ring-1 ring-red-500";
                        } else {
                          optionStyle = "border-slate-100 text-slate-400";
                        }
                      }

                      return (
                        <button 
                          key={idx}
                          disabled={hasSubmittedAnswer}
                          onClick={() => handleSubmitAnswer(idx)}
                          className={`w-full text-left p-4 rounded-2xl border text-xs cursor-pointer flex items-center transition-all ${optionStyle}`}
                        >
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs mr-3 transition-colors shrink-0 ${
                            hasSubmittedAnswer 
                              ? idx === filteredQuestions[currQuestionIndex].correctIndex
                                ? 'bg-emerald-500 text-white'
                                : idx === selectedAnswerIdx
                                  ? 'bg-red-500 text-white'
                                  : 'bg-slate-200 text-slate-500'
                              : 'bg-slate-100 text-[#002B5B]'
                          }`}>
                            {letter}
                          </span>
                          <span className="leading-relaxed">{option}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Action buttons following answering */}
                  {hasSubmittedAnswer && (
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4 transition-all duration-300">
                      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                        <div className="flex items-center gap-2">
                          {selectedAnswerIdx === filteredQuestions[currQuestionIndex].correctIndex ? (
                            <span className="text-emerald-600 font-bold flex items-center gap-1 text-xs">
                              <CheckCircle size={14} /> Resposta Correta! Resolução Gravada (+35 XP)
                            </span>
                          ) : (
                            <span className="text-red-500 font-bold flex items-center gap-1 text-xs">
                              <XCircle size={14} /> Errado. Opção correta: {String.fromCharCode(65 + filteredQuestions[currQuestionIndex].correctIndex)} (+10 XP)
                            </span>
                          )}
                        </div>
                        <button 
                          onClick={handleGetAiQuestionExplanation}
                          disabled={isExplaining}
                          className="bg-[#002B5B] hover:bg-[#C5A059] text-white text-[11px] font-bold py-2 px-5 rounded-full font-mono flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Sparkles size={12} /> {isExplaining ? 'Tutor IA analisando...' : 'Explicar com Profundidade (IA) ➔'}
                        </button>
                      </div>

                      {/* Display explanation text if generated or default shown */}
                      {(aiExplanation || isExplaining) && (
                        <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                          <p className="font-bold text-[#002B5B] font-mono text-[10px] mb-2 uppercase tracking-wide">ANÁLISE PEDAGÓGICA DO PROFESSOR IA</p>
                          {isExplaining ? (
                            <div className="animate-pulse space-y-2">
                              <div className="h-3 bg-slate-100 rounded w-3/4"></div>
                              <div className="h-3 bg-slate-100 rounded w-5/6"></div>
                              <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                            </div>
                          ) : (
                            aiExplanation
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Prev/Next Navigation Controls */}
                  <div className="flex justify-between items-center border-t border-slate-100 pt-6">
                    <button 
                      onClick={() => {
                        setCurrQuestionIndex(prev => Math.max(0, prev - 1));
                        setSelectedAnswerIdx(null);
                        setHasSubmittedAnswer(false);
                        setAiExplanation(null);
                      }}
                      disabled={currQuestionIndex === 0}
                      className="bg-slate-100 hover:bg-slate-200 text-[#002B5B] font-bold text-xs py-2.5 px-6 rounded-xl transition-all cursor-pointer disabled:opacity-40"
                    >
                      ◀ Anterior
                    </button>

                    <span className="text-xs text-slate-500 font-medium">Questão {currQuestionIndex + 1} de {filteredQuestions.length}</span>

                    <button 
                      onClick={() => {
                        if (currQuestionIndex < filteredQuestions.length - 1) {
                          setCurrQuestionIndex(prev => prev + 1);
                          setSelectedAnswerIdx(null);
                          setHasSubmittedAnswer(false);
                          setAiExplanation(null);
                        } else {
                          showToast("Você revisou todas as questões desta seção! Tente mudar o filtro municipal.", "success");
                        }
                      }}
                      className="bg-[#002B5B] hover:bg-[#C5A059] text-white font-bold text-xs py-2.5 px-6 rounded-xl transition-all cursor-pointer"
                    >
                      Próxima questão ▶
                    </button>
                  </div>

                </div>
              ) : (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 max-w-md mx-auto">
                  <span className="text-4xl">⚠️</span>
                  <p className="text-slate-800 font-bold mt-4">Nenhuma questão encontrada com estes filtros selecionados.</p>
                  <p className="text-xs text-slate-500 mt-2">Use o botão de limpar filtros para voltar a estudar o volume total de ACE da VUNESP.</p>
                  <button 
                    onClick={() => setFilters({ category: 'Todos', difficulty: 'Todos' })}
                    className="mt-4 bg-[#002B5B] text-white text-xs px-5 py-2 rounded-xl font-bold cursor-pointer"
                  >
                    Exibir Todas as Questões
                  </button>
                </div>
              )}

            </div>
          )}


          {/* TAB 4: SIMULADOS COMPLETOS E GERADOR IA */}
          {activeTab === 'simulados' && (
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Simulados Config & Generate */}
                <section className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-250 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-base text-[#002B5B] font-bold mb-2 flex items-center gap-1">
                      <Sparkles size={16} className="text-[#C5A059]" /> Criação de Simulados Automatizados IA
                    </h3>
                    <p className="text-slate-500 text-xs mb-4">
                      O sistema analisa as bacias do Tietê-Batalha de Promissão, o manual nacional do Agente de Endemias e cria novos exercícios estritamente inéditos.
                    </p>

                    <div className="space-y-4">
                      {/* Topic Selector Checkboxes */}
                      <div>
                        <label className="block text-[10px] text-slate-400 font-bold uppercase mb-2">Selecione disciplinas obrigatórias:</label>
                        <div className="space-y-2">
                          {['Combate a Vetores (ACE)', 'Legislação do SUS', 'História e Geografia de Promissão', 'Lei Orgânica de Promissão'].map((theme) => {
                            const isChecked = selectedTopics.includes(theme);
                            return (
                              <button
                                key={theme}
                                type="button"
                                onClick={() => toggleTopic(theme)}
                                className={`w-full text-left p-2.5 rounded-xl border text-xs flex items-center justify-between transition-all ${
                                  isChecked ? 'bg-[#C5A059]/10 border-[#C5A059] font-bold text-[#002B5B]' : 'bg-slate-50 border-slate-200 text-slate-600'
                                }`}
                              >
                                <span>{theme}</span>
                                <span>{isChecked ? '✓ Selecionado' : '+ Adicionar'}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Difficulty Selection */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5">Rigor Metodológico</label>
                          <select 
                            className="bg-slate-50 text-xs w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none"
                            value={simDifficulty}
                            onChange={(e: any) => setSimDifficulty(e.target.value)}
                          >
                            <option value="Fácil">Fácil (Iniciante)</option>
                            <option value="Médio">Médio (Padrão VUNESP)</option>
                            <option value="Difícil">Difícil (Alta Concorrência)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5">Nº de Questões</label>
                          <select 
                            className="bg-slate-50 text-xs w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none"
                            value={simQuestionsCount}
                            onChange={(e) => setSimQuestionsCount(parseInt(e.target.value))}
                          >
                            <option value="3">3 Questões Rápido</option>
                            <option value="5">5 Questões Realista</option>
                            <option value="10">10 Questões Exame Real</option>
                          </select>
                        </div>
                      </div>

                    </div>
                  </div>

                  <div className="mt-6 border-t border-slate-100 pt-4">
                    <button 
                      onClick={handleGenerateCustomSimulation}
                      disabled={isGeneratingMock}
                      className="bg-[#002B5B] hover:bg-[#C5A059] text-white p-3.5 rounded-2xl w-full font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow flex justify-center items-center gap-2"
                    >
                      {isGeneratingMock ? 'Gerando questões inéditas no servidor...' : 'Gerar Simulado Personalizado via IA ➔'}
                    </button>
                    <p className="text-[9px] text-slate-400 text-center mt-2 font-mono">Processamento de 100% dos dados gerados com base em editais reais</p>
                  </div>
                </section>

                {/* Simulated active exam layout */}
                <section className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between">
                  {activeSimulationMode ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center bg-[#F4F7FA] p-3 rounded-2xl border border-slate-100">
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase font-mono">SIMULADO ATIVO</p>
                          <h4 className="text-xs font-bold text-[#002B5B]">{simQuestionsCount} Questões em andamento</h4>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] font-bold text-slate-400 font-mono">CRONÔMETRO</p>
                          <span className="text-sm font-mono font-bold text-red-600">
                            {Math.floor(timerLeft / 60)}:{(timerLeft % 60).toString().padStart(2, '0')}
                          </span>
                        </div>
                      </div>

                      {simCompleted ? (
                        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-4">
                          <h4 className="text-base font-bold text-emerald-800 flex items-center gap-1">🏆 Relatório Detalhado de Envio</h4>
                          <p className="text-xs text-slate-650">
                            O simulado foi enviado com sucesso para a Central de Notas do Candidato.
                          </p>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white p-3 rounded-xl shadow-sm text-center">
                              <p className="text-2xl font-black text-[#002B5B]">
                                {customMockQuestions.filter((q, idx) => simAnswers[idx] === q.correctIndex).length} / {customMockQuestions.length}
                              </p>
                              <p className="text-[9px] text-slate-400 uppercase">Respostas Corretas</p>
                            </div>
                            <div className="bg-white p-3 rounded-xl shadow-sm text-center">
                              <p className="text-2xl font-black text-[#C5A059]">+{customMockQuestions.filter((q, idx) => simAnswers[idx] === q.correctIndex).length * 50} XP</p>
                              <p className="text-[9px] text-slate-400 uppercase">XP Acumulado de Bônus</p>
                            </div>
                          </div>

                          <button 
                            onClick={() => {
                              setActiveSimulationMode(false);
                              setSimCompleted(false);
                            }}
                            className="w-full bg-[#002B5B] text-white p-2.5 rounded-xl text-xs font-bold font-mono"
                          >
                            Voltar para Novo Teste
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="max-h-96 overflow-y-auto space-y-6 pr-1">
                            {customMockQuestions.map((q, qIdx) => (
                              <div key={qIdx} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl spacing">
                                <p className="text-xs font-bold text-slate-500 mb-2 font-mono">QUESTÃO {qIdx + 1} DE {customMockQuestions.length}</p>
                                <p className="text-xs font-serif font-bold text-slate-800 leading-relaxed mb-3">{q.text}</p>
                                
                                <div className="space-y-2">
                                  {q.options.map((opt, optIdx) => {
                                    const letter = String.fromCharCode(65 + optIdx);
                                    const isSelected = simAnswers[qIdx] === optIdx;
                                    return (
                                      <button
                                        key={optIdx}
                                        type="button"
                                        onClick={() => setSimAnswers(prev => ({ ...prev, [qIdx]: optIdx }))}
                                        className={`w-full text-left p-3 rounded-xl border text-[11px] font-mono flex items-center transition-all ${
                                          isSelected ? 'bg-indigo-50 border-indigo-400 font-bold text-indigo-800' : 'bg-white border-slate-200 hover:border-[#002B5B]'
                                        }`}
                                      >
                                        <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] mr-2 shrink-0 ${
                                          isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                                        }`}>{letter}</span>
                                        <span>{opt}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>

                          <button 
                            onClick={handleFinishSimulation}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white w-full p-3 rounded-xl text-xs font-bold tracking-wider uppercase cursor-pointer"
                          >
                            Entregar Simulado e Obter Notas
                          </button>
                        </div>
                      )}

                    </div>
                  ) : (
                    <div className="text-center p-8 flex flex-col items-center justify-center h-full space-y-4">
                      <span className="text-5xl">📄</span>
                      <h4 className="text-sm font-bold text-slate-700">Canal de Teste Aguardando Geração</h4>
                      <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
                        Defina as disciplinas e a quantidade de perguntas ao lado. A inteligência artificial irá formular um caderno com chaves e correções de alto padrão.
                      </p>
                      <button 
                        onClick={() => {
                          setCustomMockQuestions(questions.slice(0, 3));
                          setSimAnswers({});
                          setActiveSimulationMode(true);
                          setTimerLeft(400);
                        }}
                        className="bg-slate-100 text-[#002B5B] text-xs font-bold px-4 py-2 rounded-xl border border-slate-200"
                      >
                        Carregar Exemplo Local Rapidamente
                      </button>
                    </div>
                  )}
                </section>

              </div>

            </div>
          )}


          {/* TAB: COMBAT ARENA RPG */}
          {activeTab === 'arena' && (
            <div className="space-y-6">
              
              {/* Dynamic Retro Header representing intense gaming atmosphere */}
              <div className="p-5 bg-slate-900 border border-[#C5A059] rounded-3xl text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-6 opacity-10 select-none">
                  <span className="text-8xl">⚔️</span>
                </div>
                <div className="relative z-10">
                  <span className="bg-red-650 bg-red-650 bg-red-600 text-[10px] text-white px-2.5 py-0.5 rounded-full font-bold uppercase tracking-widest">MINI-GAME RPG</span>
                  <h2 className="text-xl font-serif italic text-white mt-1.5 flex items-center gap-2">
                    🛡️ Arena de Combate ACE: Defensor de Promissão/SP
                  </h2>
                  <p className="text-slate-300 text-xs mt-1 max-w-2xl">
                    Cada resposta correta dispara um potente jato de larvicida químico detonando o criadouro inimigo. Se errar, o vetor se prolifera urbanamente e danifica seu escudo! Estude divertindo-se e ganhe <strong>+300 XP</strong> por conquista!
                  </p>
                </div>
              </div>

              {/* Game Stage Layout Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Row 1: The Combat Canvas screen container */}
                <div className="lg:col-span-8 flex flex-col space-y-6">
                  
                  {/* Combat Visualizer Container */}
                  <div className="bg-slate-950 border-4 border-slate-800 rounded-3xl p-6 min-h-[300px] flex flex-col justify-between relative shadow-inner overflow-hidden">
                    
                    {/* Background Grid Accent */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-10" />

                    {/* Battle Status Row */}
                    <div className="flex justify-between items-start z-10 w-full flex-wrap gap-4">
                      
                      {/* Player Status Health Capsule */}
                      <div className={`p-4 bg-slate-900/95 border border-slate-700 rounded-2xl w-44 md:w-52 transition-transform duration-300 ${isPlayerDamaged ? 'animate-shake border-red-500 bg-red-950/40' : ''}`}>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-lg">🦸</span>
                          <span className="font-bold text-[11px] text-slate-200">Defensor do SUS</span>
                        </div>
                        
                        {/* HP bar */}
                        <div className="h-3 w-full bg-slate-800 rounded-full mt-1.5 overflow-hidden border border-slate-700">
                          <div className={`h-full transition-all duration-500 ${playerHp > 50 ? 'bg-emerald-500' : playerHp > 20 ? 'bg-amber-500 animate-pulse' : 'bg-red-600 animate-pulse'}`} style={{ width: `${playerHp}%` }} />
                        </div>
                        <div className="flex justify-between text-[10px] font-mono mt-1 text-slate-400">
                          <span>HP ESCOPO</span>
                          <span className="font-bold text-white">{playerHp}/100</span>
                        </div>
                      </div>

                      {/* Level and vs Badge Segment */}
                      <div className="flex flex-col items-center justify-center p-2 bg-slate-900/90 border border-[#C5A059]/40 rounded-xl">
                        <span className="text-[10px] font-mono text-[#C5A059] font-bold">FASE {combatLevel}</span>
                        <span className="text-red-500 font-extrabold text-xs animate-pulse">VS</span>
                      </div>

                      {/* Enemy Status Health Capsule */}
                      <div className={`p-4 bg-slate-900/95 border border-slate-700 rounded-2xl w-44 md:w-52 text-right transition-transform duration-300 ${isEnemyDamaged ? 'animate-shake border-[#C5A059] bg-[#C5A059]/10' : ''}`}>
                        <div className="flex items-center justify-end gap-1.5 mb-1">
                          <span className="font-bold text-[11px] text-[#C5A059] truncate max-w-[120px]">{enemyName}</span>
                          <span className="text-lg">{enemyEmoji}</span>
                        </div>
                        
                        {/* HP bar */}
                        <div className="h-3 w-full bg-slate-800 rounded-full mt-1.5 overflow-hidden border border-slate-700">
                          <div className={`h-full bg-red-500 transition-all duration-500`} style={{ width: `${Math.min(100, enemyHp)}%` }} />
                        </div>
                        <div className="flex justify-between text-[10px] font-mono mt-1 text-slate-400">
                          <span className="font-bold text-white">{enemyHp} HP</span>
                          <span>CRIADOURO</span>
                        </div>
                      </div>

                    </div>

                    {/* Combat action and floating icons stage overlay */}
                    <div className="flex items-center justify-around py-8 z-10 min-h-[140px] relative">
                      
                      {/* Left Player Sprite Element */}
                      <div className="text-center relative">
                        <div className="text-5xl md:text-6xl animate-bounce-slow drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                          🛡️
                        </div>
                        <span className="bg-[#002B5B] text-[9px] text-slate-300 font-mono px-2 py-0.5 rounded border border-indigo-500 mt-2 block font-bold">SUPER ACE</span>
                        
                        {/* Laser Shot visual FX */}
                        {isEnemyDamaged && (
                          <div className="absolute top-1/2 left-10 md:left-14 w-40 md:w-72 h-1.5 bg-gradient-to-r from-[#C5A059] via-yellow-400 to-transparent rounded-full shadow-[0_0_10px_#C5A059] mix-blend-screen animate-pulse z-20 pointer-events-none" />
                        )}
                      </div>

                      {/* Floating damage pop-ups */}
                      {damageFeedback && (
                        <div className="absolute inset-x-0 top-1/2 text-center z-20 pointer-events-none animate-bounce">
                          <span className="bg-slate-900 text-white border border-[#C5A059] shadow-2xl px-4 py-2 rounded-2xl text-[11px] font-bold tracking-tight">
                            {damageFeedback}
                          </span>
                        </div>
                      )}

                      {/* Right Enemy Sprite Element */}
                      <div className="text-center relative">
                        <div className={`text-5xl md:text-6xl drop-shadow-[0_0_15px_rgba(239,68,68,0.3)] ${isEnemyDamaged ? 'scale-75 brightness-75 duration-100' : 'animate-pulse'}`}>
                          {enemyEmoji}
                        </div>
                        <span className="bg-[#002B5B] bg-slate-900 text-[9px] text-red-200 font-mono px-2 py-0.5 rounded border border-red-500 mt-2 block font-bold">VETOR</span>
                        
                        {/* Poison counter-spray visual FX */}
                        {isPlayerDamaged && (
                          <div className="absolute top-1/2 right-10 md:right-14 w-40 md:w-72 h-1.5 bg-gradient-to-l from-red-600 via-purple-600 to-transparent rounded-full shadow-[0_0_10px_red] mix-blend-screen animate-pulse z-20 pointer-events-none" />
                        )}
                      </div>

                    </div>

                    {/* Operational system prompt panel */}
                    <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl z-10 flex flex-col sm:flex-row justify-between items-center text-center gap-2">
                      <div className="text-left">
                        <span className="text-[#C5A059] font-mono text-[9px] uppercase font-bold">STATUS OPERACIONAL DE BANCA</span>
                        <p className="text-[10px] text-slate-300">
                          {enemyHp <= 0 ? "⚠️ Criadouro abatido! Gere um novo alvo no painel direito ao lado." : 
                           playerHp <= 0 ? "💔 Seu escudo esgotou. Cure-se estudando leis ou simuladores!" :
                           "Selecione uma resposta correta abaixo para infligir danos de larvicida!"}
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        {(enemyHp <= 0 || playerHp <= 0) && (
                          <button
                            type="button"
                            onClick={handleStartNewBattle}
                            className="bg-red-600 hover:bg-[#C5A059] text-white px-4 py-1.5 rounded-xl text-[10px] font-bold shadow animate-pulse cursor-pointer"
                          >
                            ⚔️ Iniciar Novo Alvo de Combate
                          </button>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* Active Question matching Card */}
                  {combatQuestion ? (
                    <div className="bg-white rounded-3xl border-2 border-[#C5A059] p-6 shadow-sm flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center flex-wrap gap-2 mb-3">
                          <span className="bg-[#002B5B] text-white text-[9px] font-bold font-mono px-2.5 py-0.5 rounded uppercase tracking-wider">
                            {combatQuestion.category}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">FONTE: EDITAL PROMISSÃO MUNICIPAL</span>
                        </div>
                        
                        <p className="text-xs font-serif font-bold text-slate-800 leading-relaxed mb-4">
                          "{combatQuestion.text}"
                        </p>

                        {/* Interactive options grid */}
                        <div className="space-y-2 mb-4">
                          {combatQuestion.options.map((opt, oIdx) => {
                            const letter = String.fromCharCode(65 + oIdx);
                            const isSelected = combatSelectedAnswerIdx === oIdx;
                            const isCorrectOpt = oIdx === combatQuestion.correctIndex;
                            let styleCls = "bg-slate-50 border-slate-200 hover:border-[#002B5B]";
                            
                            if (combatAnswered) {
                              if (isCorrectOpt) {
                                styleCls = "bg-green-50 border-green-500 text-green-800 font-bold";
                              } else if (isSelected) {
                                styleCls = "bg-red-100 border-red-500 text-red-800";
                              } else {
                                styleCls = "bg-slate-50 border-slate-100 opacity-60";
                              }
                            } else if (isSelected) {
                              styleCls = "bg-[#C5A059]/10 border-[#C5A059] font-bold text-[#002B5B]";
                            }

                            return (
                              <button
                                key={oIdx}
                                type="button"
                                disabled={combatAnswered}
                                onClick={() => handleAnswerCombatQuestion(oIdx)}
                                className={`w-full text-left p-3 rounded-xl border text-[11px] font-mono flex items-center transition-all cursor-pointer ${styleCls}`}
                              >
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[9px] mr-2 shrink-0 ${
                                  isSelected ? 'bg-[#002B5B] text-white' : 'bg-slate-200 text-slate-655'
                                }`}>{letter}</span>
                                <span>{opt}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Explanation box revealed after answering */}
                      {combatAnswered && (
                        <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl animate-fade-in">
                          <p className="text-[10px] font-bold text-[#C5A059] uppercase tracking-wider mb-1">AUDITORIA SANITÁRIA DE BANCA DE SAÚDE</p>
                          <p className="text-[11px] text-slate-650 leading-relaxed italic">{combatQuestion.explanation}</p>
                          
                          <button
                            type="button"
                            onClick={handleLoadCombatQuestion}
                            className="mt-3 bg-[#002B5B] hover:bg-[#C5A059] text-white text-[10px] font-bold font-mono px-4 py-2 rounded-xl transition-all cursor-pointer"
                          >
                            Derrubar Próxima Ameaça de Promissão ➔
                          </button>
                        </div>
                      )}

                    </div>
                  ) : (
                    <div className="bg-white p-8 rounded-3xl text-center border">
                      <p className="text-xs text-slate-500">Nenhuma questão carregada. Clique em iniciar novo alvo!</p>
                    </div>
                  )}

                </div>

                {/* Row 2: Rolling Action log details */}
                <div className="lg:col-span-4 flex flex-col space-y-6">
                  
                  {/* Combat console telemetry */}
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 text-white flex flex-col h-[530px] justify-between shadow-lg">
                    <div>
                      <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-3">
                        <h4 className="text-[10px] font-bold font-mono text-[#C5A059] tracking-widest uppercase">LOGS DE TRÁFEGO AMBIENTAL</h4>
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      </div>
                      
                      {/* Action feed scrolling loop */}
                      <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                        {combatHistory.map((h, hIdx) => (
                          <div key={hIdx} className="text-[10px] font-mono text-slate-350 text-slate-300 border-l border-slate-700 pl-2 py-1 leading-relaxed">
                            <span className="text-[#C5A059] font-bold">[{hIdx === 0 ? 'CONTA' : 'LOG'}]</span> {h}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-slate-800 pt-3">
                      <span className="text-[9px] uppercase font-bold text-slate-500 font-mono">SUPLEMENTO DE CURA DE ESCUDO</span>
                      <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                        Seu HP está baixo? Vá para a aba de estudos de <strong>Repetição Espaçada (Flashcards)</strong> ou conclua metas de estudos para restabelecer energia!
                      </p>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}


          {/* TAB 5: REVISÃO ATIVA COM FLASHCARDS */}
          {activeTab === 'flashcards' && (
            <div className="space-y-6">
              
              <div className="p-4 bg-white border border-slate-100 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                  <h3 className="text-base text-[#002B5B] font-bold">📚 Memorização com Repetição Espaçada (Curva de Esquecimento)</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    A metodologia estipula que estimando a fadiga do cérebro para determinado assunto, adiamos o estudo para daqui a 3, 7 ou 14 dias de folga estratégica.
                  </p>
                </div>
                <button 
                  onClick={() => {
                    setFlashcards(initialFlashcards);
                    setCurrCardIdx(0);
                    showToast("Lista de flashcards resetada para o padrão inicial.");
                  }}
                  className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-1.5 text-xs font-mono font-bold"
                >
                  Reiniciar Cartões
                </button>
              </div>

              {/* Flashcard Component Stage conforming to design */}
              <div className="max-w-xl mx-auto">
                <div 
                  onClick={() => setIsCardFlipped(!isCardFlipped)}
                  className={`min-h-[250px] p-6 rounded-3xl cursor-pointer text-center flex flex-col justify-between items-center transition-all duration-500 transform border-2 relative select-none ${
                    isCardFlipped 
                      ? 'bg-[#002B5B] text-white border-[#C5A059] rotate-0 shadow-2xl' 
                      : 'bg-white text-slate-800 border-slate-200 shadow-lg'
                  }`}
                >
                  <span className="text-[10px] font-mono uppercase bg-slate-100 text-slate-500 px-3 py-1 rounded-full border border-slate-200 font-bold">
                    {flashcards[currCardIdx]?.category}
                  </span>

                  <div className="my-8 px-4">
                    {isCardFlipped ? (
                      <div>
                        <p className="text-[10px] font-bold text-[#C5A059] uppercase tracking-widest mb-2">GABARITO DO TUTOR</p>
                        <p className="text-sm leading-relaxed text-slate-100 font-mono italic">
                          {flashcards[currCardIdx]?.back}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">PERGUNTA ATIVA DE MEMÓRIA</p>
                        <p className="text-base font-bold font-serif leading-relaxed text-slate-850">
                          {flashcards[currCardIdx]?.front}
                        </p>
                      </div>
                    )}
                  </div>

                  <span className="text-[10px] text-slate-400 italic">
                    {isCardFlipped ? 'Clique para ver a pergunta novamente' : 'Clique no cartão para revelar a resposta'}
                  </span>
                </div>

                 {/* Score Grade Buttons */}
                 {isCardFlipped && (
                   <div className="grid grid-cols-3 gap-3 mt-6 text-center">
                     <button 
                       onClick={() => handleGradeCard('hard')}
                       className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-008 text-red-800 p-3 rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
                     >
                       🔴 Errei <br/>
                       <span className="text-[9px] font-normal font-mono text-red-600">(Rever Amanhã)</span>
                     </button>
                     <button 
                       onClick={() => handleGradeCard('good')}
                       className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 p-3 rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
                     >
                       🟡 Sabia <br/>
                       <span className="text-[9px] font-normal font-mono text-indigo-600">(Rever em {(flashcards[currCardIdx]?.intervalDays || 1) * 2} dias)</span>
                     </button>
                     <button 
                       onClick={() => handleGradeCard('easy')}
                       className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 p-3 rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
                     >
                       🟢 Decorei <br/>
                       <span className="text-[9px] font-normal font-mono text-emerald-600">(Rever em {(flashcards[currCardIdx]?.intervalDays || 1) * 4} dias)</span>
                     </button>
                   </div>
                 )}
              </div>

            </div>
          )}


          {/* TAB 6: ÁREA EXCLUSIVA PROMISSÃO/SP */}
          {activeTab === 'promissao' && (
            <div className="space-y-6">
              
              <div className="p-5 bg-gradient-to-r from-[#002B5B] to-[#C5A059] text-white rounded-3xl shadow-md">
                <h3 className="text-lg font-serif italic text-white underline decoration-white decoration-1">🏙️ Setor de Informação do Município de Promissão/SP</h3>
                <p className="text-xs text-slate-100 leading-relaxed max-w-2xl mt-1">
                  Estude as leis exclusivas de forma estruturada. Conhecimentos locais (como a história da Colônia Aliança estabelecida em 1918) representam 20% das notas objetivas da banca VUNESP.
                </p>
              </div>

              {/* News ticker and stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-4 rounded-2xl border border-slate-100">
                  <span className="text-xs bg-[#C5A059]/10 text-[#002B5B] px-2 py-0.5 rounded font-bold">INFO</span>
                  <h4 className="font-bold text-xs text-slate-800 mt-2">Bacia Tietê-Batalha</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                    Promissão possui forte influência hídrica, exigindo ações do ACE na prevenção de focos de insetos em várzeas e pesqueiros da região.
                  </p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100">
                  <span className="text-xs bg-[#C5A059]/10 text-[#002B5B] px-2 py-0.5 rounded font-bold">CONCURSO</span>
                  <h4 className="font-bold text-xs text-slate-800 mt-2">Remuneração Base</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                    Vencimentos iniciais atrativos de até R$ 2.824,00 vigentes mais 40% de insalubridade pelas regras da CLT sanitária de Promissão.
                  </p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100">
                  <span className="text-xs bg-[#C5A059]/10 text-[#002B5B] px-2 py-0.5 rounded font-bold">HISTÓRIA</span>
                  <h4 className="font-bold text-xs text-slate-800 mt-2">Shuhei Uetsuka & Colonizadores</h4>
                  <p className="text-[11px] text-slate-505 text-slate-500 leading-relaxed mt-1">
                    Marcos históricos como a Praça Drunk-City, Monumento dos Imigrantes Japoneses e Colônia Aliança sagram a formação cultural.
                  </p>
                </div>
              </div>

              {/* Laws summarized */}
              <section className="bg-white p-6 rounded-3xl border border-slate-250">
                <h4 className="text-sm font-bold text-[#002B5B] mb-4">📖 Leis Municipais Anotadas para Estudo Ativo</h4>
                
                <div className="space-y-6">
                  {localLawSummaries.map((law) => {
                    const isExpanded = expandedLawId === law.id;
                    return (
                      <div key={law.id} className="p-4 bg-slate-50 border border-slate-150 rounded-2xl transition-all duration-300">
                        <div 
                          className="flex justify-between items-center cursor-pointer select-none"
                          onClick={() => setExpandedLawId(isExpanded ? null : law.id)}
                        >
                          <div className="flex-1 pr-4">
                            <h5 className="font-serif font-bold text-sm text-[#002B5B] tracking-wide flex items-center gap-2">
                              <span>📖</span> {law.title}
                            </h5>
                            <p className="text-[10px] text-slate-400 font-mono">{law.subtitle}</p>
                          </div>
                          <span className="bg-[#002B5B]/5 hover:bg-[#002B5B]/10 text-[#002B5B] text-[10px] font-bold px-2 py-1 rounded-lg transition-colors shrink-0">
                            {isExpanded ? '▲ Recolher' : '▼ Estudar'}
                          </span>
                        </div>

                        {isExpanded && (
                          <div className="mt-4 space-y-4 animate-fade-in">
                            <p className="text-xs text-slate-600 leading-relaxed">{law.description}</p>
                            
                            <div className="bg-white p-3.5 rounded-xl border border-slate-100 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                              <strong>Resumo Geral:</strong> {law.fullTextSummary}
                            </div>

                            <div className="space-y-2">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">ARTIGOS MAIS COBRADOS (VUNESP)</p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {law.keyArticles.map((art, idx) => (
                                  <div key={idx} className="bg-white p-3 rounded-xl border border-slate-100">
                                    <span className="text-[9px] bg-indigo-50 text-indigo-700 px-2 py-0.2 rounded font-bold">{art.article}</span>
                                    <p className="text-[11px] text-slate-800 leading-relaxed mt-1.5 italic font-serif">"{art.text}"</p>
                                    <div className="mt-2 text-[10px] text-amber-600 font-mono font-bold leading-normal bg-amber-50/50 p-1.5 rounded">
                                      💡 Comentário: {art.note}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>

            </div>
          )}


          {/* TAB 7: MATERIAIS, PDFS E VÍDEOS */}
          {activeTab === 'materials' && (
            <div className="space-y-6">
              
              <div className="p-4 bg-white border border-slate-100 rounded-3xl">
                <h3 className="text-base text-[#002B5B] font-bold">🎥 Central de Videoaulas e Apostilas em PDF</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Confira as lições gravadas por especialistas e baixe resumos de auditoria focados no cargo de ACE.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* PDF Materials Download list */}
                <section className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-6">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Apostilas & Resumos</h4>
                  
                  <div className="space-y-3">
                    {initialPdfMaterials.map((pdf) => (
                      <div key={pdf.id} className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl flex items-start gap-3">
                        <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center text-lg text-rose-600 font-extrabold select-none">PDF</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">{pdf.title}</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">{pdf.pages} páginas • {pdf.fileSize}</p>
                          <p className="text-[9px] text-indigo-600 mt-1 italic">Autor: {pdf.author}</p>
                          
                          <button 
                            onClick={() => {
                              showToast(`Download de "${pdf.title}" simulado com absoluto sucesso!`, "success");
                              setStats(prev => ({ ...prev, xp: prev.xp + 10 }));
                            }}
                            className="mt-2.5 bg-slate-100 hover:bg-[#C5A059] hover:text-white text-slate-700 text-[10px] font-bold px-3 py-1 rounded transition-all cursor-pointer"
                          >
                            Baixar Documento (+10 XP)
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Video Lessons with interactive local player */}
                <section className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Grade de Videoaulas</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {initialVideoLessons.map((lesson) => (
                        <div key={lesson.id} className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 flex flex-col justify-between">
                          <div className="relative h-32 bg-slate-850">
                            <img src={lesson.thumbnail} alt={lesson.title} className="w-full h-full object-cover opacity-60" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <button 
                                onClick={() => {
                                  showToast(`Reproduzindo aula: "${lesson.title}"`, 'info');
                                }}
                                className="w-10 h-10 bg-[#C5A059] hover:bg-[#002B5B] text-white rounded-full flex items-center justify-center shadow-lg transition-all"
                              >
                                <Play size={18} fill="currentColor" className="ml-0.5" />
                              </button>
                            </div>
                            <span className="absolute bottom-2 right-2 bg-black/70 text-white font-mono text-[9px] px-1.5 py-0.5 rounded">
                              {lesson.duration}
                            </span>
                          </div>

                          <div className="p-3">
                            <span className="text-[9px] bg-slate-205 bg-slate-200 text-[#002B5B] font-mono px-2 py-0.2 rounded font-bold uppercase">{lesson.category}</span>
                            <h5 className="font-bold text-xs text-slate-850 mt-1">{lesson.title}</h5>
                            <p className="text-[10px] text-slate-400 mt-0.5">Instrutor: {lesson.instructor}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 border-t border-slate-100 pt-4 text-center">
                    <p className="text-xs text-slate-500">Videoaulas completas homologadas para o ciclo vacinal 2026 de Promissão/SP</p>
                  </div>
                </section>

              </div>

            </div>
          )}


          {/* TAB 8: COMUNIDADE E FÓRUM */}
          {activeTab === 'comunidade' && (
            <div className="space-y-6">
              
              <div className="p-4 bg-white border border-slate-100 rounded-3xl">
                <h3 className="text-base text-[#002B5B] font-bold">💬 Mural de Discussão de Candidatos</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Grupos de estudos unidos e integrados. Esclareça teses da banca VUNESP em debate civilizado com outros candidatos da cidade.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Create Topic thread form */}
                <section className="lg:col-span-4 bg-white p-5 rounded-3xl border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Publicar Nova Dúvida</h4>
                  
                  <form onSubmit={handleCreateForumPost} className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase">Assunto Principal</label>
                      <input 
                        type="text" 
                        value={newPostTitle}
                        onChange={(e) => setNewPostTitle(e.target.value)}
                        placeholder="Ex: Como marcar herança japonesa na prova" 
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase">Categoria</label>
                      <select 
                        className="bg-slate-50 text-xs w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none"
                        value={forumCategory}
                        onChange={(e) => setForumCategory(e.target.value)}
                      >
                        <option value="Geral">Assunto Geral</option>
                        <option value="Combate a Vetores (ACE)">Combate a Vetores (ACE)</option>
                        <option value="Legislação do SUS">Legislação do SUS</option>
                        <option value="História e Geografia de Promissão">Geografia Regional de Promissão</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase">Mensagem Explanatório</label>
                      <textarea 
                        rows={4}
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        placeholder="Estudei o artigo 12 e notei que..." 
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none resize-none"
                      />
                    </div>

                    <button 
                      type="submit" 
                      className="w-full bg-[#002B5B] hover:bg-[#C5A059] text-white p-3 rounded-xl text-xs font-bold uppercase transition-all"
                    >
                      Publicar no Fórum ➔
                    </button>
                  </form>
                </section>

                {/* Forum feed posts */}
                <section className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Últimas Postagens da Comunidade</h4>
                  
                  <div className="space-y-4 overflow-y-auto max-h-[500px]">
                    {forumPosts.map((post) => (
                      <div key={post.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <img src={post.authorAvatar} alt={post.authorName} className="w-8 h-8 rounded-full border border-[#C5A059]" />
                            <div>
                              <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                {post.authorName}
                                <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded ${
                                  post.authorRole === 'Especialista' ? 'bg-indigo-100 text-[#002B5B]' : 'bg-slate-200 text-slate-600'
                                }`}>{post.authorRole}</span>
                              </p>
                              <p className="text-[10px] text-slate-400">{post.timestamp}</p>
                            </div>
                          </div>
                          <span className="bg-[#C5A059]/10 text-[#002B5B] font-mono text-[9px] px-2 py-0.5 rounded font-bold uppercase">{post.category}</span>
                        </div>

                        <div>
                          <h5 className="font-bold text-xs text-[#002B5B]">{post.title}</h5>
                          <p className="text-xs text-slate-650 leading-relaxed mt-1">{post.content}</p>
                        </div>

                        <div className="flex items-center gap-4 border-t border-slate-200/50 pt-2 text-[11px] font-bold text-slate-500">
                          <button 
                            onClick={() => handleLikePost(post.id)}
                            className="hover:text-amber-600 flex items-center gap-1 cursor-pointer"
                          >
                            👍 {post.likes} Útil
                          </button>
                          <span>💬 {post.commentsCount} Comentários</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

              </div>

            </div>
          )}


          {/* TAB 9: CONFIGURAÇÕES E PAINEL ADMINISTRATIVO (Cadastro de cargos/questões/simulados) */}
          {activeTab === 'admin' && (
            <div className="space-y-6">
              
              <div className="p-5 bg-white border border-slate-250 rounded-3xl shadow-sm">
                <h3 className="text-[#002B5B] font-bold text-base">⚙️ Painel do Diretor Pedagógico (Administração Local)</h3>
                <p className="text-slate-500 text-xs mt-1">
                  Módulo de cadastro de questões, cargos, conteúdos programáticos exclusivos e controle de integridade de segurança da base Promissão Concursos.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* 1. Cadastrar nova questão manual */}
                <section className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-1">
                    <span>➕</span> Injetor de Nova Questão no Banco
                  </h4>

                  <form onSubmit={handleAdminAddQuestion} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase">Enunciado Completo da Questão</label>
                      <textarea 
                        rows={3}
                        required
                        value={adminQuestionText}
                        onChange={(e) => setAdminQuestionText(e.target.value)}
                        placeholder="Ex: No encerramento da inspeção em Ponto Estratégico, o Agente de Endemias preenche..."
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase">Alternativa A</label>
                        <input type="text" required value={adminOptA} onChange={(e) => setAdminOptA(e.target.value)} placeholder="Opção A" className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase">Alternativa B</label>
                        <input type="text" required value={adminOptB} onChange={(e) => setAdminOptB(e.target.value)} placeholder="Opção B" className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase">Alternativa C</label>
                        <input type="text" required value={adminOptC} onChange={(e) => setAdminOptC(e.target.value)} placeholder="Opção C" className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase">Alternativa D</label>
                        <input type="text" required value={adminOptD} onChange={(e) => setAdminOptD(e.target.value)} placeholder="Opção D" className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase">Qual alternativa é a correta?</label>
                        <select 
                          className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-700"
                          value={adminCorrectIndex}
                          onChange={(e) => setAdminCorrectIndex(parseInt(e.target.value))}
                        >
                          <option value="0">Opção A é Correta</option>
                          <option value="1">Opção B é Correta</option>
                          <option value="2">Opção C é Correta</option>
                          <option value="3">Opção D é Correta</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase">Disciplina</label>
                        <select 
                          className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-700"
                          value={adminCategory}
                          onChange={(e) => setAdminCategory(e.target.value)}
                        >
                          <option value="Combate a Vetores (ACE)">Combate a Vetores (ACE)</option>
                          <option value="Legislação do SUS">Legislação do SUS</option>
                          <option value="História e Geografia de Promissão">História de Promissão</option>
                          <option value="Lei Orgânica de Promissão">Lei Orgânica</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase font-mono">Resolução detalhado da justificativa (Opcional)</label>
                      <input 
                        type="text" 
                        value={adminExplanation}
                        onChange={(e) => setAdminExplanation(e.target.value)}
                        placeholder="Em decorrência do artigo tal o agente deve realizar..." 
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                      />
                    </div>

                    <button 
                      type="submit" 
                      className="bg-[#002B5B] hover:bg-[#C5A059] text-white py-3 px-5 rounded-xl w-full text-xs font-bold uppercase transition-all shadow cursor-pointer text-center"
                    >
                      Injetar Questão na Base de Dados
                    </button>
                  </form>
                </section>

                {/* 2. Base Analytics */}
                <section className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Métricas do Servidor Integrado</h4>
                    
                    <div className="space-y-4">
                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex justify-between items-center">
                        <span className="text-xs text-slate-600 font-medium">Bateria de Questões Disponíveis</span>
                        <strong className="text-sm text-[#002B5B] font-mono">{questions.length}</strong>
                      </div>

                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex justify-between items-center">
                        <span className="text-xs text-slate-600 font-medium">Flashcards de Repetição</span>
                        <strong className="text-sm text-[#002B5B] font-mono">{flashcards.length}</strong>
                      </div>

                      <div className="bg-indigo-50/50 p-3.5 rounded-xl border border-indigo-100/50 flex justify-between items-center text-xs text-indigo-900">
                        <span>Chave Secreta Gemini IA</span>
                        <span className="bg-emerald-500 text-white font-mono text-[9px] px-2 py-0.5 rounded font-bold uppercase">Conectada</span>
                      </div>
                    </div>

                    <div className="mt-8">
                      <h5 className="font-bold text-xs text-slate-700 mb-2">Simular Plano de Assinaturas</h5>
                      <div className="grid grid-cols-2 gap-2 text-center">
                        <button 
                          onClick={() => showToast("Simulado plano Premium anual ativado para sua conta de teste!", "success")}
                          className="bg-amber-50 text-[#C5A059] border border-[#C5A059] p-3 rounded-2xl text-[11px] font-bold"
                        >
                          Anual (R$ 19,90/mês)
                        </button>
                        <button 
                          onClick={() => showToast("Simulado plano Premium mensal ativado!", "success")}
                          className="bg-slate-50 text-slate-700 border border-slate-200 p-3 rounded-2xl text-[11px] font-bold"
                        >
                          Mensal (R$ 29,90/mês)
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 border-t border-slate-100 pt-4">
                    <button 
                      onClick={() => {
                        localStorage.clear();
                        window.location.reload();
                      }}
                      className="text-xs font-mono text-center text-red-500 hover:text-red-700 w-full font-bold pt-2 cursor-pointer block underline"
                    >
                      Restaurar os Dados Iniciais de Fábrica (Reset)
                    </button>
                  </div>
                </section>

              </div>

            </div>
          )}

        </div>

        {/* Outer Minimal Footer */}
        <footer className="h-10 bg-slate-50 border-t border-slate-200 px-6 flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <span>Promissão Concursos LTDA © 2026</span>
          <span className="hidden sm:inline">Servidor Central: port 3000 • nginx proxy • VUNESP ACE Sênior</span>
        </footer>

      </div>

      {/* Bottom Navigation Bar for Mobile Panel */}
      <div id="mobile-nav" className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 px-2 py-2 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] flex justify-between items-center text-center">
        <button 
          onClick={() => { setActiveTab('dashboard'); setIsMoreDrawerOpen(false); }}
          className={`flex-1 flex flex-col items-center justify-center py-1 gap-1 transition-all ${
            activeTab === 'dashboard' ? 'text-[#002B5B] scale-105' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <span className="text-xl">📊</span>
          <span className="text-[10px] font-bold">Início</span>
        </button>

        <button 
          onClick={() => { setActiveTab('questions'); setIsMoreDrawerOpen(false); }}
          className={`flex-1 flex flex-col items-center justify-center py-1 gap-1 transition-all ${
            activeTab === 'questions' ? 'text-[#002B5B] scale-105' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <span className="text-xl">📝</span>
          <span className="text-[10px] font-bold">Banco</span>
        </button>

        <button 
          onClick={() => { setActiveTab('tutor'); setIsMoreDrawerOpen(false); }}
          className={`flex-1 flex flex-col items-center justify-center py-1 gap-1 transition-all relative ${
            activeTab === 'tutor' ? 'text-[#002B5B] scale-105' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <span className="text-xl relative">🤖
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#C5A059] animate-ping" />
          </span>
          <span className="text-[10px] font-bold flex items-center justify-center gap-0.5">Tutor IA</span>
        </button>

        <button 
          onClick={() => { setActiveTab('flashcards'); setIsMoreDrawerOpen(false); }}
          className={`flex-1 flex flex-col items-center justify-center py-1 gap-1 transition-all ${
            activeTab === 'flashcards' ? 'text-[#002B5B] scale-105' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <span className="text-xl">⚡</span>
          <span className="text-[10px] font-bold">Revisar</span>
        </button>

        <button 
          onClick={() => setIsMoreDrawerOpen(!isMoreDrawerOpen)}
          className={`flex-1 flex flex-col items-center justify-center py-1 gap-1 transition-all ${
            isMoreDrawerOpen ? 'text-[#C5A059] scale-105' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <span className={`text-xl transition-transform duration-300 ${isMoreDrawerOpen ? 'rotate-45' : ''}`}>➕</span>
          <span className="text-[10px] font-bold">Mais</span>
        </button>
      </div>

      {/* Mobile "More" Drawer Overlay Sheet */}
      {isMoreDrawerOpen && (
        <div id="more-drawer-backdrop" className="md:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 transition-opacity duration-300" onClick={() => setIsMoreDrawerOpen(false)}>
          <div 
            id="more-drawer-panel"
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[32px] p-6 shadow-[0_-10px_32px_rgba(0,0,0,0.15)] pb-12 border-t border-slate-100 transition-transform duration-300 transform translate-y-0"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Soft drag handle ornament */}
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-5" />

            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="text-[#002B5B] font-bold text-sm">Outras Áreas do Edital</h3>
                <p className="text-[11px] text-slate-400">Estude materiais localizados de Promissão/SP</p>
              </div>
              <button 
                onClick={() => setIsMoreDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-250 transition-colors"
              >
                ✖
              </button>
            </div>

            {/* Quick Stats Capsule */}
            <div className="bg-[#002B5B]/5 border border-[#002B5B]/10 rounded-2xl p-3 flex items-center justify-between gap-2 mb-5">
              <div>
                <p className="text-[9px] uppercase font-bold text-[#002B5B]">Seu Desempenho Ativo</p>
                <p className="text-xs text-slate-650 font-bold mt-0.5">Nível {stats.level} • {stats.dailyStreak} dias seguidos</p>
              </div>
              <span className="bg-[#C5A059] text-white text-[10px] font-mono px-2 py-0.5 rounded font-bold">+{stats.xp} XP</span>
            </div>

            {/* Grid menu mapping */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <button 
                onClick={() => { 
                  setActiveTab('arena'); 
                  setIsMoreDrawerOpen(false); 
                  if (playerHp <= 0 || !combatQuestion) { 
                    handleStartNewBattle(); 
                  } 
                }}
                className={`p-3.5 rounded-2xl border col-span-2 flex items-center justify-center text-center gap-3 transition-all ${
                  activeTab === 'arena' ? 'bg-[#C5A059] text-white font-bold' : 'bg-slate-900 text-[#C5A059] border-[#C5A059]'
                }`}
              >
                <span className="text-xl">⚔️</span>
                <span className="text-xs font-bold uppercase tracking-wider">Combate RPG (Arena)</span>
                <span className="bg-red-650 bg-red-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded animate-pulse">RPG ACTV</span>
              </button>

              <button 
                onClick={() => { setActiveTab('simulados'); setIsMoreDrawerOpen(false); }}
                className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center text-center gap-2 transition-all ${
                  activeTab === 'simulados' ? 'bg-[#002B5B]/10 border-[#002B5B] text-[#002B5B]' : 'bg-slate-50 border-slate-150 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <span className="text-2xl">📑</span>
                <span className="text-[10px] font-bold leading-tight">Simuladores VUNESP</span>
              </button>

              <button 
                onClick={() => { setActiveTab('promissao'); setIsMoreDrawerOpen(false); }}
                className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center text-center gap-2 transition-all ${
                  activeTab === 'promissao' ? 'bg-[#002B5B]/10 border-[#002B5B] text-[#002B5B]' : 'bg-slate-50 border-slate-150 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <span className="text-2xl">📍</span>
                <span className="text-[10px] font-bold leading-tight">Área Promissão/SP</span>
              </button>

              <button 
                onClick={() => { setActiveTab('materials'); setIsMoreDrawerOpen(false); }}
                className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center text-center gap-2 transition-all ${
                  activeTab === 'materials' ? 'bg-[#002B5B]/10 border-[#002B5B] text-[#002B5B]' : 'bg-slate-50 border-slate-150 hover:bg-slate-100 text-slate-705 text-slate-700'
                }`}
              >
                <span className="text-2xl">📚</span>
                <span className="text-[10px] font-bold leading-tight">Aulas & PDFs</span>
              </button>

              <button 
                onClick={() => { setActiveTab('comunidade'); setIsMoreDrawerOpen(false); }}
                className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center text-center gap-2 transition-all ${
                  activeTab === 'comunidade' ? 'bg-[#002B5B]/10 border-[#002B5B] text-[#002B5B]' : 'bg-slate-50 border-slate-150 hover:bg-slate-100 text-slate-705 text-slate-700'
                }`}
              >
                <span className="text-2xl">💬</span>
                <span className="text-[10px] font-bold leading-tight">Mural de Estudos</span>
              </button>

              <button 
                onClick={() => { setActiveTab('admin'); setIsMoreDrawerOpen(false); }}
                className={`p-3.5 rounded-2xl border col-span-2 flex flex-col items-center justify-center text-center gap-2 transition-all ${
                  activeTab === 'admin' ? 'bg-[#002B5B]/10 border-[#002B5B] text-[#002B5B]' : 'bg-slate-50 border-slate-150 hover:bg-slate-100 text-slate-705 text-slate-700'
                }`}
              >
                <span className="text-2xl">⚙️</span>
                <span className="text-[10px] font-bold leading-tight">Configurar Banco de Dados</span>
              </button>
            </div>

            {/* Target Role drop-down directly inside "Mais" menu for phone customization */}
            <div className="border-t border-slate-150 pt-4 space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-2 font-mono">Alterar Cargo Alvo:</label>
                <select 
                  value={selectedRole}
                  onChange={(e) => {
                    setSelectedRole(e.target.value as any);
                    showToast(`Cargo alterado para ${e.target.value}!`, 'info');
                  }}
                  className="w-full bg-slate-100 text-slate-800 text-xs rounded-xl px-3 py-2.5 border border-slate-250 focus:outline-none"
                >
                  <option value="Agente de Combate às Endemias">ACS / Combate às Endemias (ACE)</option>
                  <option value="Agente Comunitário de Saúde">Agente Comunitário de Saúde (ACS)</option>
                  <option value="Vigilante Sanitário">Vigilante Sanitário Municipal</option>
                </select>
              </div>

              {/* PWA Cache Buster Button */}
              <button 
                type="button"
                onClick={handleForceUpdateApp}
                className="w-full bg-red-600 text-white p-3 rounded-xl text-[11px] font-bold hover:bg-red-700 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
              >
                🔄 Limpar Cache & Forçar Atualização do App
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
