import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { ScheduleForm } from "../../ScheduleForm";
import { updateScheduleEvent } from "../../actions";

export default async function EditScheduleEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [event, jobs] = await Promise.all([
    prisma.scheduleEvent.findUnique({ where: { id } }),
    prisma.job.findMany({ orderBy: { createdAt: "desc" }, include: { customer: true } }),
  ]);
  if (!event) notFound();

  return (
    <div>
      <PageHeader title={`Edit ${event.title}`} />
      <ScheduleForm
        action={updateScheduleEvent.bind(null, event.id)}
        event={event}
        jobs={jobs}
        cancelHref="/schedule"
      />
    </div>
  );
}
