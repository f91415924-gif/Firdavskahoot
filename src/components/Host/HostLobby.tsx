import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Play, Users, X, Copy, Check, Sparkles, Smartphone, ShieldAlert } from 'lucide-react';
import { PlayerSummary } from '../../types/quiz';
import { TRANSLATIONS, Language } from '../../i18n/translations';
import { sound } from '../../services/sound';

interface HostLobbyProps {
  lang: Language;
  pin: string;
  quizTitle: string;
  totalQuestions: number;
  players: PlayerSummary[];
  onStartGame: () => void;
  onKickPlayer: (playerId: string) => void;
}

export const HostLobby: React.FC<HostLobbyProps> = ({
  lang,
  pin,
  quizTitle,
  totalQuestions,
  players,
  onStartGame,
  onKickPlayer,
}) => {
  const t = TRANSLATIONS[lang];
  const [copied, setCopied] = useState(false);

  // Compute join URL
  const joinUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/?pin=${pin}`
    : `https://quizarena.live/?pin=${pin}`;

  const handleCopyLink = () => {
    sound.playTap();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(joinUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleKick = (playerId: string, nickname: string) => {
    sound.playTap();
    if (window.confirm(`${nickname} - ${t.kickConfirm}`)) {
      onKickPlayer(playerId);
    }
  };

  return (
    <div className="min-h-[calc(100vh-65px)] flex flex-col justify-between p-4 sm:p-8 max-w-7xl mx-auto w-full">
      {/* Top Banner */}
      <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left: Instructions & Join Link */}
        <div className="flex-1 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{quizTitle} ({totalQuestions} {lang === 'uz' ? 'ta savol' : 'questions'})</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {lang === 'uz' ? "O'yinchilar qo'shilishi kutilmoqda" : "Waiting for players to join..."}
          </h1>

          <div className="mt-2 text-xs sm:text-sm text-slate-400 flex flex-wrap items-center justify-center md:justify-start gap-2">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>
              {lang === 'uz' ? "Telefoningizdan ushbu manzilga kiring:" : "Join on your phone at:"}
            </span>
            <code className="bg-slate-950 px-2.5 py-1 rounded-lg text-indigo-300 font-mono font-bold text-xs border border-slate-800">
              {typeof window !== 'undefined' ? window.location.host : 'quizarena.app'}
            </code>
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white bg-slate-800 px-2 py-1 rounded-lg transition cursor-pointer"
              title="Copy join link"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? (lang === 'uz' ? 'Nusxalandi' : 'Copied') : (lang === 'uz' ? 'Havola' : 'Link')}</span>
            </button>
          </div>
        </div>

        {/* Center/Right: Giant PIN Card */}
        <div className="flex flex-col sm:flex-row items-center gap-5 bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-950 border-2 border-indigo-500/40 p-4 sm:p-5 rounded-3xl shadow-xl">
          {/* QR Code */}
          <div className="bg-white p-2.5 rounded-2xl shadow-inner flex flex-col items-center justify-center">
            <QRCodeSVG
              value={joinUrl}
              size={120}
              level="M"
              includeMargin={false}
            />
            <span className="text-[10px] text-slate-800 font-bold mt-1 tracking-wider uppercase">
              SCAN TO JOIN
            </span>
          </div>

          {/* Big PIN */}
          <div className="text-center sm:text-left">
            <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-400 block mb-1">
              {t.gamePin}
            </span>
            <div className="text-4xl sm:text-5xl font-black tracking-wider text-white font-mono bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-indigo-300 select-all">
              {pin}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              {lang === 'uz' ? "Yoki QR kodni skanerlang" : "Or scan with camera"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Center Area: Joined Players */}
      <div className="my-8 flex-1 flex flex-col">
        {/* Count Header */}
        <div className="flex items-center justify-between mb-4 px-2">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <span className="text-base font-extrabold text-white">
              {t.joinedPlayers}
            </span>
            <span className="ml-1 px-2.5 py-0.5 rounded-full bg-indigo-600/30 text-indigo-300 font-bold text-xs border border-indigo-500/30">
              {players.length}
            </span>
          </div>
          <span className="text-xs text-slate-400 italic hidden sm:block">
            {lang === 'uz' ? "O'yinchini chetlatish uchun ustiga bosing" : "Click a player to kick"}
          </span>
        </div>

        {/* Players Grid or Empty State */}
        {players.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 rounded-3xl border-2 border-dashed border-slate-800 bg-slate-900/40 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-500 mb-4 animate-pulse">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-200">
              {t.noPlayersYet}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mt-1">
              {lang === 'uz'
                ? "Ishtirokchilar o'z qurilmalaridan PIN kiritganda, ularning ismlari bu yerda paydo bo'ladi."
                : "As players enter the PIN on their phones, their names will show up here."}
            </p>
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 content-start">
            {players.map((p) => (
              <div
                key={p.id}
                className="group relative bg-slate-800/80 hover:bg-slate-750 border border-slate-700/80 hover:border-slate-600 rounded-2xl p-3 flex items-center gap-2.5 shadow-md transition-all duration-200 transform hover:-translate-y-0.5"
              >
                {/* Avatar circle */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center font-black text-white text-xs shrink-0 shadow-sm"
                  style={{ backgroundColor: p.avatarColor }}
                >
                  {p.nickname.substring(0, 1).toUpperCase()}
                </div>

                {/* Nickname */}
                <span className="font-bold text-sm text-slate-100 truncate flex-1">
                  {p.nickname}
                </span>

                {/* Kick Button */}
                <button
                  onClick={() => handleKick(p.id, p.nickname)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-full bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white transition shrink-0 cursor-pointer"
                  title={t.kickPlayerTooltip}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Floating Control Bar */}
      <div className="sticky bottom-4 w-full flex items-center justify-between p-4 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-800 shadow-2xl">
        <div className="text-xs text-slate-400 flex items-center gap-2">
          {players.length === 0 ? (
            <>
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>{t.waitingMinPlayers}</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-emerald-400 font-semibold">
                {players.length} {lang === 'uz' ? "ta o'yinchi tayyor!" : "players ready!"}
              </span>
            </>
          )}
        </div>

        <button
          onClick={() => {
            sound.playTap();
            onStartGame();
          }}
          disabled={players.length === 0}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-extrabold text-sm sm:text-base transition-all shadow-lg cursor-pointer ${
            players.length === 0
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white shadow-emerald-500/25 hover:scale-[1.02]'
          }`}
        >
          <Play className="w-5 h-5 fill-current" />
          <span>{t.startGame}</span>
        </button>
      </div>
    </div>
  );
};
