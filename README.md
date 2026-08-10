# gamedverygood

A Thai/English gaming **top-up portal** (เติมเกม), news hub, and game tools —
built from the Claude Design prototype `project/Gamedverygood Modern.dc.html`.

Glassmorphism visual language, Day/Night themes, animated aurora background, a
StreamVerse-style game browser, a live "ราคาเติมวันนี้" price board, coupons /
flash-sale / favorites, a QR checkout flow, membership + rewards, and an AI chat
assistant ("Vera") backed by the Claude API with a keyword fallback.

Stack: **React 18 + TypeScript + Vite**, a lightweight **Zustand** store, and a
small **Express** proxy for the Claude API.

## Quick start

```bash
npm install
npm run dev      # web (Vite, :5173) + chat proxy (Express, :8787) together
```

Open http://localhost:5173.

To enable the real Claude-powered chat, copy `.env.example` to `.env` and set
your key:

```bash
cp .env.example .env
# then edit .env:
ANTHROPIC_API_KEY=sk-ant-...
```

Without a key the site works fully — "Vera" transparently falls back to a
built-in keyword/intent bot (answers top-up / order / promo questions and shows
game & order cards).

## Scripts

| command           | what it does                                        |
| ----------------- | --------------------------------------------------- |
| `npm run dev`     | Vite dev server + chat proxy (concurrently)         |
| `npm run server`  | chat proxy only (`server/index.js`, port 8787)      |
| `npm run build`   | typecheck + production build to `dist/`             |
| `npm run preview` | serve the production build                          |
| `npm run typecheck` | TypeScript only                                   |
| `npm run cf:dev`  | build + run the Cloudflare Worker locally           |
| `npm run deploy`  | build + deploy to Cloudflare                        |

## Deploy to Cloudflare

The whole app deploys as **one Cloudflare Worker**: the Vite build (`dist/`) is
served as static assets, and `worker/index.js` handles `/api/chat` +
`/api/health` (replacing `server/index.js`, which is only used for local
`npm run dev`). Config lives in `wrangler.jsonc`.

```bash
npx wrangler login                          # once — opens browser OAuth
npx wrangler secret put ANTHROPIC_API_KEY   # once — enables the real AI chat
npm run deploy
```

The deploy prints your live URL (`https://gamedverygood.<your-subdomain>.workers.dev`).
Skipping the secret still works — Vera falls back to the keyword bot, same as
local. To change the chat model, edit `ANTHROPIC_MODEL` in `wrangler.jsonc`.
Custom domains can be attached in the Cloudflare dashboard under
Workers → gamedverygood → Settings → Domains & Routes.

To preview the production Worker locally before deploying: `npm run cf:dev`
(serves the built site + API on the Workers runtime, no login needed).

## Project layout

```
src/
  data.ts              static content (games, packages, news, …)
  store.ts             Zustand store — state, actions, chat bot + AI proxy call
  vals.tsx             computeVals() — all derived view-models (ported renderVals)
  css.ts               inline CSS-string → React style-object helper
  App.tsx              shell: aurora bg, promo marquee, nav, routes, chat, timers
  components/          Nav, PromoBar, LoginModal, Chat, Toast, BottomNav, Footer,
                       ToolModal, PosterCard, ImageSlot, Logo
  routes/              Home, Catalog, Topup, History, Tools, News, Article, Detail
server/index.js        Claude API proxy for local dev (POST /api/chat, Express)
worker/index.js        Cloudflare Worker: static site + /api/chat in production
wrangler.jsonc         Cloudflare deploy config
```

### Images

Game art / banners render as branded gradient placeholders by default (real box
art is copyrighted). Each `<ImageSlot>` accepts a dropped image — drag a file
onto any card/banner, or double-click to browse — and persists it in
`localStorage`. Drop your own licensed art to replace the gradients.

## Design source

The original design bundle from Claude Design is kept for reference:

- `project/` — the exported HTML/CSS/JS prototypes and assets
- `chats/` — the design conversation transcripts that drove the iterations

`Gamedverygood Modern.dc.html` (the final, most-iterated design) is the one
implemented here.

## Notes

- **Language:** Thai-first with English mixed in, matching the design.
- **Theme:** defaults to Night; toggle in the header, persisted in `localStorage`.
- The prototype's Claude-Design–specific runtime (`support.js`, `image-slot.js`,
  the `<x-dc>` template engine) is **not** used — the UI was reimplemented as
  idiomatic React while matching the prototype's visual output.
