# Kintampo African Market

E-commerce platform for **Kintampo African Market** — groceries from Ghana and the Caribbean, with online ordering, Stripe payments, and store operations tooling.

## Stack

- Next.js (App Router)
- Supabase
- Stripe
- Vercel

## Local setup

```bash
cd merge
npm install
copy .env.example .env.local
# fill .env.local with your keys
npm run dev
```

Open http://localhost:3000 (or the port shown in the terminal).

## Notes

Private credentials belong in Vercel and `.env.local` only — never commit secrets.
