import React, { useEffect } from 'react';
import { CheckCircle2, Trophy, ArrowRight, Flame, BarChart3 } from 'lucide-react';
import { QuestionClientPayload, RevealPayload } from '../../types/quiz';
import { TRANSLATIONS, Language } from '../../i18n/translations';
import { sound } from '../../services/sound';

interface HostRevealProps {
  lang: Language;
  question: QuestionClientPayload;
  revealData: RevealPayload;
  onNextQuestion: () => void;
  isLastQuestion: boolean;
}

const OPTION_STYLES = [
  {
    bg: 'bg-red-500',
    border: 'border-red-500',
    shape: '▲',
    name: 'Red',
  },
  {
    bg: 'bg-blue-500',
    border: 'border-blue-500',
    shape: '◆',
    name: 'Blue',
  },
  {
    bg: 'bg-amber-500',
    border: 'border-amber-500',
    shape: '●',
    name: 'Yellow',
  },
  {
    bg: 'bg-emerald-500',
    border: 'border-emerald-500',
    shape: '■',
    name: 'Green',
  },
];

export const HostReveal: React.FC<HostRevealProps> = ({
  lang,
  question,
  revealData,
  onNextQuestion,
  isLastQuestion,
}) => {
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    sound.playCorrect();
  }, []);

  const totalAnswered = revealData.totalAnswered || 1;

  return (
    <div className="min-h-[calc(100vh-65px)] flex flex-col justify-between p-4 sm:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl px-5 py-3">
        <span className="text-xs uppercase font-extrabold tracking-wider px-3 py-1 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
          {t.question} {question.questionIndex + 1} {t.of} {question.totalQuestions}
        </span>
        <button
          onClick={() => {
            sound.playTap();
            onNextQuestion();
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white font-extrabold text-sm shadow-lg shadow-indigo-500/25 transition cursor-pointer"
        >
          <span>{isLastQuestion ? t.showResults : t.nextQuestion}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Main Container: Split Grid (Left: Answer Stats & Correct Answer; Right: Top 5 Leaderboard) */}
      <div className="my-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start flex-1">
        {/* Left 7 cols: Question & Distribution Chart */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
              {lang === 'uz' ? "Berilgan savol:" : "Question:"}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white leading-snug mb-6">
              {question.text}
            </h2>

            {/* Answer Distribution Bars */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-2">
                <BarChart3 className="w-4 h-4 text-indigo-400" />
                <span>{lang === 'uz' ? "Javoblar taqsimoti:" : "Answer Distribution:"}</span>
              </div>

              {question.options.map((optText, idx) => {
                const isCorrect = idx === revealData.correctOptionIndex;
                const count = revealData.optionCounts[idx] || 0;
                const percentage = totalAnswered > 0 ? Math.round((count / totalAnswered) * 100) : 0;
                const style = OPTION_STYLES[idx] || OPTION_STYLES[0];

                return (
                  <div
                    key={idx}
                    className={`relative p-3.5 rounded-2xl border-2 transition overflow-hidden ${
                      isCorrect
                        ? 'bg-emerald-950/40 border-emerald-500 shadow-lg shadow-emerald-950/50'
                        : 'bg-slate-950/50 border-slate-800 opacity-70'
                    }`}
                  >
                    {/* Background fill based on percentage */}
                    <div
                      className={`absolute inset-y-0 left-0 opacity-20 ${style.bg} transition-all duration-700 ease-out`}
                      style={{ width: `${percentage}%` }}
                    />

                    <div className="relative flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs text-white ${style.bg}`}
                        >
                          {style.shape}
                        </div>
                        <span className={`text-sm font-bold ${isCorrect ? 'text-white' : 'text-slate-300'}`}>
                          {optText}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isCorrect && (
                          <span className="inline-flex items-center gap-1 text-xs font-extrabold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-lg border border-emerald-500/30">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{t.correctAnswer}</span>
                          </span>
                        )}
                        <span className="text-xs font-extrabold text-slate-200">
                          {count} ({percentage}%)
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 5 cols: Mini Leaderboard (Top 5) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <h3 className="font-extrabold text-white text-base">
                {t.topPlayers}
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-semibold">
              {lang === 'uz' ? "Joriy ballar" : "Scores"}
            </span>
          </div>

          <div className="space-y-2.5">
            {revealData.leaderboard.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                {lang === 'uz' ? "Hech kim javob bermadi" : "No answers yet"}
              </div>
            ) : (
              revealData.leaderboard.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60 shadow-sm transition hover:border-slate-600"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs ${
                        player.rank === 1
                          ? 'bg-amber-400 text-slate-950 shadow-md'
                          : player.rank === 2
                          ? 'bg-slate-300 text-slate-950'
                          : player.rank === 3
                          ? 'bg-amber-700 text-white'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {player.rank}
                    </span>

                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                      style={{ backgroundColor: player.avatarColor }}
                    >
                      {player.nickname.substring(0, 1).toUpperCase()}
                    </div>

                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-100 max-w-[120px] sm:max-w-[150px] truncate">
                        {player.nickname}
                      </span>
                      {player.streak >= 2 && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-400">
                          <Flame className="w-3 h-3 fill-current text-rose-500" />
                          <span>{player.streak} {lang === 'uz' ? 'ketma-ket' : 'streak'}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="font-mono font-black text-sm text-indigo-300 bg-indigo-950/40 px-2.5 py-1 rounded-xl border border-indigo-800/50">
                    {player.score.toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
