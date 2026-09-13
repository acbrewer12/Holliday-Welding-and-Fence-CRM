import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { InvoiceForm } from "../../InvoiceForm";
import { updateInvoice } from "../../actions";

export default async function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [invoice, jobs] = await Promise.all([
    prisma.invoice.findUnique({ where: { id }, include: { items: true } }),
    prisma.job.findMany({ orderBy: { createdAt: "desc" }, include: { customer: true } }),
  ]);
  if (!invoice) notFound();

  return (
    <div>
      <PageHeader title={`Edit ${invoice.number}`} />
      <InvoiceForm
        action={updateInvoice.bind(null, invoice.id)}
        invoice={invoice}
        items={invoice.items}
        jobs={jobs}
        cancelHref={`/invoices/${invoice.id}`}
      />
    </div>
  );
}
