# BLACKBOX
### A Cyber Mystery Game by ASTRA Association

A web-based interactive mystery game for cybersecurity events. Designed for students with **zero cybersecurity experience** — teaches concepts through discovery, not instruction.

---

## Quick Start

### 1. Clone & Install

```bash
git clone <your-repo>
cd astra-game
npm install
```

### 2. Set Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and set:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `DIRECT_URL` | Direct PostgreSQL URL (same as DATABASE_URL for most setups) |
| `ADMIN_PASSWORD` | Password for the admin dashboard at `/admin` |

### 3. Set Up Database

```bash
npx prisma db push
```

> This creates all tables. No migrations needed for initial setup.

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Production Deployment (Vercel + Neon/Supabase)

### Database Setup

1. Create a PostgreSQL database (recommended: [Neon](https://neon.tech) — free tier)
2. Copy the connection strings into your `.env`

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Set environment variables in the Vercel dashboard:
- `DATABASE_URL`
- `DIRECT_URL`  
- `ADMIN_PASSWORD`

### First Deploy

After deploying:

```bash
# Push schema to production database
npx prisma db push
```

---

## Admin Dashboard

Access the admin dashboard at `/admin`.

Login with your `ADMIN_PASSWORD`.

Features:
- View all registered teams
- See each team's progress (which challenges are complete)
- See completion times
- Reset individual team progress

---

## The 11 Challenges

Stages 1-6 are the **letter stages**: the first letter of each answer spells the final key.
Stages 7-10 are extra challenges whose answers do **not** feed the key.

| Stage | Title | Mechanic |
|---|---|---|
| 1 | THE MESSAGE | HTML comment in homepage source |
| 2 | THE ARCHIVE | Hidden text (white-on-white CSS) |
| 3 | THE SOURCE | JavaScript comment in page source |
| 4 | THE SIGNAL | Base64 decode |
| 5 | THE PARAMETER | URL query parameter manipulation |
| 6 | THE MEMORY | localStorage clue via DevTools |
| 7 | THE SCRIPT | JS variable in browser console |
| 8 | THE IMAGE | Image EXIF metadata |
| 9 | THE CIPHER | ROT13 cipher |
| 10 | THE COOKIE | Cookie clue via DevTools |
| 11 | THE KEY | First letters of stages 1-6, grouped 3-1-2 |

---

## Answers (Organizer Reference)

> **Keep this section secret from players!**

| Stage | Answer |
|---|---|
| the-message | `mirror` |
| the-archive | `index` |
| the-source | `static` |
| the-signal | `unlock` |
| the-parameter | `node` |
| the-memory | `anchor` |
| the-script | `vault` |
| the-image | `cipher` |
| the-cipher | `signal` |
| the-cookie | `ember` |
| the-key | `mis-u-na` |

Answers are validated server-side only. They are never sent to the browser.

---

## Easter Eggs

| URL | Content |
|---|---|
| `/dev` | Secret developer terminal room |
| `/null` | Cryptic NULL entity page |
| `/robots.txt` | Hints about `/null` |
| 404 pages | HTML comment Easter egg |

---

## Modifying Challenges

### To change an answer:

Edit [`lib/answers.server.ts`](./lib/answers.server.ts).

### To change challenge text/hints:

Edit [`lib/challenges.ts`](./lib/challenges.ts).

### To add a new challenge:

1. Add to `CHALLENGES` array in `lib/challenges.ts`
2. Add the correct answer to `lib/answers.server.ts`
3. Create a new page in `app/`
4. Update the routing in `app/game/page.tsx`

---

## Resetting the Game

### Reset a single team:
Use the admin dashboard at `/admin` → click RESET next to the team.

### Reset ALL teams (via database):
```bash
# Connect to your DB and run:
DELETE FROM "Progress";
DELETE FROM "HintUsage";
UPDATE "Team" SET "completedAt" = NULL;
# Or to delete all teams entirely:
DELETE FROM "Team";
```

---

## Architecture

```
app/
├── page.tsx              # Homepage + team registration
├── game/page.tsx         # Routing hub (redirects to current stage)
├── archive/page.tsx      # Stages 1, 2, 3
├── signal/page.tsx       # Stages 4, 5
├── trace/page.tsx        # Stages 6, 7
├── vault/gate/page.tsx   # Stage 8
├── vault/page.tsx        # Stage 9
├── cookie/page.tsx       # Stage 10
├── vault/final/page.tsx  # Stage 11
├── victory/page.tsx      # Victory screen
├── leaderboard/page.tsx  # Public leaderboard
├── admin/page.tsx        # Admin dashboard
├── dev/page.tsx          # Easter egg
├── null/page.tsx         # Easter egg
└── api/
    ├── team/             # Team registration + state
    ├── submit/           # Answer validation (server-side)
    ├── hint/             # Progressive hints
    ├── leaderboard/      # Public rankings
    └── admin/            # Admin-only endpoints

lib/
├── challenges.ts         # Challenge metadata (NO answers)
├── answers.server.ts     # Answers (server-only, never sent to client)
├── prisma.ts             # Database client
├── auth.ts               # Admin token validation
└── rateLimit.ts          # In-memory rate limiting

components/
└── ChallengeFrame.tsx    # Shared challenge UI wrapper
```

---

## Security Notes

- Answers are validated server-side only
- Admin API requires the `ADMIN_PASSWORD` header
- Answer submissions are rate-limited: 5 attempts/minute per team
- Teams cannot access or modify other teams' data
- No real vulnerabilities — all puzzles are intentional and sandboxed

---

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + custom CSS
- **Database**: PostgreSQL (via Prisma ORM)
- **Deployment**: Vercel (recommended)

---

## Credits

Built for **Black Box Association** cybersecurity events.  
Theme: THE LOST FILE — a digital mystery game for curious minds.

> "You didn't hack the system. You simply learned how to look at it."


**How the final key works:** the first letters of stages 1-6 (m, i, s, u, n, a) are grouped 3-1-2, giving `mis-u-na`.

**Where each clue lives:**

| Stage | Where the player finds the answer |
|---|---|
| 1 | HTML comment in the homepage source (`app/page.tsx`) |
| 2 | Hidden text on `/archive` (`index`) |
| 3 | JS comment on `/archive` (`static`) |
| 4 | Base64 string on `/signal`; decoded message starts with "Unlock" |
| 5 | `/signal?file=node` (the decoded message names the file) |
| 6 | localStorage key `null_message` on `/trace` |
| 7 | `next_clue` variable in the console on `/trace` |
| 8 | EXIF comment in `public/images/null_archive_photo.jpg` |
| 9 | ROT13 text on `/vault` (`FVTANY`) |
| 10 | Cookie named `relic` on `/cookie` |
| 11 | Combine the first letters of stages 1-6 on `/vault/final` |
