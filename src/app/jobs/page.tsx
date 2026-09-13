import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader, LinkButton, Table, Th, Td, Badge, EmptyState } from "@/components/ui";
import {
  JOB_STATUS_COLORS,
  JOB_STATUS_LABELS,
  JOB_STATUS_ORDER,
  JOB_TYPE_LABELS,
} from "@/lib/status";
import { formatDate } from "@/lib/format";
import type { JobStatus } from "@prisma/client";

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const activeStatus =
    status && JOB_STATUS_ORDER.includes(status as JobStatus)
      ? (status as JobStatus)
      : undefined;

  const jobs = await prisma.job.findMany({
    where: activeStatus ? { status: activeStatus } : undefined,
    orderBy: { createdAt: "desc" },
    include: { customer: true },
  });

  return (
    <div>
      <PageHeader
        title="Jobs"
        subtitle={`${jobs.length} job${jobs.length === 1 ? "" : "s"}${
          activeStatus ? ` · ${JOB_STATUS_LABELS[activeStatus]}` : ""
        }`}
        actions={<LinkButton href="/jobs/new">+ New job</LinkButton>}
      />

      <div className="flex flex-wrap gap-2 mb-5">
        <Link
          href="/jobs"
          className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${
            !activeStatus
              ? "bg-stone-900 text-white ring-stone-900"
              : "bg-white text-stone-600 ring-stone-300 hover:bg-stone-50"
          }`}
        >
          All
        </Link>
        {JOB_STATUS_ORDER.map((s) => (
          <Link
            key={s}
            href={`/jobs?status=${s}`}
            className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${
              activeStatus === s
                ? "bg-stone-900 text-white ring-stone-900"
                : "bg-white text-stone-600 ring-stone-300 hover:bg-stone-50"
            }`}
          >
            {JOB_STATUS_LABELS[s]}
          </Link>
        ))}
      </div>

      {jobs.length === 0 ? (
        <EmptyState
          title="No jobs found"
          description="Create a job to start tracking estimates, materials, and scheduling."
          action={<LinkButton href="/jobs/new">+ New job</LinkButton>}
        />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Job</Th>
              <Th>Customer</Th>
              <Th>Type</Th>
              <Th>Status</Th>
              <Th>Scheduled</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {jobs.map((job) => (
              <tr key={job.id} className="hover:bg-stone-50">
                <Td>
                  <Link
                    href={`/jobs/${job.id}`}
                    className="font-medium text-stone-900 hover:text-brand"
                  >
                    {job.title}
                  </Link>
                </Td>
                <Td>
                  <Link
                    href={`/customers/${job.customerId}`}
                    className="text-stone-600 hover:text-brand"
                  >
                    {job.customer.name}
                  </Link>
                </Td>
                <Td className="text-stone-500">{JOB_TYPE_LABELS[job.type]}</Td>
                <Td>
                  <Badge className={JOB_STATUS_COLORS[job.status]}>
                    {JOB_STATUS_LABELS[job.status]}
                  </Badge>
                </Td>
                <Td className="text-stone-500">
                  {job.scheduledStart ? formatDate(job.scheduledStart) : "—"}
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
