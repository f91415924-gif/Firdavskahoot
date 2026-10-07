import React, { useEffect, useState } from 'react';
import { Clock, Users, Zap, FastForward } from 'lucide-react';
import { QuestionClientPayload } from '../../types/quiz';
import { TRANSLATIONS, Language } from '../../i18n/translations';
import { sound } from '../../services/sound';

interface HostQuestionProps {
  lang: Language;
  question: QuestionClientPayload;
  answersCount: number;
  totalPlayers: number;
  onSkipQuestion?: () => void;
}

const OPTION_STYLES = [
  {
    bg: 'from-red-600 to-rose-700 border-red-500/80 shadow-red-900/30',
    shape: '▲',
    label: 'Qizil Uchburchak',
  },
  {
    bg: 'from-blue-600 to-indigo-700 border-blue-500/80 shadow-blue-900/30',
    shape: '◆',
    label: "Ko'k Romb",
  },
  {
    bg: 'from-amber-500 to-yellow-600 border-amber-400/80 shadow-amber-900/30 text-slate-950',
    shape: '●',
    label: 'Sariq Doira',
  },
  {
    bg: 'from-emerald-600 to-teal-700 border-emerald-500/80 shadow-emerald-900/30',
    shape: '■',
    label: 'Yashil Kvadrat',
  },
];

export const HostQuestion: React.FC<HostQuestionProps> = ({
  lang,
  question,
  answersCount,
  totalPlayers,
  onSkipQuestion,
}) => {
  const t = TRANSLATIONS[lang];
  const [timeLeft, setTimeLeft] = useState<number>(question.timeLimit);

  useEffect(() => {
    // Sync countdown based on start time
    const interval = setInterval(() => {
      const elapsed = (Date.now() - question.startTime) / 1000;
      const rem = Math.max(0, question.timeLimit - elapsed);
      setTimeLeft(rem);

      if (rem <= 5 && rem > 0) {
        sound.playTick();
      }
    }, 200);

    return () => clearInterval(interval);
  }, [question]);

  const percentage = Math.max(0, Math.min(100, (timeLeft / question.timeLimit) * 100));

  return (
    <div className="min-h-[calc(100vh-65px)] flex flex-col justify-between p-4 sm:p-8 max-w-7xl mx-auto w-full">
      {/* Top Bar: Question Index, Multiplier, and Answer Progress */}
      <div className="flex items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl px-5 py-3">
        {/* Left: Question Index */}
        <div className="flex items-center gap-3">
          <span className="text-xs uppercase font-extrabold tracking-wider px-3 py-1 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            {t.question} {question.questionIndex + 1} {t.of} {question.totalQuestions}
          </span>
          {question.pointsMultiplier === 'double' && (
            <span className="flex items-center gap-1 text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
              <Zap className="w-3.5 h-3.5 fill-current" />
              {t.doublePointsBadge}
            </span>
          )}
        </div>

        {/* Right: Answered status */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
            <Users className="w-4 h-4 text-indigo-400" />
            <span>
              {answersCount} / {totalPlayers} {t.answersSubmitted}
            </span>
          </div>

          {onSkipQuestion && (
            <button
              onClick={() => {
                sound.playTap();
                onSkipQuestion();
              }}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
              title="Vaqtni tugatish"
            >
              <FastForward className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Question Showcase */}
      <div className="my-auto py-8 flex flex-col items-center text-center">
        {/* Countdown Ring / Timer */}
        <div className="relative mb-6">
          <div
            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center font-black text-2xl sm:text-3xl border-4 transition-all duration-300 ${
              timeLeft <= 5
                ? 'border-rose-500 text-rose-400 bg-rose-950/40 animate-bounce'
                : timeLeft <= 10
                ? 'border-amber-500 text-amber-300 bg-amber-950/40'
                : 'border-indigo-500 text-indigo-200 bg-indigo-950/40'
            }`}
          >
            {Math.ceil(timeLeft)}
          </div>
        </div>

        {/* Giant Question Text */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white leading-tight max-w-4xl tracking-tight px-4 drop-shadow-md">
          {question.text}
        </h1>
      </div>

      {/* 4 Colored Options Grid (Kahoot layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full">
        {question.options.map((optionText, idx) => {
          const style = OPTION_STYLES[idx] || OPTION_STYLES[0];
          return (
            <div
              key={idx}
              className={`p-4 sm:p-6 rounded-2xl bg-gradient-to-r ${style.bg} border-2 shadow-xl flex items-center gap-4 transition transform hover:scale-[1.01]`}
            >
              {/* Geometric Shape Icon */}
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-black/20 backdrop-blur-sm flex items-center justify-center font-black text-xl sm:text-2xl shrink-0">
                {style.shape}
              </div>

              {/* Option Text */}
              <span className="font-extrabold text-base sm:text-xl text-white break-words line-clamp-3">
                {optionText}
              </span>
            </div>
          );
        })}
      </div>

      {/* Subtle timer progress bar at the very bottom */}
      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-6">
        <div
          className={`h-full transition-all duration-200 ease-linear ${
            timeLeft <= 5 ? 'bg-rose-500' : timeLeft <= 10 ? 'bg-amber-500' : 'bg-indigo-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
