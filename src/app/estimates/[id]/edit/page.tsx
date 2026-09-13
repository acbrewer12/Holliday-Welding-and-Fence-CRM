import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { EstimateForm } from "../../EstimateForm";
import { updateEstimate } from "../../actions";

export default async function EditEstimatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [estimate, jobs] = await Promise.all([
    prisma.estimate.findUnique({ where: { id }, include: { items: true } }),
    prisma.job.findMany({ orderBy: { createdAt: "desc" }, include: { customer: true } }),
  ]);
  if (!estimate) notFound();

  return (
    <div>
      <PageHeader title={`Edit ${estimate.number}`} />
      <EstimateForm
        action={updateEstimate.bind(null, estimate.id)}
        estimate={estimate}
        items={estimate.items}
        jobs={jobs}
        cancelHref={`/estimates/${estimate.id}`}
      />
    </div>
  );
}
