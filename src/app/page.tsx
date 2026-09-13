import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, Badge, LinkButton } from "@/components/ui";
import {
  JOB_STATUS_COLORS,
  JOB_STATUS_LABELS,
  INVOICE_STATUS_COLORS,
  INVOICE_STATUS_LABELS,
} from "@/lib/status";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/format";
import { sumTotal, isPastDue } from "@/lib/totals";

export const dynamic = "force-dynamic";

const ACTIVE_STATUSES = ["LEAD", "QUOTED", "SCHEDULED", "IN_PROGRESS"] as const;

export default async function DashboardPage() {
  const [activeJobs, upcomingEvents, openInvoices, recentJobs] = await Promise.all([
    prisma.job.count({ where: { status: { in: [...ACTIVE_STATUSES] } } }),
    prisma.scheduleEvent.findMany({
      where: { start: { gte: new Date() } },
      orderBy: { start: "asc" },
      take: 5,
      include: { job: { include: { customer: true } } },
    }),
    prisma.invoice.findMany({
      where: { status: { in: ["SENT", "OVERDUE"] } },
      include: { items: true, job: { include: { customer: true } } },
    }),
    prisma.job.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: { customer: true },
    }),
  ]);

  const outstandingTotal = openInvoices.reduce((sum, inv) => sum + sumTotal(inv.items), 0);
  const overdueInvoices = openInvoices.filter((inv) => isPastDue(inv.dueDate, inv.status));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
          Welcome back
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          Here&apos;s what&apos;s happening across Holliday Welding &amp; Fence.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card className="p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
            Active jobs
          </p>
          <p className="mt-2 text-3xl font-semibold text-stone-900">{activeJobs}</p>
          <Link href="/jobs" className="mt-2 inline-block text-sm text-brand hover:underline">
            View jobs →
          </Link>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
            Outstanding invoices
          </p>
          <p className="mt-2 text-3xl font-semibold text-stone-900">
            {formatCurrency(outstandingTotal)}
          </p>
          <p className="mt-2 text-sm text-stone-500">
            {openInvoices.length} open
            {overdueInvoices.length > 0 && (
              <span className="text-red-600"> · {overdueInvoices.length} overdue</span>
            )}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
            Upcoming schedule
          </p>
          <p className="mt-2 text-3xl font-semibold text-stone-900">{upcomingEvents.length}</p>
          <Link href="/schedule" className="mt-2 inline-block text-sm text-brand hover:underline">
            View schedule →
          </Link>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-stone-900">Upcoming schedule</h2>
            <LinkButton href="/schedule/new" variant="secondary">
              + New event
            </LinkButton>
          </div>
          {upcomingEvents.length === 0 ? (
            <Card className="p-5 text-sm text-stone-500">Nothing scheduled yet.</Card>
          ) : (
            <div className="space-y-2">
              {upcomingEvents.map((event) => (
                <Card key={event.id} className="p-4">
                  <p className="font-medium text-stone-900 text-sm">{event.title}</p>
                  <p className="text-xs text-stone-500 mt-1">
                    {formatDateTime(event.start)}
                    {event.job && (
                      <>
                        {" · "}
                        <Link href={`/jobs/${event.job.id}`} className="text-brand hover:underline">
                          {event.job.customer.name}
                        </Link>
                      </>
                    )}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-stone-900">Recently updated jobs</h2>
            <LinkButton href="/jobs/new" variant="secondary">
              + New job
            </LinkButton>
          </div>
          {recentJobs.length === 0 ? (
            <Card className="p-5 text-sm text-stone-500">No jobs yet.</Card>
          ) : (
            <div className="space-y-2">
              {recentJobs.map((job) => (
                <Link key={job.id} href={`/jobs/${job.id}`} className="block">
                  <Card className="p-4 hover:border-brand transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-stone-900 text-sm">{job.title}</p>
                        <p className="text-xs text-stone-500 mt-1">
                          {job.customer.name} · Updated {formatDate(job.updatedAt)}
                        </p>
                      </div>
                      <Badge className={JOB_STATUS_COLORS[job.status]}>
                        {JOB_STATUS_LABELS[job.status]}
                      </Badge>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {overdueInvoices.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-semibold text-stone-900 mb-3">Overdue invoices</h2>
          <div className="space-y-2">
            {overdueInvoices.map((invoice) => (
              <Link key={invoice.id} href={`/invoices/${invoice.id}`} className="block">
                <Card className="p-4 border-red-200 hover:border-red-400 transition-colors">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-stone-900 text-sm">{invoice.number}</p>
                      <p className="text-xs text-stone-500 mt-1">
                        {invoice.job.customer.name} · Due {formatDate(invoice.dueDate)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-stone-900">
                        {formatCurrency(sumTotal(invoice.items))}
                      </span>
                      <Badge className={INVOICE_STATUS_COLORS.OVERDUE}>
                        {INVOICE_STATUS_LABELS.OVERDUE}
                      </Badge>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
