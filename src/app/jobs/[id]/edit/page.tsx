import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { JobForm } from "../../JobForm";
import { updateJob } from "../../actions";

export default async function EditJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [job, customers] = await Promise.all([
    prisma.job.findUnique({ where: { id } }),
    prisma.customer.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!job) notFound();

  return (
    <div>
      <PageHeader title={`Edit ${job.title}`} />
      <JobForm
        action={updateJob.bind(null, job.id)}
        job={job}
        customers={customers}
        cancelHref={`/jobs/${job.id}`}
      />
    </div>
  );
}
