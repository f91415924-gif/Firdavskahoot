import React, { useState } from 'react';
import { X, Plus, Edit2, Trash2, Play, Copy, CheckCircle2, HelpCircle } from 'lucide-react';
import { Quiz, Question } from '../../types/quiz';
import { TRANSLATIONS, Language } from '../../i18n/translations';
import { sound } from '../../services/sound';

interface QuizManagerModalProps {
  lang: Language;
  quizzes: Quiz[];
  onSelectQuizToHost: (quiz: Quiz) => void;
  onSaveQuiz: (quiz: Quiz) => void;
  onDeleteQuiz: (quizId: string) => void;
  onClose: () => void;
}

export const QuizManagerModal: React.FC<QuizManagerModalProps> = ({
  lang,
  quizzes,
  onSelectQuizToHost,
  onSaveQuiz,
  onDeleteQuiz,
  onClose,
}) => {
  const t = TRANSLATIONS[lang];
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);

  const handleCreateNew = () => {
    sound.playTap();
    const newQuiz: Quiz = {
      id: `custom-quiz-${Date.now()}`,
      title: lang === 'uz' ? "Mening yangi viktorinam" : lang === 'ru' ? "Моя новая викторина" : "My New Quiz",
      description: lang === 'uz' ? "Qiziqarli savollar to'plami" : "A set of exciting questions",
      createdAt: Date.now(),
      questions: [
        {
          id: `q-${Date.now()}-1`,
          text: lang === 'uz' ? "O'zbekistonning poytaxti qaysi shahar?" : "What is the capital of Uzbekistan?",
          options: [
            lang === 'uz' ? "Toshkent" : "Tashkent",
            lang === 'uz' ? "Samarqand" : "Samarkand",
            lang === 'uz' ? "Buxoro" : "Bukhara",
            lang === 'uz' ? "Xiva" : "Khiva"
          ],
          correctOptionIndex: 0,
          timeLimit: 20,
          pointsMultiplier: 'standard'
        }
      ]
    };
    setEditingQuiz(newQuiz);
  };

  const handleDuplicate = (quiz: Quiz) => {
    sound.playTap();
    const duplicated: Quiz = {
      ...quiz,
      id: `custom-quiz-${Date.now()}`,
      title: `${quiz.title} (${lang === 'uz' ? 'Nusxa' : 'Copy'})`,
      createdAt: Date.now(),
    };
    onSaveQuiz(duplicated);
  };

  if (editingQuiz) {
    return (
      <QuizEditor
        lang={lang}
        quiz={editingQuiz}
        onSave={(updated) => {
          onSaveQuiz(updated);
          setEditingQuiz(null);
        }}
        onCancel={() => setEditingQuiz(null)}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/90">
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <span>{t.quizManagement}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {lang === 'uz'
                ? "Viktorinani tanlang va o'yin xonasini ishga tushiring"
                : "Select a quiz and launch the game lobby"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {lang === 'uz' ? "Mavjud viktorinalar" : "Available Quizzes"} ({quizzes.length})
            </span>
            <button
              onClick={handleCreateNew}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t.createQuiz}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {quizzes.map((quiz) => {
              const isSample = quiz.id.startsWith('quiz-uzb') || quiz.id.startsWith('quiz-tech');
              return (
                <div
                  key={quiz.id}
                  className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-2xl p-4 flex flex-col justify-between transition group hover:border-indigo-500/50 hover:shadow-lg"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                        isSample
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {isSample ? t.sampleBadge : t.customBadge}
                      </span>
                      <span className="text-xs text-slate-400 font-semibold">
                        {quiz.questions.length} {lang === 'uz' ? 'savol' : 'questions'}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-100 text-base mt-2.5 line-clamp-1 group-hover:text-indigo-300 transition">
                      {quiz.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {quiz.description || "—"}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          sound.playTap();
                          setEditingQuiz(quiz);
                        }}
                        className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
                        title={t.editQuiz}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDuplicate(quiz)}
                        className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
                        title="Duplicate"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      {!isSample && (
                        <button
                          onClick={() => {
                            if (window.confirm(lang === 'uz' ? "Rostdan ham ushbu viktorinani o'chirmoqchimisiz?" : "Delete this quiz?")) {
                              onDeleteQuiz(quiz.id);
                            }
                          }}
                          className="p-1.5 rounded-lg hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                          title={t.deleteQuiz}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        sound.playTap();
                        onSelectQuizToHost(quiz);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{t.startThisQuiz}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// Quiz Editor Component
interface QuizEditorProps {
  lang: Language;
  quiz: Quiz;
  onSave: (quiz: Quiz) => void;
  onCancel: () => void;
}

const QuizEditor: React.FC<QuizEditorProps> = ({
  lang,
  quiz,
  onSave,
  onCancel,
}) => {
  const t = TRANSLATIONS[lang];
  const [title, setTitle] = useState(quiz.title);
  const [description, setDescription] = useState(quiz.description || '');
  const [questions, setQuestions] = useState<Question[]>(quiz.questions);

  const handleAddQuestion = () => {
    sound.playTap();
    const newQ: Question = {
      id: `q-${Date.now()}-${questions.length + 1}`,
      text: '',
      options: ['', '', '', ''],
      correctOptionIndex: 0,
      timeLimit: 20,
      pointsMultiplier: 'standard'
    };
    setQuestions([...questions, newQ]);
  };

  const handleUpdateQuestion = (idx: number, updated: Partial<Question>) => {
    const next = [...questions];
    next[idx] = { ...next[idx], ...updated };
    setQuestions(next);
  };

  const handleOptionTextChange = (qIdx: number, optIdx: number, text: string) => {
    const next = [...questions];
    const opts = [...next[qIdx].options];
    opts[optIdx] = text;
    next[qIdx] = { ...next[qIdx], options: opts };
    setQuestions(next);
  };

  const handleDeleteQuestion = (qIdx: number) => {
    if (questions.length <= 1) {
      alert(lang === 'uz' ? "Kamida bitta savol bo'lishi kerak!" : "Must have at least one question!");
      return;
    }
    setQuestions(questions.filter((_, i) => i !== qIdx));
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert(lang === 'uz' ? "Iltimos, viktorina nomini kiriting!" : "Please enter a quiz title!");
      return;
    }
    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].text.trim()) {
        alert(lang === 'uz' ? `${i + 1}-savol matni bo'sh bo'lishi mumkin emas!` : `Question ${i + 1} text cannot be empty!`);
        return;
      }
      const validOpts = questions[i].options.filter(o => o.trim().length > 0);
      if (validOpts.length < 2) {
        alert(lang === 'uz' ? `${i + 1}-savolda kamida 2 ta to'ldirilgan variant bo'lishi kerak!` : `Question ${i + 1} must have at least 2 non-empty options!`);
        return;
      }
    }

    sound.playTap();
    onSave({
      ...quiz,
      title: title.trim(),
      description: description.trim(),
      questions,
    });
  };

  const optionColors = [
    { name: 'Red', bg: 'border-red-500/50 focus-within:border-red-400', badge: 'bg-red-500 text-white', icon: '▲' },
    { name: 'Blue', bg: 'border-blue-500/50 focus-within:border-blue-400', badge: 'bg-blue-500 text-white', icon: '◆' },
    { name: 'Yellow', bg: 'border-amber-500/50 focus-within:border-amber-400', badge: 'bg-amber-500 text-white', icon: '●' },
    { name: 'Green', bg: 'border-emerald-500/50 focus-within:border-emerald-400', badge: 'bg-emerald-500 text-white', icon: '■' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white">
              {t.editQuiz}
            </h2>
            <p className="text-xs text-slate-400">
              {questions.length} {lang === 'uz' ? 'ta savol' : 'questions'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onCancel}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
            >
              {t.cancel}
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/20 cursor-pointer"
            >
              {t.saveQuiz}
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-6">
          {/* Metadata */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                {t.quizTitleLabel} *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Viktorina sarlavhasi..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                {t.quizDescLabel}
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Qisqacha tavsif..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Question List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-200">
                {t.questionsList} ({questions.length})
              </h3>
              <button
                onClick={handleAddQuestion}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-400 hover:text-indigo-300 text-xs font-bold border border-slate-700 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.addQuestion}</span>
              </button>
            </div>

            {questions.map((q, qIdx) => (
              <div
                key={q.id || qIdx}
                className="bg-slate-800/70 border border-slate-700/80 rounded-2xl p-4 sm:p-5 space-y-3 relative group"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-xs">
                      {qIdx + 1}
                    </span>
                    <span className="text-xs font-semibold text-slate-300">
                      {t.question} {qIdx + 1}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Time Limit */}
                    <select
                      value={q.timeLimit}
                      onChange={(e) => handleUpdateQuestion(qIdx, { timeLimit: Number(e.target.value) })}
                      className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
                    >
                      <option value={10}>10s</option>
                      <option value={15}>15s</option>
                      <option value={20}>20s</option>
                      <option value={30}>30s</option>
                      <option value={60}>60s</option>
                      <option value={90}>90s</option>
                      <option value={120}>120s</option>
                    </select>

                    {/* Points Multiplier */}
                    <select
                      value={q.pointsMultiplier}
                      onChange={(e) => handleUpdateQuestion(qIdx, { pointsMultiplier: e.target.value as 'standard' | 'double' })}
                      className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
                    >
                      <option value="standard">1x (1000 ball)</option>
                      <option value="double">2x (2000 ball)</option>
                    </select>

                    {/* Delete Question */}
                    <button
                      onClick={() => handleDeleteQuestion(qIdx)}
                      className="p-1 rounded-lg hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Question Text */}
                <input
                  type="text"
                  value={q.text}
                  onChange={(e) => handleUpdateQuestion(qIdx, { text: e.target.value })}
                  placeholder={lang === 'uz' ? "Savolingizni bu yerga yozing..." : "Type your question here..."}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm font-semibold focus:outline-none focus:border-indigo-500"
                />

                {/* 4 Options Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {q.options.map((optText, optIdx) => {
                    const isCorrect = q.correctOptionIndex === optIdx;
                    const styling = optionColors[optIdx] || optionColors[0];

                    return (
                      <div
                        key={optIdx}
                        className={`flex items-center gap-2 p-2 rounded-xl bg-slate-900 border ${styling.bg} transition`}
                      >
                        <span className={`w-6 h-6 rounded flex items-center justify-center font-black text-xs ${styling.badge}`}>
                          {styling.icon}
                        </span>
                        <input
                          type="text"
                          value={optText}
                          onChange={(e) => handleOptionTextChange(qIdx, optIdx, e.target.value)}
                          placeholder={`${t.option} ${optIdx + 1}...`}
                          className="flex-1 bg-transparent text-slate-100 text-xs focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleUpdateQuestion(qIdx, { correctOptionIndex: optIdx })}
                          className={`p-1 rounded-lg transition cursor-pointer flex items-center gap-1 text-[11px] font-bold ${
                            isCorrect
                              ? 'bg-emerald-500 text-white'
                              : 'text-slate-500 hover:text-slate-300'
                          }`}
                          title={t.markCorrect}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex justify-center">
            <button
              onClick={handleAddQuestion}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-750 text-indigo-300 font-bold text-xs border border-slate-700 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t.addQuestion}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
