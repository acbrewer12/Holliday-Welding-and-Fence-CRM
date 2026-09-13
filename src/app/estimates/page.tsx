import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader, LinkButton, Table, Th, Td, Badge, EmptyState } from "@/components/ui";
import { ESTIMATE_STATUS_COLORS, ESTIMATE_STATUS_LABELS } from "@/lib/status";
import { formatCurrency, formatDate } from "@/lib/format";
import { sumTotal } from "@/lib/totals";

export const dynamic = "force-dynamic";

export default async function EstimatesPage() {
  const estimates = await prisma.estimate.findMany({
    orderBy: { createdAt: "desc" },
    include: { job: { include: { customer: true } }, items: true },
  });

  return (
    <div>
      <PageHeader
        title="Estimates"
        subtitle={`${estimates.length} estimate${estimates.length === 1 ? "" : "s"}`}
        actions={<LinkButton href="/estimates/new">+ New estimate</LinkButton>}
      />

      {estimates.length === 0 ? (
        <EmptyState
          title="No estimates yet"
          description="Create an estimate from a job to quote work for a customer."
          action={<LinkButton href="/estimates/new">+ New estimate</LinkButton>}
        />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Number</Th>
              <Th>Job</Th>
              <Th>Customer</Th>
              <Th>Issued</Th>
              <Th>Total</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {estimates.map((estimate) => (
              <tr key={estimate.id} className="hover:bg-stone-50">
                <Td>
                  <Link
                    href={`/estimates/${estimate.id}`}
                    className="font-medium text-stone-900 hover:text-brand"
                  >
                    {estimate.number}
                  </Link>
                </Td>
                <Td>
                  <Link href={`/jobs/${estimate.jobId}`} className="text-stone-600 hover:text-brand">
                    {estimate.job.title}
                  </Link>
                </Td>
                <Td className="text-stone-500">{estimate.job.customer.name}</Td>
                <Td className="text-stone-500">{formatDate(estimate.issuedDate)}</Td>
                <Td className="font-medium">{formatCurrency(sumTotal(estimate.items))}</Td>
                <Td>
                  <Badge className={ESTIMATE_STATUS_COLORS[estimate.status]}>
                    {ESTIMATE_STATUS_LABELS[estimate.status]}
                  </Badge>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
