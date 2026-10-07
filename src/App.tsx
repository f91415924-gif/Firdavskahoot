import React, { useState, useEffect, useCallback } from 'react';
import { socketService } from './services/socket';
import { sound } from './services/sound';
import { SAMPLE_QUIZZES } from './data/sampleQuizzes';
import {
  Quiz,
  PlayerSummary,
  QuestionClientPayload,
  RevealPayload,
  FinalResultsPayload,
  LeaderboardEntry,
} from './types/quiz';
import { TRANSLATIONS, Language } from './i18n/translations';

// Components
import { Header } from './components/Header';
import { HomeView } from './components/HomeView';
import { QrScannerModal } from './components/QrScannerModal';
import { QuizManagerModal } from './components/Host/QuizManagerModal';
import { HostLobby } from './components/Host/HostLobby';
import { HostQuestion } from './components/Host/HostQuestion';
import { HostReveal } from './components/Host/HostReveal';
import { HostPodium } from './components/Host/HostPodium';
import { PlayerLobby } from './components/Player/PlayerLobby';
import { PlayerQuestion } from './components/Player/PlayerQuestion';
import { PlayerReveal } from './components/Player/PlayerReveal';
import { PlayerPodium } from './components/Player/PlayerPodium';

export default function App() {
  // Global Settings
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('quizarena_lang') as Language;
    return saved && ['uz', 'en', 'ru'].includes(saved) ? saved : 'uz';
  });

  const [isMuted, setIsMuted] = useState<boolean>(() => sound.isMuted());
  const [quizzes, setQuizzes] = useState<Quiz[]>(() => {
    try {
      const saved = localStorage.getItem('quizarena_custom_quizzes');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return [...SAMPLE_QUIZZES, ...parsed];
        }
      }
    } catch {
      // fallback
    }
    return SAMPLE_QUIZZES;
  });

  // UI Modals
  const [isQuizManagerOpen, setIsQuizManagerOpen] = useState(false);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // App Role & Flow State
  const [role, setRole] = useState<'none' | 'host' | 'player'>('none');
  const [initialUrlPin, setInitialUrlPin] = useState<string>('');

  // Host States
  const [hostPin, setHostPin] = useState<string>('');
  const [hostStatus, setHostStatus] = useState<'lobby' | 'question' | 'reveal' | 'finished'>('lobby');
  const [hostQuizTitle, setHostQuizTitle] = useState<string>('');
  const [hostTotalQuestions, setHostTotalQuestions] = useState<number>(0);
  const [hostPlayers, setHostPlayers] = useState<PlayerSummary[]>([]);
  const [hostQuestion, setHostQuestion] = useState<QuestionClientPayload | null>(null);
  const [hostAnswersCount, setHostAnswersCount] = useState<number>(0);
  const [hostRevealData, setHostRevealData] = useState<RevealPayload | null>(null);
  const [hostPodium, setHostPodium] = useState<LeaderboardEntry[]>([]);
  const [hostAllRankings, setHostAllRankings] = useState<LeaderboardEntry[]>([]);

  // Player States
  const [playerPin, setPlayerPin] = useState<string>('');
  const [playerId, setPlayerId] = useState<string>('');
  const [playerNickname, setPlayerNickname] = useState<string>('');
  const [playerAvatarColor, setPlayerAvatarColor] = useState<string>('#3B82F6');
  const [playerStatus, setPlayerStatus] = useState<'lobby' | 'question' | 'reveal' | 'finished'>('lobby');
  const [playerQuestion, setPlayerQuestion] = useState<QuestionClientPayload | null>(null);
  const [playerHasAnswered, setPlayerHasAnswered] = useState<boolean>(false);
  const [playerSelectedOption, setPlayerSelectedOption] = useState<number | undefined>(undefined);
  const [playerRevealData, setPlayerRevealData] = useState<RevealPayload | null>(null);
  const [playerFinalResults, setPlayerFinalResults] = useState<FinalResultsPayload | null>(null);

  // Read URL query parameters on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const pinParam = params.get('pin');
      if (pinParam && /^\d{6}$/.test(pinParam)) {
        setInitialUrlPin(pinParam);
      }
    }
  }, []);

  // Save custom quizzes to local storage
  const handleSaveQuiz = (quiz: Quiz) => {
    setQuizzes((prev) => {
      const existsIndex = prev.findIndex((q) => q.id === quiz.id);
      let updatedList: Quiz[];
      if (existsIndex >= 0) {
        updatedList = [...prev];
        updatedList[existsIndex] = quiz;
      } else {
        updatedList = [quiz, ...prev];
      }

      // Filter out hardcoded samples when saving to custom local storage
      const customOnly = updatedList.filter(
        (q) => !q.id.startsWith('quiz-uzb') && !q.id.startsWith('quiz-tech')
      );
      localStorage.setItem('quizarena_custom_quizzes', JSON.stringify(customOnly));
      return updatedList;
    });
  };

  const handleDeleteQuiz = (quizId: string) => {
    setQuizzes((prev) => {
      const updatedList = prev.filter((q) => q.id !== quizId);
      const customOnly = updatedList.filter(
        (q) => !q.id.startsWith('quiz-uzb') && !q.id.startsWith('quiz-tech')
      );
      localStorage.setItem('quizarena_custom_quizzes', JSON.stringify(customOnly));
      return updatedList;
    });
  };

  const handleLanguageChange = (lng: Language) => {
    setLang(lng);
    localStorage.setItem('quizarena_lang', lng);
  };

  const handleToggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  // Socket setup & Event listeners
  useEffect(() => {
    const socket = socketService.getSocket();

    // Check saved session for reconnect
    const savedSessionRaw = sessionStorage.getItem('quizarena_player_session');
    if (savedSessionRaw) {
      try {
        const session = JSON.parse(savedSessionRaw);
        if (session.pin && session.playerId) {
          socket.emit('player:reconnect', {
            pin: session.pin,
            playerId: session.playerId,
          });
        }
      } catch {
        // ignore
      }
    }

    // Host room created
    socket.on('room:created', (data: { pin: string; title: string; totalQuestions: number }) => {
      setHostPin(data.pin);
      setHostQuizTitle(data.title);
      setHostTotalQuestions(data.totalQuestions);
      setHostStatus('lobby');
      setHostPlayers([]);
      setRole('host');
      setErrorMessage(null);
      setIsQuizManagerOpen(false);
    });

    // Player joined room
    socket.on(
      'room:joined',
      (data: { pin: string; player: { id: string; nickname: string; avatarColor: string }; quizTitle: string }) => {
        setPlayerPin(data.pin);
        setPlayerId(data.player.id);
        setPlayerNickname(data.player.nickname);
        setPlayerAvatarColor(data.player.avatarColor);
        setPlayerStatus('lobby');
        setRole('player');
        setErrorMessage(null);

        // Save session for reloads
        sessionStorage.setItem(
          'quizarena_player_session',
          JSON.stringify({
            pin: data.pin,
            playerId: data.player.id,
            nickname: data.player.nickname,
          })
        );
      }
    );

    // Player reconnected
    socket.on('player:reconnected', (data: { pin: string; status: any; player: any; currentQuestionIndex: number }) => {
      setPlayerPin(data.pin);
      setPlayerId(data.player.id);
      setPlayerNickname(data.player.nickname);
      setPlayerAvatarColor(data.player.avatarColor);
      setPlayerStatus(data.status);
      setRole('player');
    });

    // Player list updated (Lobby)
    socket.on('room:player_list', (data: { count: number; players: PlayerSummary[] }) => {
      setHostPlayers((prev) => {
        // If a new player joined, play chime
        if (data.players.length > prev.length) {
          sound.playLobbyJoin();
        }
        return data.players;
      });
    });

    // Game started
    socket.on('game:started', () => {
      setHostStatus('question');
      setPlayerStatus('question');
    });

    // Question start
    socket.on('question:start', (data: QuestionClientPayload) => {
      setHostQuestion(data);
      setPlayerQuestion(data);
      setHostAnswersCount(0);
      setHostStatus('question');
      setPlayerStatus('question');
      setPlayerHasAnswered(false);
      setPlayerSelectedOption(undefined);
    });

    // Answer stats (how many have answered so far)
    socket.on('question:answer_stats', (data: { answersCount: number; totalPlayers: number }) => {
      setHostAnswersCount(data.answersCount);
    });

    // Player answer acknowledged by server
    socket.on('player:answer_acknowledged', (data: { optionIndex: number }) => {
      setPlayerHasAnswered(true);
      setPlayerSelectedOption(data.optionIndex);
    });

    // Question reveal (statistics, leaderboard)
    socket.on('question:reveal', (data: RevealPayload) => {
      setHostRevealData(data);
      setPlayerRevealData(data);
      setHostStatus('reveal');
      setPlayerStatus('reveal');
    });

    // Game finished (Podium)
    socket.on('game:finished', (data: FinalResultsPayload) => {
      setHostPodium(data.podium);
      setHostAllRankings(data.allRankings);
      setPlayerFinalResults(data);
      setHostStatus('finished');
      setPlayerStatus('finished');
      sessionStorage.removeItem('quizarena_player_session');
    });

    // Player kicked
    socket.on('player:kicked', (data: { reason: string }) => {
      sessionStorage.removeItem('quizarena_player_session');
      setRole('none');
      setErrorMessage(data.reason || TRANSLATIONS[lang].errKick);
      sound.playWrong();
    });

    // General error
    socket.on('error:message', (data: { message: string }) => {
      setErrorMessage(data.message);
      sound.playWrong();
    });

    return () => {
      socket.off('room:created');
      socket.off('room:joined');
      socket.off('player:reconnected');
      socket.off('room:player_list');
      socket.off('game:started');
      socket.off('question:start');
      socket.off('question:answer_stats');
      socket.off('player:answer_acknowledged');
      socket.off('question:reveal');
      socket.off('game:finished');
      socket.off('player:kicked');
      socket.off('error:message');
    };
  }, [lang]);

  // Host Action Handlers
  const handleHostCreateRoom = (quiz: Quiz) => {
    sound.playTap();
    const socket = socketService.getSocket();
    socket.emit('host:create_room', { quiz });
  };

  const handleStartGame = () => {
    const socket = socketService.getSocket();
    socket.emit('host:start_game', { pin: hostPin });
  };

  const handleNextQuestion = () => {
    const socket = socketService.getSocket();
    socket.emit('host:next_question', { pin: hostPin });
  };

  const handleKickPlayer = (targetPlayerId: string) => {
    const socket = socketService.getSocket();
    socket.emit('host:kick_player', { pin: hostPin, playerId: targetPlayerId });
  };

  // Player Action Handlers
  const handleJoinGame = (pinToJoin: string, nickToJoin: string) => {
    setErrorMessage(null);
    const socket = socketService.getSocket();
    socket.emit('player:join', {
      pin: pinToJoin,
      nickname: nickToJoin,
    });
  };

  const handleSubmitAnswer = (optionIndex: number) => {
    const socket = socketService.getSocket();
    socket.emit('player:submit_answer', {
      pin: playerPin,
      playerId,
      optionIndex,
    });
  };

  const handleResetToHome = () => {
    sessionStorage.removeItem('quizarena_player_session');
    setRole('none');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Header */}
      <Header
        lang={lang}
        onLanguageChange={handleLanguageChange}
        onOpenQuizManager={() => setIsQuizManagerOpen(true)}
        onGoHome={handleResetToHome}
        isMuted={isMuted}
        onToggleSound={handleToggleSound}
      />

      {/* Main App Content Views */}
      <main className="flex-1 flex flex-col">
        {/* VIEW 1: HOME / JOIN */}
        {role === 'none' && (
          <HomeView
            lang={lang}
            initialPin={initialUrlPin}
            errorMessage={errorMessage}
            onJoinGame={handleJoinGame}
            onOpenQrScanner={() => setIsQrScannerOpen(true)}
            onOpenQuizManager={() => setIsQuizManagerOpen(true)}
            onQuickHostSampleQuiz={() => handleHostCreateRoom(SAMPLE_QUIZZES[0])}
          />
        )}

        {/* VIEW 2: HOST FLOW */}
        {role === 'host' && (
          <>
            {hostStatus === 'lobby' && (
              <HostLobby
                lang={lang}
                pin={hostPin}
                quizTitle={hostQuizTitle}
                totalQuestions={hostTotalQuestions}
                players={hostPlayers}
                onStartGame={handleStartGame}
                onKickPlayer={handleKickPlayer}
              />
            )}

            {hostStatus === 'question' && hostQuestion && (
              <HostQuestion
                lang={lang}
                question={hostQuestion}
                answersCount={hostAnswersCount}
                totalPlayers={hostPlayers.length}
              />
            )}

            {hostStatus === 'reveal' && hostQuestion && hostRevealData && (
              <HostReveal
                lang={lang}
                question={hostQuestion}
                revealData={hostRevealData}
                onNextQuestion={handleNextQuestion}
                isLastQuestion={hostQuestion.questionIndex + 1 >= hostQuestion.totalQuestions}
              />
            )}

            {hostStatus === 'finished' && (
              <HostPodium
                lang={lang}
                podium={hostPodium}
                allRankings={hostAllRankings}
                quizTitle={hostQuizTitle}
                onPlayAgain={handleResetToHome}
              />
            )}
          </>
        )}

        {/* VIEW 3: PLAYER FLOW */}
        {role === 'player' && (
          <>
            {playerStatus === 'lobby' && (
              <PlayerLobby
                lang={lang}
                nickname={playerNickname}
                avatarColor={playerAvatarColor}
                pin={playerPin}
              />
            )}

            {playerStatus === 'question' && playerQuestion && (
              <PlayerQuestion
                lang={lang}
                question={playerQuestion}
                hasAnswered={playerHasAnswered}
                selectedOptionIndex={playerSelectedOption}
                onSubmitAnswer={handleSubmitAnswer}
              />
            )}

            {playerStatus === 'reveal' && playerRevealData && (
              <PlayerReveal
                lang={lang}
                revealData={playerRevealData}
              />
            )}

            {playerStatus === 'finished' && playerFinalResults && (
              <PlayerPodium
                lang={lang}
                finalResults={playerFinalResults}
                nickname={playerNickname}
                avatarColor={playerAvatarColor}
                onPlayAgain={handleResetToHome}
              />
            )}
          </>
        )}
      </main>

      {/* MODAL: QR Scanner */}
      {isQrScannerOpen && (
        <QrScannerModal
          lang={lang}
          onScanSuccess={(scannedPin) => {
            sound.playTap();
            setIsQrScannerOpen(false);
            setInitialUrlPin(scannedPin);
          }}
          onClose={() => setIsQrScannerOpen(false)}
        />
      )}

      {/* MODAL: Quiz Manager & Editor */}
      {isQuizManagerOpen && (
        <QuizManagerModal
          lang={lang}
          quizzes={quizzes}
          onSelectQuizToHost={(quiz) => handleHostCreateRoom(quiz)}
          onSaveQuiz={handleSaveQuiz}
          onDeleteQuiz={handleDeleteQuiz}
          onClose={() => setIsQuizManagerOpen(false)}
        />
      )}
    </div>
  );
}
