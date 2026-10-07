import express from 'express';
import http from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import type { Quiz, Player, LeaderboardEntry } from './src/types/quiz.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ActiveRoom {
  pin: string;
  hostSocketId: string;
  quiz: Quiz;
  status: 'lobby' | 'question' | 'reveal' | 'finished';
  currentQuestionIndex: number;
  questionStartedAt: number;
  questionTimer?: NodeJS.Timeout;
  players: Map<string, Player>; // playerId -> Player
  socketToPlayer: Map<string, string>; // socketId -> playerId
}

const activeRooms = new Map<string, ActiveRoom>();

function generateUniquePin(): string {
  let pin = '';
  do {
    pin = Math.floor(100000 + Math.random() * 900000).toString();
  } while (activeRooms.has(pin));
  return pin;
}

function getRankedPlayers(room: ActiveRoom): LeaderboardEntry[] {
  const players = Array.from(room.players.values());
  // Sort primarily by score desc, secondarily by totalResponseTime asc (faster wins tie-break)
  players.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.totalResponseTime - b.totalResponseTime;
  });

  return players.map((p, idx) => ({
    id: p.id,
    nickname: p.nickname,
    avatarColor: p.avatarColor,
    score: p.score,
    rank: idx + 1,
    correctCount: p.correctCount,
    totalResponseTime: Number(p.totalResponseTime.toFixed(2)),
    streak: p.streak
  }));
}

const AVATAR_COLORS = [
  '#EF4444', '#3B82F6', '#10B981', '#F59E0B',
  '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'
];

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  // REST health check / info
  app.use(express.json());
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      activeRooms: activeRooms.size,
      timestamp: Date.now()
    });
  });

  // Check room status API
  app.get('/api/room/:pin', (req, res) => {
    const pin = req.params.pin;
    const room = activeRooms.get(pin);
    if (!room) {
      return res.status(404).json({ error: 'ROOM_NOT_FOUND' });
    }
    return res.json({
      pin: room.pin,
      status: room.status,
      title: room.quiz.title,
      playerCount: room.players.size
    });
  });

  // Socket.IO Logic
  io.on('connection', (socket: Socket) => {
    // HOST: CREATE ROOM
    socket.on('host:create_room', (data: { quiz: Quiz }) => {
      try {
        const pin = generateUniquePin();
        const room: ActiveRoom = {
          pin,
          hostSocketId: socket.id,
          quiz: data.quiz,
          status: 'lobby',
          currentQuestionIndex: -1,
          questionStartedAt: 0,
          players: new Map(),
          socketToPlayer: new Map()
        };

        activeRooms.set(pin, room);
        socket.join(`room:${pin}`);
        socket.join(`host:${pin}`);

        socket.emit('room:created', {
          pin,
          title: data.quiz.title,
          totalQuestions: data.quiz.questions.length
        });
      } catch (err: unknown) {
        socket.emit('error:message', { message: 'Failed to create room' });
      }
    });

    // PLAYER: JOIN ROOM
    socket.on('player:join', (data: { pin: string; nickname: string; playerId?: string }) => {
      const { pin, nickname, playerId } = data;
      const room = activeRooms.get(pin);

      if (!room) {
        return socket.emit('error:message', {
          code: 'ROOM_NOT_FOUND',
          message: 'Bunday PIN-kodli o\'yin topilmadi yoki o\'yin yakunlangan.'
        });
      }

      if (room.status !== 'lobby') {
        return socket.emit('error:message', {
          code: 'GAME_ALREADY_STARTED',
          message: 'Kechirasiz, o\'yin allaqachon boshlangan. Yangi o\'yinchilar qabul qilinmaydi.'
        });
      }

      const trimmedNick = (nickname || '').trim();
      if (!trimmedNick) {
        return socket.emit('error:message', {
          code: 'INVALID_NICKNAME',
          message: 'Iltimos, ismingizni kiriting.'
        });
      }

      // Check unique nickname within room (case-insensitive)
      for (const p of room.players.values()) {
        if (p.id !== playerId && p.nickname.toLowerCase() === trimmedNick.toLowerCase()) {
          return socket.emit('error:message', {
            code: 'NICKNAME_TAKEN',
            message: 'Bu ism ushbu xonada allaqachon band. Boshqa ism tanlang.'
          });
        }
      }

      const finalPlayerId = playerId || `p_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const avatarColor = AVATAR_COLORS[room.players.size % AVATAR_COLORS.length];

      const player: Player = {
        id: finalPlayerId,
        socketId: socket.id,
        nickname: trimmedNick,
        avatarColor,
        score: 0,
        streak: 0,
        correctCount: 0,
        totalResponseTime: 0,
        answeredCurrent: false
      };

      room.players.set(finalPlayerId, player);
      room.socketToPlayer.set(socket.id, finalPlayerId);

      socket.join(`room:${pin}`);
      socket.join(`player:${finalPlayerId}`);

      // Notify player
      socket.emit('room:joined', {
        pin,
        player: {
          id: player.id,
          nickname: player.nickname,
          avatarColor: player.avatarColor
        },
        quizTitle: room.quiz.title
      });

      // Broadcast updated players list to room & host
      const playerList = Array.from(room.players.values()).map(p => ({
        id: p.id,
        nickname: p.nickname,
        avatarColor: p.avatarColor,
        score: p.score
      }));

      io.to(`room:${pin}`).emit('room:player_list', {
        count: room.players.size,
        players: playerList
      });
    });

    // PLAYER: RECONNECT
    socket.on('player:reconnect', (data: { pin: string; playerId: string }) => {
      const { pin, playerId } = data;
      const room = activeRooms.get(pin);
      if (!room) return;

      const player = room.players.get(playerId);
      if (!player) return;

      // Update socket bindings
      player.socketId = socket.id;
      room.socketToPlayer.set(socket.id, playerId);
      socket.join(`room:${pin}`);
      socket.join(`player:${playerId}`);

      // Send current state
      socket.emit('player:reconnected', {
        pin,
        status: room.status,
        player: {
          id: player.id,
          nickname: player.nickname,
          avatarColor: player.avatarColor,
          score: player.score,
          streak: player.streak
        },
        currentQuestionIndex: room.currentQuestionIndex,
        totalQuestions: room.quiz.questions.length,
        hasAnswered: player.answeredCurrent
      });

      // If in active question, send current question info
      if (room.status === 'question' && room.currentQuestionIndex >= 0) {
        const q = room.quiz.questions[room.currentQuestionIndex];
        const elapsed = (Date.now() - room.questionStartedAt) / 1000;
        const timeRemaining = Math.max(0, q.timeLimit - elapsed);

        socket.emit('question:start', {
          questionIndex: room.currentQuestionIndex,
          totalQuestions: room.quiz.questions.length,
          text: q.text,
          options: q.options,
          timeLimit: q.timeLimit,
          pointsMultiplier: q.pointsMultiplier,
          startTime: room.questionStartedAt,
          timeRemaining
        });
      }
    });

    // HOST: KICK PLAYER
    socket.on('host:kick_player', (data: { pin: string; playerId: string }) => {
      const { pin, playerId } = data;
      const room = activeRooms.get(pin);
      if (!room || room.hostSocketId !== socket.id) return;

      const player = room.players.get(playerId);
      if (player) {
        io.to(`player:${playerId}`).emit('player:kicked', {
          reason: 'Siz o\'yin boshlovchisi tomonidan chetlatildingiz.'
        });
        room.players.delete(playerId);
        room.socketToPlayer.delete(player.socketId);

        const playerList = Array.from(room.players.values()).map(p => ({
          id: p.id,
          nickname: p.nickname,
          avatarColor: p.avatarColor,
          score: p.score
        }));

        io.to(`room:${pin}`).emit('room:player_list', {
          count: room.players.size,
          players: playerList
        });
      }
    });

    // HOST: START GAME
    socket.on('host:start_game', (data: { pin: string }) => {
      const { pin } = data;
      const room = activeRooms.get(pin);
      if (!room || room.hostSocketId !== socket.id) return;
      if (room.status !== 'lobby') return;

      room.status = 'question';
      room.currentQuestionIndex = 0;

      io.to(`room:${pin}`).emit('game:started', {
        totalQuestions: room.quiz.questions.length
      });

      // Trigger first question
      executeQuestion(room);
    });

    // PLAYER: SUBMIT ANSWER (Server Authoritative anti-cheat calculation)
    socket.on('player:submit_answer', (data: { pin: string; playerId: string; optionIndex: number }) => {
      const { pin, playerId, optionIndex } = data;
      const room = activeRooms.get(pin);
      if (!room) return;

      if (room.status !== 'question') {
        return socket.emit('error:message', { message: 'Savol vaqti tugagan yoki o\'yin kutish rejimida.' });
      }

      const player = room.players.get(playerId);
      if (!player) return;

      // Prevent double answers or answer changes
      if (player.answeredCurrent) {
        return socket.emit('error:message', { message: 'Siz allaqachon javob bergansiz.' });
      }

      const q = room.quiz.questions[room.currentQuestionIndex];
      if (!q) return;

      // Accurate server response time
      const serverNow = Date.now();
      const rawResponseTime = (serverNow - room.questionStartedAt) / 1000;
      const responseTime = Math.max(0.05, Math.min(q.timeLimit, rawResponseTime));

      const isCorrect = optionIndex === q.correctOptionIndex;
      let pointsEarned = 0;

      if (isCorrect) {
        // Base points: 1000 or 2000 for double
        const basePoints = q.pointsMultiplier === 'double' ? 2000 : 1000;
        // Speed factor: 1 - (responseTime / timeLimit) / 2
        // If answered at 0s: 1.0 (100% points). If answered at timeLimit: 0.5 (50% points).
        const speedRatio = Math.min(1, Math.max(0, responseTime / q.timeLimit));
        const speedFactor = 1 - (speedRatio / 2);
        const rawScore = Math.round(basePoints * speedFactor);

        // Streak bonus (+100 per streak, max +500)
        const streakBonus = player.streak >= 1 ? Math.min(500, player.streak * 100) : 0;
        pointsEarned = rawScore + streakBonus;

        player.streak += 1;
        player.correctCount += 1;
      } else {
        pointsEarned = 0;
        player.streak = 0;
      }

      player.score += pointsEarned;
      player.totalResponseTime += responseTime;
      player.answeredCurrent = true;
      player.lastAnswer = {
        optionIndex,
        responseTime,
        isCorrect,
        pointsEarned
      };

      // Acknowledge submission to the player
      socket.emit('player:answer_acknowledged', {
        optionIndex,
        submittedAt: serverNow
      });

      // Count answered
      const answeredCount = Array.from(room.players.values()).filter(p => p.answeredCurrent).length;
      const totalPlayers = room.players.size;

      // Broadcast count to room (for host screen and players counter)
      io.to(`room:${pin}`).emit('question:answer_stats', {
        answersCount: answeredCount,
        totalPlayers
      });

      // If all players have answered, trigger reveal early!
      if (totalPlayers > 0 && answeredCount >= totalPlayers) {
        if (room.questionTimer) {
          clearTimeout(room.questionTimer);
          room.questionTimer = undefined;
        }
        executeReveal(room);
      }
    });

    // HOST: NEXT QUESTION
    socket.on('host:next_question', (data: { pin: string }) => {
      const { pin } = data;
      const room = activeRooms.get(pin);
      if (!room || room.hostSocketId !== socket.id) return;
      if (room.status !== 'reveal') return;

      const nextIndex = room.currentQuestionIndex + 1;
      if (nextIndex < room.quiz.questions.length) {
        room.currentQuestionIndex = nextIndex;
        room.status = 'question';
        executeQuestion(room);
      } else {
        // Finish game
        executeFinalResults(room);
      }
    });

    // Clean up on disconnect
    socket.on('disconnect', () => {
      // If host disconnected from active room
      for (const [pin, room] of activeRooms.entries()) {
        if (room.hostSocketId === socket.id) {
          // If in lobby with no players, delete room after delay
          setTimeout(() => {
            const currentRoom = activeRooms.get(pin);
            if (currentRoom && currentRoom.hostSocketId === socket.id) {
              activeRooms.delete(pin);
            }
          }, 60000);
        }
      }
    });
  });

  function executeQuestion(room: ActiveRoom) {
    const q = room.quiz.questions[room.currentQuestionIndex];
    if (!q) return;

    room.status = 'question';
    room.questionStartedAt = Date.now();

    // Reset answered flag for all players
    for (const player of room.players.values()) {
      player.answeredCurrent = false;
      player.lastAnswer = undefined;
    }

    // Broadcast question to all (with answers text, but correct answer index is NOT sent to prevent inspect element cheating!)
    io.to(`room:${room.pin}`).emit('question:start', {
      questionIndex: room.currentQuestionIndex,
      totalQuestions: room.quiz.questions.length,
      text: q.text,
      options: q.options,
      timeLimit: q.timeLimit,
      pointsMultiplier: q.pointsMultiplier,
      startTime: room.questionStartedAt
    });

    io.to(`room:${room.pin}`).emit('question:answer_stats', {
      answersCount: 0,
      totalPlayers: room.players.size
    });

    // Set server countdown timer (+400ms margin for network latency)
    if (room.questionTimer) {
      clearTimeout(room.questionTimer);
    }
    room.questionTimer = setTimeout(() => {
      executeReveal(room);
    }, q.timeLimit * 1000 + 400);
  }

  function executeReveal(room: ActiveRoom) {
    if (room.status === 'reveal') return; // already revealed
    room.status = 'reveal';

    if (room.questionTimer) {
      clearTimeout(room.questionTimer);
      room.questionTimer = undefined;
    }

    const q = room.quiz.questions[room.currentQuestionIndex];
    if (!q) return;

    // Calculate option counts
    const optionCounts = [0, 0, 0, 0];
    for (const player of room.players.values()) {
      if (player.lastAnswer !== undefined && player.lastAnswer.optionIndex >= 0) {
        optionCounts[player.lastAnswer.optionIndex] = (optionCounts[player.lastAnswer.optionIndex] || 0) + 1;
      }
    }

    const leaderboard = getRankedPlayers(room);
    const top5 = leaderboard.slice(0, 5);

    // Host receives reveal with correct answer, distribution, top 5
    io.to(`host:${room.pin}`).emit('question:reveal', {
      questionIndex: room.currentQuestionIndex,
      correctOptionIndex: q.correctOptionIndex,
      optionCounts,
      totalAnswered: optionCounts.reduce((a, b) => a + b, 0),
      leaderboard: top5
    });

    // Send custom result payload to each individual player
    for (const player of room.players.values()) {
      const playerRankObj = leaderboard.find(l => l.id === player.id);
      const rank = playerRankObj ? playerRankObj.rank : room.players.size;
      const lastAnswer = player.lastAnswer;

      const playerResult = {
        isCorrect: lastAnswer ? lastAnswer.isCorrect : false,
        pointsEarned: lastAnswer ? lastAnswer.pointsEarned : 0,
        totalScore: player.score,
        rank,
        totalPlayers: room.players.size,
        streak: player.streak,
        selectedOption: lastAnswer ? lastAnswer.optionIndex : -1
      };

      io.to(`player:${player.id}`).emit('question:reveal', {
        questionIndex: room.currentQuestionIndex,
        correctOptionIndex: q.correctOptionIndex,
        optionCounts,
        totalAnswered: optionCounts.reduce((a, b) => a + b, 0),
        leaderboard: top5,
        playerResult
      });
    }
  }

  function executeFinalResults(room: ActiveRoom) {
    room.status = 'finished';

    const fullRankings = getRankedPlayers(room);
    const podium = fullRankings.slice(0, 3);

    // Send to host
    io.to(`host:${room.pin}`).emit('game:finished', {
      podium,
      allRankings: fullRankings
    });

    // Send to each player with their personal finish card
    for (const player of room.players.values()) {
      const rankObj = fullRankings.find(r => r.id === player.id);
      const rank = rankObj ? rankObj.rank : fullRankings.length;

      io.to(`player:${player.id}`).emit('game:finished', {
        podium,
        allRankings: fullRankings,
        playerFinalResult: {
          rank,
          totalPlayers: fullRankings.length,
          totalScore: player.score,
          correctCount: player.correctCount,
          totalQuestions: room.quiz.questions.length
        }
      });
    }
  }

  // Vite middleware in dev or static files in production
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const PORT = Number(process.env.PORT) || 3000;
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`QuizArena Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
