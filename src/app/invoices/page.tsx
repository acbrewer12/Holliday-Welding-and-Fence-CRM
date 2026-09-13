import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader, LinkButton, Table, Th, Td, Badge, EmptyState } from "@/components/ui";
import { INVOICE_STATUS_COLORS, INVOICE_STATUS_LABELS } from "@/lib/status";
import { formatCurrency, formatDate } from "@/lib/format";
import { sumTotal, isPastDue } from "@/lib/totals";

export default async function InvoicesPage() {
  const invoices = await prisma.invoice.findMany({
    orderBy: { createdAt: "desc" },
    include: { job: { include: { customer: true } }, items: true },
  });

  return (
    <div>
      <PageHeader
        title="Invoices"
        subtitle={`${invoices.length} invoice${invoices.length === 1 ? "" : "s"}`}
        actions={<LinkButton href="/invoices/new">+ New invoice</LinkButton>}
      />

      {invoices.length === 0 ? (
        <EmptyState
          title="No invoices yet"
          description="Create an invoice from a job or convert an accepted estimate."
          action={<LinkButton href="/invoices/new">+ New invoice</LinkButton>}
        />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Number</Th>
              <Th>Job</Th>
              <Th>Customer</Th>
              <Th>Due</Th>
              <Th>Total</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {invoices.map((invoice) => {
              const overdue = isPastDue(invoice.dueDate, invoice.status);
              return (
                <tr key={invoice.id} className="hover:bg-stone-50">
                  <Td>
                    <Link
                      href={`/invoices/${invoice.id}`}
                      className="font-medium text-stone-900 hover:text-brand"
                    >
                      {invoice.number}
                    </Link>
                  </Td>
                  <Td>
                    <Link href={`/jobs/${invoice.jobId}`} className="text-stone-600 hover:text-brand">
                      {invoice.job.title}
                    </Link>
                  </Td>
                  <Td className="text-stone-500">{invoice.job.customer.name}</Td>
                  <Td className={overdue ? "text-red-600 font-medium" : "text-stone-500"}>
                    {formatDate(invoice.dueDate)}
                  </Td>
                  <Td className="font-medium">{formatCurrency(sumTotal(invoice.items))}</Td>
                  <Td>
                    <Badge
                      className={
                        overdue
                          ? INVOICE_STATUS_COLORS.OVERDUE
                          : INVOICE_STATUS_COLORS[invoice.status]
                      }
                    >
                      {overdue ? "Overdue" : INVOICE_STATUS_LABELS[invoice.status]}
                    </Badge>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}
    </div>
  );
}
