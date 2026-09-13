# Holliday Welding & Fence CRM

A CRM for managing customers, jobs, estimates, invoices, materials, and scheduling for a welding and fence contracting business.

**Live (for now):** https://holliday-crm.onrender.com — deployed on Render's free tier (web service + Postgres). Free-tier services spin down after inactivity, so the first request after a while may take ~30s to wake up. Render's free Postgres also expires 30 days after creation unless upgraded.

## Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript + React 19
- [Prisma](https://www.prisma.io) ORM with Postgres
- [Tailwind CSS](https://tailwindcss.com) v4
- Server Actions for all mutations (no separate API layer)

This app cannot run on GitHub Pages: Pages only serves static files, and every page here does live server-side database reads and writes (customers, jobs, invoices, etc. are all backed by Postgres via Prisma, with forms wired to Next.js Server Actions).

## Features

- **Customers** — contact info, addresses, notes, and a list of their jobs
- **Jobs** — track work through a status pipeline (Lead → Quoted → Scheduled → In Progress → Completed/Cancelled), by type (Welding, Fence, Repair, Other)
- **Estimates** — line-item quotes per job, with one-click conversion to an invoice
- **Invoices** — line-item billing per job, status tracking (Draft/Sent/Paid/Overdue/Void) with automatic overdue flagging based on due date
- **Materials catalog** — reusable materials (fence panels, posts, gates, welding rod, concrete, hardware, etc.) with unit costs, attachable to jobs with quantities to track job material cost
- **Scheduling** — agenda-style schedule of crew assignments and site visits, optionally linked to a job
- **Dashboard** — active job count, outstanding/overdue invoice totals, upcoming schedule, and recently updated jobs

## Getting started

You'll need a Postgres database (local, Docker, or a free instance from Render/Supabase/Neon/etc).

Install dependencies:

```bash
npm install
```

Copy the environment file and set `DATABASE_URL` to your Postgres connection string:

```bash
cp .env.example .env
```

Push the schema to the database:

```bash
npm run db:push
```

Seed sample data (customers, jobs, estimates, invoices, materials, schedule):

```bash
npm run db:seed
```

Run the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script              | Description                                      |
| -------------------- | ------------------------------------------------- |
| `npm run dev`         | Start the Next.js dev server                       |
| `npm run build`       | Generate the Prisma client, push the schema, and build for production |
| `npm run start`       | Start the production server                        |
| `npm run lint`        | Run ESLint                                          |
| `npm run db:push`     | Push `schema.prisma` to the database without a migration file |
| `npm run db:migrate`  | Create/apply a Prisma migration (needs a reachable dev database) |
| `npm run db:generate` | Regenerate the Prisma client                        |
| `npm run db:seed`     | Reset and seed the database with sample data        |
| `npm run db:studio`   | Open Prisma Studio to browse/edit data directly     |

## Deployment (Render)

The live instance is deployed as:

- A free **Postgres** instance (`holliday-crm-db`)
- A free **web service** (`holliday-crm`) built from this repo's `claude/crm-builder-chysba` branch, with `DATABASE_URL` set to the database's Internal Database URL and build command `npm install && npm run build` (which runs `prisma db push` against Postgres before `next build`)

Because Render's free plan doesn't include dashboard Shell access, there's a token-protected route for seeding the deployed database instead of running `npm run db:seed` directly:

```bash
curl -X POST https://<your-app>.onrender.com/api/seed -H "x-seed-token: <SEED_TOKEN>"
```

`SEED_TOKEN` is set as an environment variable on the web service (not committed to the repo). The route is idempotent — it skips seeding if any customers already exist — unless you pass `?force=true`, which wipes and reseeds.

**Known limitation:** pages that list data (dashboard, customers, estimates, invoices, materials, schedule) are marked `export const dynamic = "force-dynamic"` so they always read fresh from the database in production — without this, Next.js would statically prerender them at build time and they'd never reflect new data.

## Data model

Defined in `prisma/schema.prisma`:

- `Customer` → has many `Job`
- `Job` → belongs to a `Customer`; has many `Estimate`, `Invoice`, `JobMaterial`, `ScheduleEvent`
- `Estimate` / `EstimateItem` — line-item quotes; an `Estimate` can be converted into an `Invoice`
- `Invoice` / `InvoiceItem` — line-item bills, optionally linked back to the originating `Estimate`
- `Material` — catalog of reusable supplies with unit cost
- `JobMaterial` — join table attaching a `Material` to a `Job` with a quantity and the cost at the time it was added
- `ScheduleEvent` — a calendar entry, optionally linked to a `Job`

## Notes

- Estimate and invoice numbers are auto-generated (`EST-YYYY-####`, `INV-YYYY-####`).
