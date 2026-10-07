import React, { useEffect } from 'react';
import { CheckCircle2, XCircle, Clock, Flame, Trophy, Award } from 'lucide-react';
import { RevealPayload } from '../../types/quiz';
import { TRANSLATIONS, Language } from '../../i18n/translations';
import { sound } from '../../services/sound';

interface PlayerRevealProps {
  lang: Language;
  revealData: RevealPayload;
}

export const PlayerReveal: React.FC<PlayerRevealProps> = ({
  lang,
  revealData,
}) => {
  const t = TRANSLATIONS[lang];
  const res = revealData.playerResult;

  useEffect(() => {
    if (res?.isCorrect) {
      sound.playCorrect();
    } else {
      sound.playWrong();
    }
  }, [res?.isCorrect]);

  const isTimeout = res ? res.selectedOption === -1 : true;
  const isCorrect = res ? res.isCorrect : false;

  return (
    <div className="min-h-[calc(100vh-65px)] flex flex-col justify-center items-center p-4 max-w-md mx-auto w-full text-center">
      <div
        className={`w-full rounded-3xl p-6 sm:p-8 border-2 shadow-2xl relative overflow-hidden transition-all ${
          isCorrect
            ? 'bg-gradient-to-b from-emerald-950/90 via-slate-900 to-slate-950 border-emerald-500/80 shadow-emerald-950/50'
            : isTimeout
            ? 'bg-gradient-to-b from-amber-950/90 via-slate-900 to-slate-950 border-amber-500/80 shadow-amber-950/50'
            : 'bg-gradient-to-b from-rose-950/90 via-slate-900 to-slate-950 border-rose-500/80 shadow-rose-950/50'
        }`}
      >
        {/* Status Icon */}
        <div className="mb-4 flex justify-center">
          {isCorrect ? (
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center shadow-lg animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
          ) : isTimeout ? (
            <div className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-400 text-amber-400 flex items-center justify-center shadow-lg">
              <Clock className="w-10 h-10" />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full bg-rose-500/20 border-2 border-rose-400 text-rose-400 flex items-center justify-center shadow-lg">
              <XCircle className="w-10 h-10" />
            </div>
          )}
        </div>

        {/* Big Status Title */}
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
          {isCorrect ? t.correctAnswer : isTimeout ? t.timeoutAnswer : t.wrongAnswer}
        </h2>

        {/* Points earned */}
        <div className="my-4">
          <div
            className={`text-3xl sm:text-4xl font-black font-mono tracking-tight ${
              isCorrect ? 'text-emerald-400' : 'text-slate-500'
            }`}
          >
            {isCorrect ? `+${res?.pointsEarned.toLocaleString()}` : '+0'}{' '}
            <span className="text-sm uppercase font-sans font-bold text-slate-300">
              {t.pointsEarned}
            </span>
          </div>

          {/* Streak indicator */}
          {res && res.streak >= 2 && (
            <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-extrabold border border-amber-500/30 animate-pulse">
              <Flame className="w-4 h-4 fill-current text-rose-500" />
              <span>
                {res.streak} {lang === 'uz' ? 'ta to\'g\'ri seriya!' : 'streak!'}
              </span>
            </div>
          )}
        </div>

        {/* Total Score & Rank Card */}
        <div className="mt-6 pt-5 border-t border-slate-800 grid grid-cols-2 gap-3 bg-slate-950/40 p-4 rounded-2xl">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block mb-0.5">
              {t.currentRank}
            </span>
            <div className="flex items-center justify-center gap-1 font-black text-lg text-white">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>
                {res?.rank || 1}-o'rin
              </span>
            </div>
            <span className="text-[10px] text-slate-500">
              {res?.totalPlayers || 1} {t.outOfPlayers}
            </span>
          </div>

          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block mb-0.5">
              {t.currentScore}
            </span>
            <div className="font-mono font-black text-lg text-indigo-300">
              {res?.totalScore.toLocaleString() || '0'}
            </div>
            <span className="text-[10px] text-slate-500">
              {lang === 'uz' ? "ball to'plandi" : "points"}
            </span>
          </div>
        </div>

        {/* Tip for next question */}
        <div className="mt-5 text-xs text-slate-400 font-medium">
          {lang === 'uz' ? "Boshlovchi keyingi savolga o'tishini kuting..." : "Waiting for host to proceed..."}
        </div>
      </div>
    </div>
  );
};
