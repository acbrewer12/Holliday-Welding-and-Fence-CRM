import { FormField, Input, Textarea, Select, Button, LinkButton } from "@/components/ui";
import { LineItemsEditor, type EditableItem } from "@/components/LineItemsEditor";
import { INVOICE_STATUS_LABELS } from "@/lib/status";
import { toDateInputValue } from "@/lib/format";
import type { Invoice, InvoiceItem, Job, Customer } from "@prisma/client";

type JobOption = Job & { customer: Customer };

export function InvoiceForm({
  action,
  invoice,
  items,
  jobs,
  defaultJobId,
  cancelHref,
}: {
  action: (formData: FormData) => void;
  invoice?: Invoice | null;
  items?: InvoiceItem[];
  jobs: JobOption[];
  defaultJobId?: string;
  cancelHref: string;
}) {
  const editableItems: EditableItem[] | undefined = items?.map((i) => ({
    description: i.description,
    quantity: i.quantity,
    unit: i.unit,
    unitPrice: i.unitPrice,
  }));

  return (
    <form action={action} className="space-y-5 max-w-3xl">
      {invoice ? (
        <input type="hidden" name="jobId" value={invoice.jobId} />
      ) : (
        <FormField label="Job" htmlFor="jobId">
          <Select id="jobId" name="jobId" required defaultValue={defaultJobId ?? ""}>
            <option value="" disabled>
              Select a job...
            </option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.customer.name} — {job.title}
              </option>
            ))}
          </Select>
        </FormField>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FormField label="Status" htmlFor="status">
          <Select id="status" name="status" defaultValue={invoice?.status ?? "DRAFT"}>
            {Object.entries(INVOICE_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Issued date" htmlFor="issuedDate">
          <Input
            id="issuedDate"
            name="issuedDate"
            type="date"
            defaultValue={toDateInputValue(invoice?.issuedDate) || toDateInputValue(new Date())}
          />
        </FormField>
        <FormField label="Due date" htmlFor="dueDate">
          <Input
            id="dueDate"
            name="dueDate"
            type="date"
            defaultValue={toDateInputValue(invoice?.dueDate)}
          />
        </FormField>
      </div>

      <FormField label="Line items" htmlFor="items">
        <LineItemsEditor initialItems={editableItems} />
      </FormField>

      <FormField label="Notes" htmlFor="notes">
        <Textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={invoice?.notes ?? ""}
          placeholder="Payment terms, thank-you note..."
        />
      </FormField>

      <div className="flex gap-2">
        <Button type="submit">{invoice ? "Save changes" : "Create invoice"}</Button>
        <LinkButton href={cancelHref} variant="secondary">
          Cancel
        </LinkButton>
      </div>
    </form>
  );
}
