# Lovely Queen African Market

Production e-commerce platform for **Lovely Queen African Market** — African and Caribbean groceries with online ordering, Stripe payments, and store operations tooling.

**Live site:** [lovely-queen-market.vercel.app](https://lovely-queen-market.vercel.app)

**Store location:** 1668 E Dublin Granville Rd, Columbus, OH 43229 · (614) 446-0893

---

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16 (App Router), React 19, Tailwind CSS 4 |
| Database & auth | Supabase (PostgreSQL, RLS, Auth) |
| Payments | Stripe (Payment Element, webhooks) |
| Email | Gmail SMTP, Postmark, or generic SMTP |
| Hosting | Vercel |
| Shipping | USPS Labels API (optional) + printable packing slips |

---

## Quick start (local)

```bash
git clone https://github.com/t4thick/chuck-and-rich.git
cd lovely-queen-market
cp .env.example .env.local
# Fill in Supabase + Stripe keys (see docs/PROJECT.md)
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Admin: `/admin/login`.

Validate configuration:

```bash
npm run check:env
npm run ci          # lint + typecheck + build
```

---

## Documentation

| Document | Contents |
|----------|----------|
| [docs/PROJECT.md](docs/PROJECT.md) | Architecture, features, env vars, deployment, operations |
| [docs/ADMIN.md](docs/ADMIN.md) | Admin dashboard, orders, shipping, reports |
| [.env.example](.env.example) | Full environment variable reference |

---

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local development server |
| `npm run build` | Production build |
| `npm run ci` | Lint, typecheck, and build (CI parity) |
| `npm run check:env` | Validate required env vars |
| `npm run test:e2e` | Playwright end-to-end tests |

---

## Repository

Maintained by Lovely Queen African Market. Private operational credentials belong in Vercel and `.env.local` only — never commit secrets.
