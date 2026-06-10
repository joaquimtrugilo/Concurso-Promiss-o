/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  category: string;
  difficulty: 'Fácil' | 'Médio' | 'Difícil';
  source: string;
  userAnswer?: number;
  isBookmarked?: boolean;
}

export interface MockExam {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  timeLimit: number; // in seconds
  type: 'Rápido' | 'Completo' | 'Personalizado';
  category: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  xpValue: number;
  category: 'studies' | 'streak' | 'accuracy' | 'special';
}

export interface UserStats {
  xp: number;
  level: number;
  dailyStreak: number;
  studiedHours: number;
  estimatedApproval: number; // 0 to 100 percentage
  rankingPosition: number;
  rankingTotal: number;
  questionsAnswered: number;
  questionsCorrect: number;
  lastStudyDate?: string;
}

export interface StudyScheduleItem {
  id: string;
  day: 'Segunda' | 'Terça' | 'Quarta' | 'Quinta' | 'Sexta' | 'Atividades' | 'Sábado' | 'Domingo';
  subject: string;
  topic: string;
  timeMinutes: number;
  completed: boolean;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  category: string;
  nextReviewDate: string;
  intervalDays: number; // spaced repetition interval
  easeFactor: number;
}

export interface ForumPost {
  id: string;
  authorName: string;
  authorRole: 'Candidato' | 'Moderador' | 'Aprovado' | 'Especialista';
  authorAvatar: string;
  title: string;
  content: string;
  likes: number;
  commentsCount: number;
  category: string;
  timestamp: string;
}

export interface LocalLawSummary {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  fullTextSummary: string;
  keyArticles: { article: string; text: string; note: string }[];
}

export interface VideoLesson {
  id: string;
  title: string;
  duration: string;
  instructor: string;
  category: string;
  videoUrl: string; // fallback mockup video player
  thumbnail: string;
  completed?: boolean;
}

export interface PdfMaterial {
  id: string;
  title: string;
  fileSize: string;
  pages: number;
  author: string;
  category: string;
  downloadCount: number;
}
