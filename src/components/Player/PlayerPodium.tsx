import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Medal, Award, RotateCcw, CheckCircle2, Star } from 'lucide-react';
import { FinalResultsPayload } from '../../types/quiz';
import { TRANSLATIONS, Language } from '../../i18n/translations';
import { sound } from '../../services/sound';

interface PlayerPodiumProps {
  lang: Language;
  finalResults: FinalResultsPayload;
  nickname: string;
  avatarColor: string;
  onPlayAgain: () => void;
}

export const PlayerPodium: React.FC<PlayerPodiumProps> = ({
  lang,
  finalResults,
  nickname,
  avatarColor,
  onPlayAgain,
}) => {
  const t = TRANSLATIONS[lang];
  const myResult = finalResults.playerFinalResult;
  const rank = myResult?.rank || 1;
  const isTop3 = rank <= 3;

  useEffect(() => {
    if (isTop3) {
      sound.playPodium();
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [isTop3]);

  return (
    <div className="min-h-[calc(100vh-65px)] flex flex-col justify-center items-center p-4 max-w-md mx-auto w-full text-center">
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl w-full relative overflow-hidden">
        {/* Top Medal Icon */}
        <div className="mb-4 flex justify-center">
          {rank === 1 ? (
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 p-1 shadow-2xl animate-bounce">
              <div className="w-full h-full rounded-full bg-slate-950 flex flex-col items-center justify-center text-amber-400">
                <Trophy className="w-10 h-10 fill-current" />
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 mt-0.5">
                  1-O'RIN
                </span>
              </div>
            </div>
          ) : rank === 2 ? (
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-slate-400 to-slate-200 p-1 shadow-2xl">
              <div className="w-full h-full rounded-full bg-slate-950 flex flex-col items-center justify-center text-slate-300">
                <Medal className="w-10 h-10" />
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-300 mt-0.5">
                  2-O'RIN
                </span>
              </div>
            </div>
          ) : rank === 3 ? (
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-700 to-amber-500 p-1 shadow-2xl">
              <div className="w-full h-full rounded-full bg-slate-950 flex flex-col items-center justify-center text-amber-500">
                <Medal className="w-10 h-10" />
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-500 mt-0.5">
                  3-O'RIN
                </span>
              </div>
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-slate-400">
              <Award className="w-10 h-10 text-indigo-400" />
            </div>
          )}
        </div>

        {/* Motivational Greeting */}
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-1">
          {rank === 1
            ? t.topMedalGold
            : rank === 2
            ? t.topMedalSilver
            : rank === 3
            ? t.topMedalBronze
            : t.greatEffort}
        </h2>

        {/* Player Name */}
        <div className="text-sm font-bold text-slate-400 mb-5">
          {nickname}
        </div>

        {/* Detailed result description */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 mb-6 space-y-3">
          <p className="text-sm text-slate-200 font-semibold">
            {t.youFinishedRank
              .replace('{rank}', String(rank))
              .replace('{total}', String(myResult?.totalPlayers || 1))}
          </p>

          <div className="flex items-center justify-center gap-6 pt-2 border-t border-slate-800/80">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                {t.score}
              </span>
              <span className="font-mono font-black text-xl text-indigo-300">
                {myResult?.totalScore.toLocaleString() || '0'}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                {t.accuracy}
              </span>
              <span className="inline-flex items-center gap-1 font-bold text-base text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                {myResult?.correctCount || 0} / {myResult?.totalQuestions || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Play Again Button */}
        <button
          onClick={() => {
            sound.playTap();
            onPlayAgain();
          }}
          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-500/25 transition cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{t.playAgain}</span>
        </button>
      </div>
    </div>
  );
};
