import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  PageHeader,
  LinkButton,
  Button,
  Card,
  Badge,
  Table,
  Th,
  Td,
} from "@/components/ui";
import { ConfirmSubmitButton } from "@/components/ConfirmSubmitButton";
import { ESTIMATE_STATUS_COLORS, ESTIMATE_STATUS_LABELS } from "@/lib/status";
import { formatCurrency, formatDate } from "@/lib/format";
import { sumTotal, lineTotal } from "@/lib/totals";
import { deleteEstimate, convertEstimateToInvoice } from "../actions";

export default async function EstimateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const estimate = await prisma.estimate.findUnique({
    where: { id },
    include: {
      items: true,
      job: { include: { customer: true } },
      invoices: true,
    },
  });

  if (!estimate) notFound();

  const total = sumTotal(estimate.items);

  return (
    <div>
      <PageHeader
        title={estimate.number}
        subtitle={
          <>
            <Link href={`/jobs/${estimate.jobId}`} className="text-brand hover:underline">
              {estimate.job.title}
            </Link>
            {" · "}
            {estimate.job.customer.name}
          </>
        }
        actions={
          <>
            <Badge className={ESTIMATE_STATUS_COLORS[estimate.status]}>
              {ESTIMATE_STATUS_LABELS[estimate.status]}
            </Badge>
            <form action={convertEstimateToInvoice.bind(null, estimate.id)}>
              <Button type="submit" variant="secondary">
                Convert to invoice
              </Button>
            </form>
            <LinkButton href={`/estimates/${estimate.id}/edit`} variant="secondary">
              Edit
            </LinkButton>
            <form action={deleteEstimate.bind(null, estimate.id)}>
              <ConfirmSubmitButton confirmMessage="Delete this estimate? This cannot be undone.">
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
              {estimate.items.map((item) => (
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

          {estimate.notes && (
            <Card className="p-5">
              <h2 className="text-sm font-semibold text-stone-900 mb-2">Notes</h2>
              <p className="text-sm text-stone-700 whitespace-pre-wrap">{estimate.notes}</p>
            </Card>
          )}
        </div>

        <Card className="p-5 h-fit space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-stone-500">Issued</span>
            <span className="text-stone-900">{formatDate(estimate.issuedDate)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Expires</span>
            <span className="text-stone-900">{formatDate(estimate.expiryDate)}</span>
          </div>
          <div className="flex justify-between border-t border-stone-200 pt-3 font-semibold">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
          {estimate.invoices.length > 0 && (
            <div className="border-t border-stone-200 pt-3">
              <p className="text-stone-500 mb-1">Linked invoices</p>
              {estimate.invoices.map((inv) => (
                <Link
                  key={inv.id}
                  href={`/invoices/${inv.id}`}
                  className="block text-brand hover:underline"
                >
                  {inv.number}
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
