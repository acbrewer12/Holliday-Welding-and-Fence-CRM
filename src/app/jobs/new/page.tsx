import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { JobForm } from "../JobForm";
import { createJob } from "../actions";

export default async function NewJobPage({
  searchParams,
}: {
  searchParams: Promise<{ customerId?: string }>;
}) {
  const { customerId } = await searchParams;
  const customers = await prisma.customer.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div>
      <PageHeader title="New job" />
      <JobForm
        action={createJob}
        customers={customers}
        defaultCustomerId={customerId}
        cancelHref={customerId ? `/customers/${customerId}` : "/jobs"}
      />
    </div>
  );
}
