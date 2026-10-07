import React, { useState, useEffect } from 'react';
import { CheckCircle2, Clock, Zap, Loader2 } from 'lucide-react';
import { QuestionClientPayload } from '../../types/quiz';
import { TRANSLATIONS, Language } from '../../i18n/translations';
import { sound } from '../../services/sound';

interface PlayerQuestionProps {
  lang: Language;
  question: QuestionClientPayload;
  hasAnswered: boolean;
  selectedOptionIndex?: number;
  onSubmitAnswer: (optionIndex: number) => void;
}

const BUTTON_STYLES = [
  {
    bg: 'bg-red-500 hover:bg-red-600 active:bg-red-700 active:scale-[0.98] border-red-600 text-white shadow-red-900/30',
    selectedBg: 'bg-red-600 border-white ring-4 ring-red-400',
    shape: '▲',
    label: 'Qizil Uchburchak',
  },
  {
    bg: 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700 active:scale-[0.98] border-blue-600 text-white shadow-blue-900/30',
    selectedBg: 'bg-blue-600 border-white ring-4 ring-blue-400',
    shape: '◆',
    label: "Ko'k Romb",
  },
  {
    bg: 'bg-amber-400 hover:bg-amber-500 active:bg-amber-600 active:scale-[0.98] border-amber-500 text-slate-950 shadow-amber-900/30',
    selectedBg: 'bg-amber-400 border-white ring-4 ring-amber-300 text-slate-950',
    shape: '●',
    label: 'Sariq Doira',
  },
  {
    bg: 'bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 active:scale-[0.98] border-emerald-600 text-white shadow-emerald-900/30',
    selectedBg: 'bg-emerald-600 border-white ring-4 ring-emerald-400',
    shape: '■',
    label: 'Yashil Kvadrat',
  },
];

export const PlayerQuestion: React.FC<PlayerQuestionProps> = ({
  lang,
  question,
  hasAnswered,
  selectedOptionIndex,
  onSubmitAnswer,
}) => {
  const t = TRANSLATIONS[lang];
  const [localSubmittedIndex, setLocalSubmittedIndex] = useState<number | null>(
    selectedOptionIndex !== undefined ? selectedOptionIndex : null
  );
  const [timeLeft, setTimeLeft] = useState<number>(question.timeLimit);

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = (Date.now() - question.startTime) / 1000;
      const rem = Math.max(0, question.timeLimit - elapsed);
      setTimeLeft(rem);
    }, 200);

    return () => clearInterval(interval);
  }, [question]);

  const handleSelect = (idx: number) => {
    if (hasAnswered || localSubmittedIndex !== null) return;
    sound.playTap();
    setLocalSubmittedIndex(idx);
    onSubmitAnswer(idx);
  };

  const isLocked = hasAnswered || localSubmittedIndex !== null;
  const activeSelected = selectedOptionIndex !== undefined ? selectedOptionIndex : localSubmittedIndex;
  const percentage = Math.max(0, Math.min(100, (timeLeft / question.timeLimit) * 100));

  return (
    <div className="min-h-[calc(100vh-65px)] flex flex-col justify-between p-3 sm:p-5 max-w-xl mx-auto w-full">
      {/* Top Header: Question index, timer bar, points */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-slate-400">
            {t.question} {question.questionIndex + 1} {t.of} {question.totalQuestions}
          </span>

          <div className="flex items-center gap-2">
            {question.pointsMultiplier === 'double' && (
              <span className="flex items-center gap-1 text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Zap className="w-3 h-3 fill-current" />
                2x
              </span>
            )}
            <div className="flex items-center gap-1 font-mono font-bold text-sm text-indigo-300 bg-slate-900 px-2.5 py-0.5 rounded-lg border border-slate-800">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>{Math.ceil(timeLeft)}s</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-200 ease-linear ${
              timeLeft <= 5 ? 'bg-rose-500' : timeLeft <= 10 ? 'bg-amber-500' : 'bg-indigo-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Question Text prompt (useful for mobile players) */}
        <div className="pt-2 text-center">
          <h2 className="text-base sm:text-lg font-extrabold text-white line-clamp-3">
            {question.text}
          </h2>
        </div>
      </div>

      {/* Main Buttons or Submitted State */}
      <div className="my-auto py-4">
        {isLocked ? (
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center shadow-2xl flex flex-col items-center justify-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-black text-white mb-1">
              {t.answerSubmitted}
            </h3>

            <p className="text-xs text-slate-400 max-w-xs mb-5">
              {t.waitingOthers}
            </p>

            {/* Show which option they selected */}
            {activeSelected !== null && activeSelected >= 0 && (
              <div
                className={`w-full max-w-xs p-3 rounded-2xl flex items-center justify-center gap-3 font-extrabold text-sm border-2 ${
                  BUTTON_STYLES[activeSelected]?.bg || ''
                }`}
              >
                <span className="text-xl font-black">
                  {BUTTON_STYLES[activeSelected]?.shape}
                </span>
                <span className="truncate">
                  {question.options[activeSelected]}
                </span>
              </div>
            )}

            <div className="mt-6 flex items-center gap-2 text-xs text-slate-500">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>{lang === 'uz' ? "Vaqt tugashi kutilmoqda..." : "Waiting for timer..."}</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {question.options.map((optText, idx) => {
              const style = BUTTON_STYLES[idx] || BUTTON_STYLES[0];
              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  className={`min-h-[90px] sm:min-h-[110px] p-4 rounded-2xl border-2 flex items-center gap-4 transition shadow-lg text-left cursor-pointer select-none ${style.bg}`}
                >
                  <div className="w-10 h-10 rounded-xl bg-black/20 flex items-center justify-center font-black text-xl shrink-0">
                    {style.shape}
                  </div>
                  <span className="font-extrabold text-base sm:text-lg break-words line-clamp-2">
                    {optText}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="text-center text-[11px] text-slate-500 font-medium">
        {lang === 'uz' ? "Bir marta bosganingizdan so'ng o'zgartirib bo'lmaydi" : "Answers cannot be changed once submitted"}
      </div>
    </div>
  );
};
