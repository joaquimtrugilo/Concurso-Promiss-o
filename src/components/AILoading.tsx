/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Sparkles, Brain, GraduationCap } from 'lucide-react';

interface AILoadingProps {
  title?: string;
}

const MOTIVATIONAL_CHASSIS = [
  "Analisando o edital da VUNESP adaptado para Promissão...",
  "Sincronizando com as bases do SUS e Diretrizes de Endemias 2026...",
  "Consultando as seções da Lei Orgânica de Promissão/SP...",
  "Lendo biografias e marcos históricos (Colônia Aliança e bacia Tietê)...",
  "O Tutor IA está formulando alternativas robustas para o seu nível...",
  "Calculando probabilidade de aprovação e refinando mnemônicos...",
  "Construindo relatórios de fraquezas focado na sua aprovação rápida..."
];

export default function AILoading({ title = "Conectando ao Cérebro IA de Aprovação..." }: AILoadingProps) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % MOTIVATIONAL_CHASSIS.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div id="ai-loading" className="flex flex-col items-center justify-center p-12 bg-slate-900/60 border border-slate-750 rounded-2xl backdrop-blur-md max-w-lg mx-auto text-center">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-amber-400/20 blur-xl rounded-full animate-pulse" />
        <div className="relative flex items-center justify-center w-16 h-16 bg-slate-800 border-2 border-amber-400 rounded-full animate-bounce">
          <Brain className="w-8 h-8 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
        </div>
        <Sparkles className="absolute -top-1 -right-1 w-6 h-6 text-yellow-400 animate-pulse" />
        <GraduationCap className="absolute -bottom-2 -left-2 w-6 h-6 text-indigo-400" />
      </div>

      <h3 className="text-lg font-sans font-semibold text-white tracking-wide mb-2">{title}</h3>
      <p className="text-xs font-mono text-amber-400/90 h-8 transition-all duration-500 ease-in-out">
        {MOTIVATIONAL_CHASSIS[messageIndex]}
      </p>

      <div className="w-full bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden max-w-xs mx-auto">
        <div className="bg-gradient-to-r from-amber-400 to-yellow-500 h-full rounded-full animate-pulse" style={{ width: '85%' }} />
      </div>
    </div>
  );
}
