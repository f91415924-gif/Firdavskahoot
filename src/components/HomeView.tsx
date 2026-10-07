import React, { useState, useEffect } from 'react';
import { Camera, Play, Sparkles, AlertCircle, ArrowRight, BookOpen, Trophy, ShieldCheck, Zap } from 'lucide-react';
import { TRANSLATIONS, Language } from '../i18n/translations';
import { sound } from '../services/sound';

interface HomeViewProps {
  lang: Language;
  initialPin?: string;
  errorMessage?: string | null;
  onJoinGame: (pin: string, nickname: string) => void;
  onOpenQrScanner: () => void;
  onOpenQuizManager: () => void;
  onQuickHostSampleQuiz: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  lang,
  initialPin = '',
  errorMessage,
  onJoinGame,
  onOpenQrScanner,
  onOpenQuizManager,
  onQuickHostSampleQuiz,
}) => {
  const t = TRANSLATIONS[lang];
  const [pin, setPin] = useState(initialPin);
  const [nickname, setNickname] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (initialPin) {
      setPin(initialPin);
    }
  }, [initialPin]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanPin = pin.trim().replace(/\s+/g, '');
    const cleanNick = nickname.trim();

    if (!cleanPin || cleanPin.length !== 6 || !/^\d{6}$/.test(cleanPin)) {
      setFormError(t.errInvalidPin);
      sound.playWrong();
      return;
    }

    if (!cleanNick) {
      setFormError(t.errEmptyNickname);
      sound.playWrong();
      return;
    }

    sound.playTap();
    onJoinGame(cleanPin, cleanNick);
  };

  return (
    <div className="min-h-[calc(100vh-65px)] flex flex-col justify-center items-center p-4 sm:p-8 max-w-4xl mx-auto w-full">
      {/* Hero Badge */}
      <div className="text-center mb-6 max-w-xl">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold mb-3 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Kahoot uslubidagi real-vaqt viktorinasi</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          Quiz<span className="bg-gradient-to-r from-amber-400 via-rose-400 to-indigo-400 bg-clip-text text-transparent">Arena</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-400 mt-2">
          {t.tagline}
        </p>
      </div>

      {/* Main Join Card */}
      <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Global Error Banner */}
        {(errorMessage || formError) && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-start gap-2.5 animate-shake">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed font-semibold">
              {formError || errorMessage}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* PIN Input */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-1.5">
              {t.enterPin}
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value.replace(/\D/g, '').slice(0, 6));
                  setFormError(null);
                }}
                placeholder={t.pinPlaceholder}
                className="w-full px-4 py-3.5 rounded-2xl bg-slate-950 border-2 border-slate-700/80 text-slate-100 text-lg sm:text-xl font-mono font-bold tracking-widest focus:outline-none focus:border-indigo-500 placeholder:text-slate-600 placeholder:text-sm placeholder:font-sans placeholder:tracking-normal transition"
              />
              <button
                type="button"
                onClick={() => {
                  sound.playTap();
                  onOpenQrScanner();
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-400 hover:text-white transition cursor-pointer"
                title={t.scanQrButton}
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Nickname Input */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-1.5">
              {t.enterNickname}
            </label>
            <input
              type="text"
              maxLength={20}
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value);
                setFormError(null);
              }}
              placeholder={t.nicknamePlaceholder}
              className="w-full px-4 py-3.5 rounded-2xl bg-slate-950 border-2 border-slate-700/80 text-slate-100 text-base font-bold focus:outline-none focus:border-indigo-500 placeholder:text-slate-600 placeholder:font-normal transition"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-500 via-indigo-600 to-indigo-700 hover:from-rose-400 hover:to-indigo-600 text-white font-black text-base shadow-xl shadow-indigo-600/30 transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
          >
            <span>{t.joinButton}</span>
          </button>

          {/* QR Scanner button */}
          <button
            type="button"
            onClick={() => {
              sound.playTap();
              onOpenQrScanner();
            }}
            className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-xs border border-slate-700/80 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Camera className="w-4 h-4 text-indigo-400" />
            <span>{t.scanQrButton}</span>
          </button>
        </form>

        {/* Host Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase font-bold tracking-widest">
            <span className="bg-slate-900 px-3 text-slate-500">{t.orHostOwn}</span>
          </div>
        </div>

        {/* Host Mode Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={() => {
              sound.playTap();
              onQuickHostSampleQuiz();
            }}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Play className="w-4 h-4 fill-current" />
              <span>
                {lang === 'uz' ? "Namunaviy viktorinani boshlash (5 ta savol)" : "Quick Host: Sample Quiz (5 Questions)"}
              </span>
            </div>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              sound.playTap();
              onOpenQuizManager();
            }}
            className="w-full py-3 px-4 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 font-bold text-xs border border-slate-700/80 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span>{t.createGameButton}</span>
          </button>
        </div>
      </div>

      {/* Feature Highlights Footer */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center max-w-2xl w-full">
        <div className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800/60">
          <Zap className="w-5 h-5 text-amber-400 mx-auto mb-1" />
          <span className="text-xs font-bold text-slate-300 block">
            {lang === 'uz' ? "Tezkor Ball Tizimi" : "Real-time Scoring"}
          </span>
          <span className="text-[11px] text-slate-500">
            {lang === 'uz' ? "Javob tezligi va seriya bonuslari" : "Speed & streak bonuses"}
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800/60">
          <Camera className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
          <span className="text-xs font-bold text-slate-300 block">
            {lang === 'uz' ? "QR kod bilan oson ulanish" : "Quick QR Code Join"}
          </span>
          <span className="text-[11px] text-slate-500">
            {lang === 'uz' ? "Telefon kamerasidan bir zumda" : "Scan from phone instantly"}
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800/60">
          <Trophy className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
          <span className="text-xs font-bold text-slate-300 block">
            {lang === 'uz' ? "Shohsupa & CSV Eksport" : "Podium & CSV Export"}
          </span>
          <span className="text-[11px] text-slate-500">
            {lang === 'uz' ? "100+ o'yinchi va reyting" : "100+ players supported"}
          </span>
        </div>
      </div>
    </div>
  );
};
