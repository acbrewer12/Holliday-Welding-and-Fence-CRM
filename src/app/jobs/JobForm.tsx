import { FormField, Input, Textarea, Select, Button, LinkButton } from "@/components/ui";
import { JOB_STATUS_LABELS, JOB_STATUS_ORDER, JOB_TYPE_LABELS } from "@/lib/status";
import { toDateInputValue } from "@/lib/format";
import type { Customer, Job } from "@prisma/client";

export function JobForm({
  action,
  job,
  customers,
  defaultCustomerId,
  cancelHref,
}: {
  action: (formData: FormData) => void;
  job?: Job | null;
  customers: Pick<Customer, "id" | "name">[];
  defaultCustomerId?: string;
  cancelHref: string;
}) {
  return (
    <form action={action} className="space-y-5 max-w-2xl">
      <FormField label="Customer" htmlFor="customerId">
        <Select
          id="customerId"
          name="customerId"
          required
          defaultValue={job?.customerId ?? defaultCustomerId ?? ""}
        >
          <option value="" disabled>
            Select a customer...
          </option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </FormField>

      <FormField label="Job title" htmlFor="title">
        <Input
          id="title"
          name="title"
          required
          defaultValue={job?.title ?? ""}
          placeholder="Backyard privacy fence - 150ft"
        />
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Type" htmlFor="type">
          <Select id="type" name="type" defaultValue={job?.type ?? "FENCE"}>
            {Object.entries(JOB_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Status" htmlFor="status">
          <Select id="status" name="status" defaultValue={job?.status ?? "LEAD"}>
            {JOB_STATUS_ORDER.map((value) => (
              <option key={value} value={value}>
                {JOB_STATUS_LABELS[value]}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <FormField label="Job site address" htmlFor="address">
        <Input
          id="address"
          name="address"
          defaultValue={job?.address ?? ""}
          placeholder="Leave blank to use customer address"
        />
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Scheduled start" htmlFor="scheduledStart">
          <Input
            id="scheduledStart"
            name="scheduledStart"
            type="date"
            defaultValue={toDateInputValue(job?.scheduledStart)}
          />
        </FormField>
        <FormField label="Scheduled end" htmlFor="scheduledEnd">
          <Input
            id="scheduledEnd"
            name="scheduledEnd"
            type="date"
            defaultValue={toDateInputValue(job?.scheduledEnd)}
          />
        </FormField>
      </div>

      <FormField label="Description" htmlFor="description">
        <Textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={job?.description ?? ""}
          placeholder="Scope of work, materials needed, special instructions..."
        />
      </FormField>

      <div className="flex gap-2">
        <Button type="submit">{job ? "Save changes" : "Create job"}</Button>
        <LinkButton href={cancelHref} variant="secondary">
          Cancel
        </LinkButton>
      </div>
    </form>
  );
}
