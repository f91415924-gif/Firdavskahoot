export interface Question {
  id: string;
  text: string;
  options: string[]; // 2 to 4 options
  correctOptionIndex: number; // 0 to 3
  timeLimit: number; // 5 to 120 seconds
  pointsMultiplier: 'standard' | 'double'; // 1000 or 2000 base
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  category?: string;
  questions: Question[];
  createdAt: number;
}

export interface Player {
  id: string; // Persistent UUID/token
  socketId: string;
  nickname: string;
  avatarColor: string;
  score: number;
  streak: number;
  correctCount: number;
  totalResponseTime: number; // in seconds
  answeredCurrent: boolean;
  lastAnswer?: {
    optionIndex: number;
    responseTime: number;
    isCorrect: boolean;
    pointsEarned: number;
  };
}

export interface PlayerSummary {
  id: string;
  nickname: string;
  avatarColor: string;
  score: number;
  rank?: number;
  answered?: boolean;
}

export interface LeaderboardEntry {
  id: string;
  nickname: string;
  avatarColor: string;
  score: number;
  rank: number;
  correctCount: number;
  totalResponseTime: number;
  streak: number;
}

export interface QuestionClientPayload {
  questionIndex: number;
  totalQuestions: number;
  text: string;
  options: string[];
  timeLimit: number;
  pointsMultiplier: 'standard' | 'double';
  startTime: number;
}

export interface RevealPayload {
  questionIndex: number;
  correctOptionIndex: number;
  optionCounts: number[]; // Count of answers for each option index
  totalAnswered: number;
  leaderboard: LeaderboardEntry[]; // Top players
  playerResult?: {
    isCorrect: boolean;
    pointsEarned: number;
    totalScore: number;
    rank: number;
    totalPlayers: number;
    streak: number;
    selectedOption: number;
  };
}

export interface FinalResultsPayload {
  podium: LeaderboardEntry[]; // Top 3
  allRankings: LeaderboardEntry[]; // Complete leaderboard
  playerFinalResult?: {
    rank: number;
    totalPlayers: number;
    totalScore: number;
    correctCount: number;
    totalQuestions: number;
  };
}

export type RoomStatus = 'lobby' | 'question' | 'reveal' | 'finished';

export interface RoomState {
  pin: string;
  title: string;
  hostSocketId: string;
  status: RoomStatus;
  currentQuestionIndex: number;
  totalQuestions: number;
  playersCount: number;
}
