import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { ScheduleForm } from "../ScheduleForm";
import { createScheduleEvent } from "../actions";

export default async function NewScheduleEventPage({
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
      <PageHeader title="New schedule event" />
      <ScheduleForm
        action={createScheduleEvent}
        jobs={jobs}
        defaultJobId={jobId}
        cancelHref={jobId ? `/jobs/${jobId}` : "/schedule"}
      />
    </div>
  );
}
