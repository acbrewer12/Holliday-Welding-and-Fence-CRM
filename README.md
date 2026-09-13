# Holliday Welding & Fence CRM

A CRM for managing customers, jobs, estimates, invoices, materials, and scheduling for a welding and fence contracting business.

## Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript + React 19
- [Prisma](https://www.prisma.io) ORM with SQLite (file-based database, no external DB server needed)
- [Tailwind CSS](https://tailwindcss.com) v4
- Server Actions for all mutations (no separate API layer)

## Features

- **Customers** — contact info, addresses, notes, and a list of their jobs
- **Jobs** — track work through a status pipeline (Lead → Quoted → Scheduled → In Progress → Completed/Cancelled), by type (Welding, Fence, Repair, Other)
- **Estimates** — line-item quotes per job, with one-click conversion to an invoice
- **Invoices** — line-item billing per job, status tracking (Draft/Sent/Paid/Overdue/Void) with automatic overdue flagging based on due date
- **Materials catalog** — reusable materials (fence panels, posts, gates, welding rod, concrete, hardware, etc.) with unit costs, attachable to jobs with quantities to track job material cost
- **Scheduling** — agenda-style schedule of crew assignments and site visits, optionally linked to a job
- **Dashboard** — active job count, outstanding/overdue invoice totals, upcoming schedule, and recently updated jobs

## Getting started

Install dependencies:

```bash
npm install
```

Copy the environment file (defaults to a local SQLite file):

```bash
cp .env.example .env
```

Create the database and apply migrations:

```bash
npm run db:migrate
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
| `npm run build`       | Generate the Prisma client and build for production |
| `npm run start`       | Start the production server                        |
| `npm run lint`        | Run ESLint                                          |
| `npm run db:migrate`  | Create/apply a Prisma migration                     |
| `npm run db:generate` | Regenerate the Prisma client                        |
| `npm run db:seed`     | Reset and seed the database with sample data        |
| `npm run db:studio`   | Open Prisma Studio to browse/edit data directly     |

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

- The database is a local SQLite file (`prisma/dev.db`), ignored by git. Each environment creates its own via `npm run db:migrate`.
- Estimate and invoice numbers are auto-generated (`EST-YYYY-####`, `INV-YYYY-####`).
