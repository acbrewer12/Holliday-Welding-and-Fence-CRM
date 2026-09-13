import { FormField, Input, Textarea, Select, Button, LinkButton } from "@/components/ui";
import { toDateTimeInputValue } from "@/lib/format";
import type { ScheduleEvent, Job, Customer } from "@prisma/client";

type JobOption = Job & { customer: Customer };

export function ScheduleForm({
  action,
  event,
  jobs,
  defaultJobId,
  cancelHref,
}: {
  action: (formData: FormData) => void;
  event?: ScheduleEvent | null;
  jobs: JobOption[];
  defaultJobId?: string;
  cancelHref: string;
}) {
  return (
    <form action={action} className="space-y-5 max-w-xl">
      <FormField label="Title" htmlFor="title">
        <Input
          id="title"
          name="title"
          required
          defaultValue={event?.title ?? ""}
          placeholder="Fence install crew - Harmon backyard"
        />
      </FormField>

      <FormField label="Job (optional)" htmlFor="jobId">
        <Select id="jobId" name="jobId" defaultValue={event?.jobId ?? defaultJobId ?? ""}>
          <option value="">No linked job</option>
          {jobs.map((job) => (
            <option key={job.id} value={job.id}>
              {job.customer.name} — {job.title}
            </option>
          ))}
        </Select>
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Start" htmlFor="start">
          <Input
            id="start"
            name="start"
            type="datetime-local"
            required
            defaultValue={toDateTimeInputValue(event?.start)}
          />
        </FormField>
        <FormField label="End" htmlFor="end">
          <Input
            id="end"
            name="end"
            type="datetime-local"
            defaultValue={toDateTimeInputValue(event?.end)}
          />
        </FormField>
      </div>

      <FormField label="Crew / assignee" htmlFor="crew">
        <Input id="crew" name="crew" defaultValue={event?.crew ?? ""} placeholder="Crew A" />
      </FormField>

      <FormField label="Notes" htmlFor="notes">
        <Textarea id="notes" name="notes" rows={3} defaultValue={event?.notes ?? ""} />
      </FormField>

      <div className="flex gap-2">
        <Button type="submit">{event ? "Save changes" : "Add to schedule"}</Button>
        <LinkButton href={cancelHref} variant="secondary">
          Cancel
        </LinkButton>
      </div>
    </form>
  );
}
