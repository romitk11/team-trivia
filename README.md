# Team Trivia

A free, self-hosted Kahoot-style trivia game built with Next.js and Upstash Redis. Players join a live game with a room code or QR code, answer on their own device, and get scored on both correctness and speed. Hosts run the game from a shared "big screen" view meant to be projected or screen-shared.

Live at: https://team-trivia-chi.vercel.app

## Features

- **Host flow**: passcode-gated login → dashboard of question sets → live game control screen with QR code, countdown timer, reveal/next controls, and a real-time leaderboard.
- **Player flow**: join via code or QR → pick a name and one of 16 characters → answer on your own screen (full question text + colored answer buttons) → see your running score at all times.
- **Scoring**: speed-weighted — a correct answer awards more points the faster it's submitted, down to a 50% floor, and 0 for wrong or late answers.
- **Live leaderboard**: top 5 shown after every question, with green/red arrows indicating rank changes since the previous question, medals for the top 3, and a podium + confetti on the final screen.
- **Question set editor**: add/edit/reorder/delete questions, set a per-question time limit (25s/30s) and an optional image, and set a lobby announcement banner (e.g. "🏆 Top three win a prize!").
- **No accounts required** for players — just a room code and a name.

## Tech stack

- **Next.js 16** (App Router, TypeScript, Tailwind CSS v4)
- **Upstash Redis** (via Vercel Marketplace) for all persistent and live-game state
- **Live sync via polling** — no WebSockets. Clients poll `GET /api/rooms/[code]/state` (~1s during an active question, ~1.8s otherwise); the countdown timer renders client-side from a server-issued timestamp so it stays smooth regardless of poll cadence.
- Deployed on **Vercel**

## Project structure

```
app/
  page.tsx                    Landing page (Join / Host)
  join/page.tsx                Player join form (name + character picker)
  play/[code]/page.tsx          Player game screen (question/results/final)
  host/login/page.tsx           Host passcode gate
  host/dashboard/page.tsx       List/create question sets
  host/sets/[id]/edit/page.tsx  Question set editor
  host/game/[code]/page.tsx     Host's live game control screen
  api/
    host/login/                 Passcode auth → sets a signed session cookie
    qsets/                      Question set CRUD (host-only)
    rooms/                      Room creation + join/answer/state (public)
    rooms/[code]/{start,reveal,next,end}/  Host-only game controls
  components/                   AnswerButton, Countdown, Leaderboard, Podium, Confetti
  hooks/                        useRoomState (polling), useServerCountdown, useRankHistory
lib/
  types.ts                      Shared types (Question, QuestionSet, Player, RoomMeta, ...)
  redis.ts                      All Redis read/write helpers
  scoring.ts                    Speed-based point calculation
  auth.ts                       Host session JWT + passcode check
  avatars.ts                    Player character options
  seed-questions.ts             Pre-loaded "Team Trivia — Launch Set" (30 questions)
proxy.ts                        Next.js 16 proxy (formerly middleware) — gates /host/** and
                                 host-only API routes behind the passcode session cookie
```

## Data model (Redis)

- `qset:ids` (Set) + `qset:{id}` (JSON) — question sets, persistent, host-editable.
- `room:{code}:meta` (Hash) — room status, current question index, question start/end timestamps.
- `room:{code}:players` (Hash) — playerId → `{name, avatar, score}`.
- `room:{code}:answers:{questionIndex}` (Hash) — playerId → `{optionId, correct, pointsAwarded}`.
- Rooms carry a 12h TTL and clean themselves up automatically; question sets persist indefinitely.

## Running locally

```bash
npm install
vercel env pull .env.local   # pulls KV_REST_API_*, HOST_PASSCODE, SESSION_SECRET
npm run dev
```

Requires these env vars (see `.env.local` once pulled from Vercel):

| Variable | Purpose |
|---|---|
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` | Upstash Redis REST credentials (provisioned via Vercel Marketplace) |
| `HOST_PASSCODE` | Shared password to access `/host/**` |
| `SESSION_SECRET` | Random secret used to sign the host session JWT |

## Deploying

```bash
vercel link                        # first time only
vercel integration add upstash/upstash-kv   # first time only, provisions Redis
vercel env add HOST_PASSCODE production
vercel env add SESSION_SECRET production
vercel deploy --prod
```

The question set list auto-seeds a 30-question launch set the first time `/api/qsets` is called against an empty database, so there's nothing to seed manually on a fresh deploy.
