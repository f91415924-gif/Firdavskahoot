import React from 'react';
import { Volume2, VolumeX, Globe, Sparkles, BookOpen } from 'lucide-react';
import { TRANSLATIONS, Language } from '../i18n/translations';
import { sound } from '../services/sound';

interface HeaderProps {
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenQuizManager: () => void;
  onGoHome: () => void;
  isMuted: boolean;
  onToggleSound: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  onLanguageChange,
  onOpenQuizManager,
  onGoHome,
  isMuted,
  onToggleSound,
}) => {
  const t = TRANSLATIONS[lang];

  return (
    <header className="w-full bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand */}
        <button
          onClick={onGoHome}
          className="flex items-center gap-2.5 text-left group transition cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-rose-500/20 group-hover:scale-105 transition">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                {t.appTitle}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                Live
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              {t.appSubtitle}
            </p>
          </div>
        </button>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Quiz Manager Button */}
          <button
            onClick={() => {
              sound.playTap();
              onOpenQuizManager();
            }}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition cursor-pointer"
            title={t.myQuizzes}
          >
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span className="hidden md:inline">{t.myQuizzes}</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className={`p-2 rounded-lg border transition cursor-pointer ${
              isMuted
                ? 'bg-rose-950/40 border-rose-800/60 text-rose-400 hover:bg-rose-900/40'
                : 'bg-slate-800 border-slate-700/60 text-slate-300 hover:bg-slate-700'
            }`}
            title={isMuted ? t.soundOff : t.soundOn}
            aria-label="Sound Toggle"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Language Selector */}
          <div className="relative flex items-center">
            <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700/60">
              <Globe className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-1 hidden sm:block" />
              {(['uz', 'en', 'ru'] as Language[]).map((lng) => (
                <button
                  key={lng}
                  onClick={() => {
                    sound.playTap();
                    onLanguageChange(lng);
                  }}
                  className={`text-xs font-bold uppercase px-2 py-1 rounded transition cursor-pointer ${
                    lang === lng
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {lng}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
