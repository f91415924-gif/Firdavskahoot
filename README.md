# QuizArena - Real-Time Multiplayer Quiz Game (Kahoot-Style)

QuizArena is a modern, high-performance, real-time multiplayer quiz game built in Uzbek (with easy one-click English and Russian language support). Designed for classrooms, conferences, meetups, and friendly game nights.

---

## 🌟 Key Features

### 👑 Host (Presenter) Experience
- **Quiz Management**: Create, edit, duplicate, and delete custom quizzes with custom time limits (10s–120s) and points multipliers (1x or 2x Double Points).
- **Ready-to-Play Sample Quizzes**: Pre-loaded with high quality 5-question quizzes (*"O'zbekiston va Dunyo Bilimdoni"* and *"IT va Zamonaviy Texnologiyalar"*).
- **Big-Screen Lobby**:
  - Unique 6-digit Game PIN in large high-contrast typography.
  - Dynamic QR code generated with `qrcode.react` containing direct join link.
  - Live animated player list as participants join.
  - Host kick controls to remove disruptive players.
- **Question Screen**: Real-time timer countdown, live counter of answered players, vibrant Kahoot-style colored cards (Triangle, Diamond, Circle, Square).
- **Reveal & Stats Screen**: Answer distribution bars showing how many players chose each option, highlighted correct answer, and Top 5 Mini Leaderboard.
- **Final Podium**:
  - Animated 3-tier podium with 1st, 2nd, and 3rd place medals.
  - Confetti explosion and celebratory fanfares.
  - Complete scrollable leaderboard table.
  - **Export to CSV**: Download full match results as a spreadsheet.
  - Tie-breaker: If scores are tied, the player with the faster response time ranks higher.

### 📱 Player Experience
- **Quick Join**:
  - Enter the 6-digit PIN + Nickname on mobile or computer.
  - Scan the lobby QR code with the integrated camera scanner (`html5-qrcode`) or directly via phone camera (auto-fills PIN).
- **Waiting Room**: Interactive waiting room with personal avatar and hints.
- **Big Touch Buttons**: Large vibrant colored geometric buttons tailored for phones.
- **Cheating & Double-Submission Prevention**: Answers lock instantly upon tap; cannot be changed or resubmitted.
- **Instant Result Feedback**: Shows correct/wrong status, earned points, total score, current rank, and fiery streak bonus (`🔥 +300 bonus`).
- **Seamless Reconnect**: If a player refreshes or disconnects, they rejoin the existing room with their score and status preserved.

---

## ⚡ Server-Authoritative Scoring System

To prevent client manipulation, inspect-element hacks, or time-tampering, all score calculations are computed on the Node.js backend using server timestamps:
- **Wrong or Timeout Answer**: `0` points, resets streak.
- **Correct Answer**:
  - `basePoints` = 1000 (or 2000 for Double Points)
  - `speedRatio` = `responseTime / timeLimit`
  - `points` = `round(basePoints * (1 - speedRatio / 2))`
  - Faster responses yield higher scores (up to 100% of base points, tapering to 50% at the buzzer).
- **Streak Bonus**: `+100` points per consecutive correct streak (starting at streak 2, max `+500`).
- **Hidden Answers**: Correct answer indices are never sent to client sockets during the active question phase.

---

## 🛠️ Tech Stack & Setup

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Canvas Confetti.
- **Backend**: Express + Node.js HTTP Server, Socket.IO for sub-millisecond bidirectional sync.
- **QR Code Engine**: `qrcode.react` (generation) & `html5-qrcode` (camera scanning).
- **Sound Synthesizer**: Web Audio API (zero external audio network dependencies).

### Running Locally
```bash
# Install dependencies
npm install

# Start full-stack development server on port 3000
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```
