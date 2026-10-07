import React from 'react';
import { Smartphone, Sparkles, Loader2, Trophy } from 'lucide-react';
import { TRANSLATIONS, Language } from '../../i18n/translations';

interface PlayerLobbyProps {
  lang: Language;
  nickname: string;
  avatarColor: string;
  pin: string;
  quizTitle?: string;
}

export const PlayerLobby: React.FC<PlayerLobbyProps> = ({
  lang,
  nickname,
  avatarColor,
  pin,
  quizTitle,
}) => {
  const t = TRANSLATIONS[lang];

  return (
    <div className="min-h-[calc(100vh-65px)] flex flex-col items-center justify-center p-4 max-w-md mx-auto w-full text-center">
      {/* Top Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl w-full flex flex-col items-center relative overflow-hidden">
        {/* Decorative background glow */}
        <div
          className="absolute -top-20 -left-20 w-44 h-44 rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ backgroundColor: avatarColor }}
        />

        {/* Animated Avatar */}
        <div className="relative mb-5">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-black text-white shadow-2xl ring-4 ring-slate-800/80 animate-pulse"
            style={{ backgroundColor: avatarColor }}
          >
            {nickname.substring(0, 1).toUpperCase()}
          </div>
          <div className="absolute -bottom-2 -right-1 bg-emerald-500 text-white p-1.5 rounded-full shadow-lg">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        <h1 className="text-2xl font-black text-white tracking-tight mb-1">
          {t.playerInLobbyTitle}
        </h1>

        <div className="text-base font-extrabold text-indigo-300 mb-4 bg-indigo-950/40 px-3.5 py-1 rounded-xl border border-indigo-800/40">
          {nickname}
        </div>

        <p className="text-sm text-slate-300 font-medium mb-6">
          {t.playerInLobbySubtitle}
        </p>

        {/* Loading Spinner */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 bg-slate-950/60 px-4 py-2.5 rounded-2xl border border-slate-800 w-full justify-center mb-6">
          <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
          <span>{lang === 'uz' ? "O'yin boshlanishi kutilmoqda..." : "Waiting for game start..."}</span>
        </div>

        {/* Instructions */}
        <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300 flex items-center gap-3 text-left w-full">
          <Smartphone className="w-5 h-5 text-indigo-400 shrink-0" />
          <span>{t.lookAtScreenTip}</span>
        </div>

        {/* Room PIN badge */}
        <div className="mt-5 text-[11px] font-mono text-slate-500 font-bold uppercase tracking-wider">
          PIN: {pin} {quizTitle ? `• ${quizTitle}` : ''}
        </div>
      </div>
    </div>
  );
};
