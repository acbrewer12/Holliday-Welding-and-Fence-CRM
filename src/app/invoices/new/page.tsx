import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { InvoiceForm } from "../InvoiceForm";
import { createInvoice } from "../actions";

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ jobId?: string }>;
}) {
  const { jobId } = await searchParams;
  const jobs = await prisma.job.findMany({
    orderBy: { createdAt: "desc" },
    include: { customer: true },
  });

  return (
    <div>
      <PageHeader title="New invoice" />
      <InvoiceForm
        action={createInvoice}
        jobs={jobs}
        defaultJobId={jobId}
        cancelHref={jobId ? `/jobs/${jobId}` : "/invoices"}
      />
    </div>
  );
}
