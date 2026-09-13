import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { EstimateForm } from "../EstimateForm";
import { createEstimate } from "../actions";

export default async function NewEstimatePage({
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
      <PageHeader title="New estimate" />
      <EstimateForm
        action={createEstimate}
        jobs={jobs}
        defaultJobId={jobId}
        cancelHref={jobId ? `/jobs/${jobId}` : "/estimates"}
      />
    </div>
  );
}
