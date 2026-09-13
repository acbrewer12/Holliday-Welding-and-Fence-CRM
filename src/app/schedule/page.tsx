import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader, LinkButton, Card, EmptyState } from "@/components/ui";
import { ConfirmSubmitButton } from "@/components/ConfirmSubmitButton";
import { formatDate } from "@/lib/format";
import { deleteScheduleEvent } from "./actions";

function timeRange(start: Date, end: Date) {
  const fmt = (d: Date) =>
    new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(d);
  const sameTime = start.getTime() === end.getTime();
  return sameTime ? fmt(start) : `${fmt(start)} – ${fmt(end)}`;
}

export default async function SchedulePage() {
  const events = await prisma.scheduleEvent.findMany({
    orderBy: { start: "asc" },
    include: { job: { include: { customer: true } } },
  });

  const groups = new Map<string, typeof events>();
  for (const event of events) {
    const key = formatDate(event.start);
    const list = groups.get(key) ?? [];
    list.push(event);
    groups.set(key, list);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div>
      <PageHeader
        title="Schedule"
        subtitle={`${events.length} event${events.length === 1 ? "" : "s"}`}
        actions={<LinkButton href="/schedule/new">+ New event</LinkButton>}
      />

      {events.length === 0 ? (
        <EmptyState
          title="Nothing scheduled"
          description="Add crew assignments, site visits, and installs to the schedule."
          action={<LinkButton href="/schedule/new">+ New event</LinkButton>}
        />
      ) : (
        <div className="space-y-6">
          {[...groups.entries()].map(([dateLabel, dayEvents]) => {
            const isPast = new Date(dayEvents[0].start) < today;
            return (
              <div key={dateLabel}>
                <h2
                  className={`text-sm font-semibold mb-2 ${
                    isPast ? "text-stone-400" : "text-stone-900"
                  }`}
                >
                  {dateLabel}
                </h2>
                <div className="space-y-2">
                  {dayEvents.map((event) => (
                    <Card
                      key={event.id}
                      className={`p-4 flex flex-wrap items-center justify-between gap-3 ${
                        isPast ? "opacity-60" : ""
                      }`}
                    >
                      <div>
                        <p className="font-medium text-stone-900">{event.title}</p>
                        <p className="text-xs text-stone-500 mt-0.5">
                          {timeRange(event.start, event.end)}
                          {event.crew ? ` · ${event.crew}` : ""}
                          {event.job && (
                            <>
                              {" · "}
                              <Link
                                href={`/jobs/${event.job.id}`}
                                className="text-brand hover:underline"
                              >
                                {event.job.customer.name} — {event.job.title}
                              </Link>
                            </>
                          )}
                        </p>
                        {event.notes && (
                          <p className="text-xs text-stone-500 mt-1">{event.notes}</p>
                        )}
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Link
                          href={`/schedule/${event.id}/edit`}
                          className="text-xs font-medium text-stone-600 hover:text-brand"
                        >
                          Edit
                        </Link>
                        <form action={deleteScheduleEvent.bind(null, event.id)}>
                          <ConfirmSubmitButton
                            confirmMessage="Remove this event from the schedule?"
                            variant="ghost"
                          >
                            <span className="text-xs font-medium text-red-600">Remove</span>
                          </ConfirmSubmitButton>
                        </form>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
