import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader, LinkButton, Card, Badge, Table, Th, Td } from "@/components/ui";
import { ConfirmSubmitButton } from "@/components/ConfirmSubmitButton";
import { InvoiceStatusForm } from "../InvoiceStatusForm";
import { INVOICE_STATUS_COLORS } from "@/lib/status";
import { formatCurrency, formatDate } from "@/lib/format";
import { sumTotal, lineTotal, isPastDue } from "@/lib/totals";
import { deleteInvoice } from "../actions";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      items: true,
      job: { include: { customer: true } },
      estimate: true,
    },
  });

  if (!invoice) notFound();

  const total = sumTotal(invoice.items);
  const overdue = isPastDue(invoice.dueDate, invoice.status);

  return (
    <div>
      <PageHeader
        title={invoice.number}
        subtitle={
          <>
            <Link href={`/jobs/${invoice.jobId}`} className="text-brand hover:underline">
              {invoice.job.title}
            </Link>
            {" · "}
            {invoice.job.customer.name}
          </>
        }
        actions={
          <>
            {overdue && (
              <Badge className={INVOICE_STATUS_COLORS.OVERDUE}>Overdue</Badge>
            )}
            <InvoiceStatusForm invoiceId={invoice.id} status={invoice.status} />
            <LinkButton href={`/invoices/${invoice.id}/edit`} variant="secondary">
              Edit
            </LinkButton>
            <form action={deleteInvoice.bind(null, invoice.id)}>
              <ConfirmSubmitButton confirmMessage="Delete this invoice? This cannot be undone.">
                Delete
              </ConfirmSubmitButton>
            </form>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Table>
            <thead>
              <tr>
                <Th>Description</Th>
                <Th>Qty</Th>
                <Th>Unit</Th>
                <Th>Unit price</Th>
                <Th>Total</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {invoice.items.map((item) => (
                <tr key={item.id}>
                  <Td>{item.description}</Td>
                  <Td>{item.quantity}</Td>
                  <Td>{item.unit}</Td>
                  <Td>{formatCurrency(item.unitPrice)}</Td>
                  <Td className="font-medium">{formatCurrency(lineTotal(item))}</Td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-stone-200">
                <td colSpan={3} />
                <Td className="text-right font-semibold">Total</Td>
                <Td className="font-semibold">{formatCurrency(total)}</Td>
              </tr>
            </tfoot>
          </Table>

          {invoice.notes && (
            <Card className="p-5">
              <h2 className="text-sm font-semibold text-stone-900 mb-2">Notes</h2>
              <p className="text-sm text-stone-700 whitespace-pre-wrap">{invoice.notes}</p>
            </Card>
          )}
        </div>

        <Card className="p-5 h-fit space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-stone-500">Issued</span>
            <span className="text-stone-900">{formatDate(invoice.issuedDate)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Due</span>
            <span className={overdue ? "text-red-600 font-medium" : "text-stone-900"}>
              {formatDate(invoice.dueDate)}
            </span>
          </div>
          <div className="flex justify-between border-t border-stone-200 pt-3 font-semibold">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
          {invoice.estimate && (
            <div className="border-t border-stone-200 pt-3">
              <p className="text-stone-500 mb-1">From estimate</p>
              <Link
                href={`/estimates/${invoice.estimate.id}`}
                className="text-brand hover:underline"
              >
                {invoice.estimate.number}
              </Link>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
