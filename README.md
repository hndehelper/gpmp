# 🌺 GPMP Online (ගෑනු, පිරිමි, මල්, පළතුරු)
> **The Ultimate Real-Time Multiplayer Word Game for Sri Lankan Campus & Gen Z Gamers!**

A 100% gamified, real-time web edition of the nostalgic Sri Lankan childhood game **"ගෑනු, පිරිමි, මල්, පළතුරු"** featuring 60-second sudden death panic mode, split-score duplicate detection, peer-review voting, and a live global community counter.

---

## 🎮 Core Gameplay Mechanics

1. **Room Creation & Shareable Link**:
   - Host creates a room with an intuitive 6-character room code (e.g. `GPMP-9K`).
   - One-click copy invite link (`?room=GPMP-9K`) for quick WhatsApp / Discord / Messenger sharing.
   - Practice bot support: Host can add simulated Sri Lankan AI players (*"Nimal Bot"*, *"Kamal Bot"*) to test or play solo anytime!

2. **Letter Roulette Spin Animation (A–Z)**:
   - Round begins with a dramatic 3-2-1 countdown + spinning alphabet ticker that locks onto a random letter (e.g. 'B') with mechanical sound effects.

3. **6 Classic Categories & 3-Minute Timer**:
   - 👧 **Girl Name** (ගෑනු ළමයා)
   - 👦 **Boy Name** (පිරිමි ළමයා)
   - 🌺 **Flower Name** (මල්)
   - 🍍 **Fruit Name** (පළතුරු)
   - 🥦 **Vegetable Name** (එළවළු)
   - 🏡 **Village / City Name** (ගම / නගරය)
   - Live client validation: Instant feedback confirming that input begins with the designated round letter.

4. **The "FINISH" Panic Button & 60-Second Sudden Death**:
   - Any player who fills all 6 categories unlocks the glowing, flaming **"FINISH"** button.
   - Hitting FINISH immediately cuts all remaining timers down to **60 seconds** across the entire room!
   - Auditory & visual panic mode triggers with red alert banners and siren sound effects.

5. **Automated Verification & Duplicate Split-Scoring**:
   - **Unique Valid Answer**: **10 Points**.
   - **Duplicate Answers**: 10 Points divided equally among all players with the identical word (2 players = 5 pts each, 3 players = 3.3 pts each, 5 players = 2 pts each).
   - **Empty or Invalid**: 0 Points.
   - **Manual Overrule**: Players/Host can toggle ✅ or ❌ on any cell for local nicknames or unique village names to recalculate scores live.

6. **Dynamic Leaderboard & Grand Finale**:
   - Standings and rank deltas updated after every round.
   - After Round 10: 🏆 **"Ultimate Mastermind" Trophy** + golden confetti celebration + 1st, 2nd, 3rd podium!

7. **Live Global Statistics Dashboard**:
   - 🟢 **Live Online Players Counter** (live WebSocket presence).
   - ⚡ **Total Rounds & Matches Played** tracked persistently across all players.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- npm (v9+)

### 2. Run the App
```bash
# Start the full-stack server (serves both API & Frontend on http://localhost:4000)
npm start
```

Open your browser at:
👉 **`http://localhost:4000`**

### 3. Development Mode (Optional)
To run frontend and backend with hot-reloading:
```bash
# Terminal 1: Backend Watch
npm run server

# Terminal 2: Vite Dev Server
npm run client
```

### 4. Run Automated Tests
```bash
npm test
```
