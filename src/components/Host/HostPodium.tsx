import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Medal, Download, RotateCcw, Award, Users, CheckCircle, Clock } from 'lucide-react';
import { LeaderboardEntry } from '../../types/quiz';
import { TRANSLATIONS, Language } from '../../i18n/translations';
import { sound } from '../../services/sound';

interface HostPodiumProps {
  lang: Language;
  podium: LeaderboardEntry[];
  allRankings: LeaderboardEntry[];
  quizTitle: string;
  onPlayAgain: () => void;
}

export const HostPodium: React.FC<HostPodiumProps> = ({
  lang,
  podium,
  allRankings,
  quizTitle,
  onPlayAgain,
}) => {
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    sound.playPodium();

    // Confetti celebration sequence
    const duration = 4000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'],
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  const first = podium.find((p) => p.rank === 1);
  const second = podium.find((p) => p.rank === 2);
  const third = podium.find((p) => p.rank === 3);

  const handleDownloadCsv = () => {
    sound.playTap();
    const headers = [
      lang === 'uz' ? 'O\'rin' : 'Rank',
      lang === 'uz' ? 'Ism' : 'Nickname',
      lang === 'uz' ? 'Ball' : 'Score',
      lang === 'uz' ? 'To\'g\'ri javoblar' : 'Correct Answers',
      lang === 'uz' ? 'Umumiy vaqt (sekund)' : 'Total Time (sec)',
    ];

    const rows = allRankings.map((p) => [
      p.rank,
      `"${p.nickname.replace(/"/g, '""')}"`,
      p.score,
      p.correctCount,
      p.totalResponseTime,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `QuizArena_Results_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-[calc(100vh-65px)] flex flex-col justify-between p-4 sm:p-8 max-w-7xl mx-auto w-full">
      {/* Title */}
      <div className="text-center my-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-extrabold uppercase tracking-widest border border-amber-500/30 mb-2">
          <Trophy className="w-3.5 h-3.5" />
          <span>{t.gameFinished}</span>
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          {t.podiumTitle}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">{quizTitle}</p>
      </div>

      {/* 3-Tier Podium */}
      <div className="my-8 flex items-end justify-center gap-3 sm:gap-6 max-w-3xl mx-auto w-full px-2">
        {/* 2nd Place (Left, Silver) */}
        <div className="flex-1 flex flex-col items-center">
          {second ? (
            <div className="flex flex-col items-center mb-3 animate-fade-in">
              <div
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center font-black text-lg sm:text-xl text-white shadow-xl ring-4 ring-slate-400"
                style={{ backgroundColor: second.avatarColor }}
              >
                {second.nickname.substring(0, 1).toUpperCase()}
              </div>
              <span className="font-extrabold text-sm sm:text-base text-slate-200 mt-2 truncate max-w-[100px] sm:max-w-[140px] text-center">
                {second.nickname}
              </span>
              <span className="font-mono font-bold text-xs sm:text-sm text-slate-400">
                {second.score.toLocaleString()} {lang === 'uz' ? 'ball' : 'pts'}
              </span>
            </div>
          ) : (
            <div className="h-20" />
          )}

          <div className="w-full h-32 sm:h-44 rounded-t-3xl bg-gradient-to-t from-slate-800 to-slate-700 border-t-4 border-slate-400 flex flex-col items-center justify-center shadow-2xl relative">
            <Medal className="w-8 h-8 text-slate-300 mb-1" />
            <span className="text-2xl sm:text-4xl font-black text-slate-200 font-mono">2</span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-300">
              {t.secondPlace}
            </span>
          </div>
        </div>

        {/* 1st Place (Center, Gold - Tallest) */}
        <div className="flex-1 flex flex-col items-center">
          {first ? (
            <div className="flex flex-col items-center mb-3">
              <div className="relative">
                <div
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center font-black text-2xl sm:text-3xl text-white shadow-2xl ring-4 ring-amber-400 animate-pulse"
                  style={{ backgroundColor: first.avatarColor }}
                >
                  {first.nickname.substring(0, 1).toUpperCase()}
                </div>
                <div className="absolute -top-3 -right-2 bg-amber-400 text-slate-950 p-1 rounded-full shadow-lg">
                  <Award className="w-4 h-4" />
                </div>
              </div>
              <span className="font-extrabold text-base sm:text-lg text-amber-300 mt-2 truncate max-w-[120px] sm:max-w-[180px] text-center">
                {first.nickname}
              </span>
              <span className="font-mono font-black text-sm sm:text-base text-amber-400">
                {first.score.toLocaleString()} {lang === 'uz' ? 'ball' : 'pts'}
              </span>
            </div>
          ) : (
            <div className="h-24" />
          )}

          <div className="w-full h-44 sm:h-60 rounded-t-3xl bg-gradient-to-t from-amber-700/80 via-amber-600 to-amber-500 border-t-4 border-amber-300 flex flex-col items-center justify-center shadow-2xl relative">
            <Trophy className="w-10 h-10 text-amber-100 mb-1 animate-bounce" />
            <span className="text-3xl sm:text-5xl font-black text-white font-mono">1</span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-100">
              {t.firstPlace}
            </span>
          </div>
        </div>

        {/* 3rd Place (Right, Bronze) */}
        <div className="flex-1 flex flex-col items-center">
          {third ? (
            <div className="flex flex-col items-center mb-3">
              <div
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center font-black text-lg sm:text-xl text-white shadow-xl ring-4 ring-amber-700"
                style={{ backgroundColor: third.avatarColor }}
              >
                {third.nickname.substring(0, 1).toUpperCase()}
              </div>
              <span className="font-extrabold text-sm sm:text-base text-slate-200 mt-2 truncate max-w-[100px] sm:max-w-[140px] text-center">
                {third.nickname}
              </span>
              <span className="font-mono font-bold text-xs sm:text-sm text-slate-400">
                {third.score.toLocaleString()} {lang === 'uz' ? 'ball' : 'pts'}
              </span>
            </div>
          ) : (
            <div className="h-20" />
          )}

          <div className="w-full h-28 sm:h-36 rounded-t-3xl bg-gradient-to-t from-amber-950 via-amber-900 to-amber-800 border-t-4 border-amber-600 flex flex-col items-center justify-center shadow-2xl relative">
            <Medal className="w-8 h-8 text-amber-400 mb-1" />
            <span className="text-2xl sm:text-4xl font-black text-amber-200 font-mono">3</span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-300">
              {t.thirdPlace}
            </span>
          </div>
        </div>
      </div>

      {/* Full Leaderboard Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl mb-6 max-w-4xl mx-auto w-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <h3 className="font-extrabold text-white text-base">
              {t.fullLeaderboard} ({allRankings.length})
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 italic">
            {lang === 'uz' ? "*Bir xil ballarda tezroq javob bergan ustun keladi" : "*Lower response time breaks ties"}
          </span>
        </div>

        <div className="overflow-x-auto max-h-60 overflow-y-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800 bg-slate-950/40 sticky top-0">
              <tr>
                <th className="py-2.5 px-3">{t.rank}</th>
                <th className="py-2.5 px-3">{t.player}</th>
                <th className="py-2.5 px-3">{t.score}</th>
                <th className="py-2.5 px-3">{t.accuracy}</th>
                <th className="py-2.5 px-3">{t.avgTime}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {allRankings.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-2.5 px-3 font-bold">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-black ${
                        p.rank === 1
                          ? 'bg-amber-400 text-slate-950'
                          : p.rank === 2
                          ? 'bg-slate-300 text-slate-950'
                          : p.rank === 3
                          ? 'bg-amber-700 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {p.rank}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                        style={{ backgroundColor: p.avatarColor }}
                      >
                        {p.nickname.substring(0, 1).toUpperCase()}
                      </div>
                      <span className="font-bold text-slate-200">{p.nickname}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-indigo-300">
                    {p.score.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-slate-300">
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                      <CheckCircle className="w-3.5 h-3.5" />
                      {p.correctCount}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 font-mono">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {p.totalResponseTime}s
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={handleDownloadCsv}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 transition cursor-pointer"
        >
          <Download className="w-4 h-4 text-indigo-400" />
          <span>{t.downloadCsv}</span>
        </button>

        <button
          onClick={() => {
            sound.playTap();
            onPlayAgain();
          }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold text-sm shadow-lg shadow-emerald-500/20 transition cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{t.playAgain}</span>
        </button>
      </div>
    </div>
  );
};
