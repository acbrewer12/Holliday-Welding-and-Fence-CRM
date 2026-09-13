import { FormField, Input, Textarea, Button, LinkButton } from "@/components/ui";
import type { Customer } from "@prisma/client";

export function CustomerForm({
  action,
  customer,
  cancelHref,
}: {
  action: (formData: FormData) => void;
  customer?: Customer | null;
  cancelHref: string;
}) {
  return (
    <form action={action} className="space-y-5 max-w-2xl">
      <FormField label="Full name / Business name" htmlFor="name">
        <Input
          id="name"
          name="name"
          required
          defaultValue={customer?.name ?? ""}
          placeholder="Jane Smith"
        />
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Email" htmlFor="email">
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={customer?.email ?? ""}
            placeholder="jane@example.com"
          />
        </FormField>
        <FormField label="Phone" htmlFor="phone">
          <Input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={customer?.phone ?? ""}
            placeholder="(555) 555-5555"
          />
        </FormField>
      </div>

      <FormField label="Street address" htmlFor="address">
        <Input
          id="address"
          name="address"
          defaultValue={customer?.address ?? ""}
          placeholder="123 Main St"
        />
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FormField label="City" htmlFor="city">
          <Input id="city" name="city" defaultValue={customer?.city ?? ""} />
        </FormField>
        <FormField label="State" htmlFor="state">
          <Input id="state" name="state" defaultValue={customer?.state ?? ""} />
        </FormField>
        <FormField label="ZIP" htmlFor="zip">
          <Input id="zip" name="zip" defaultValue={customer?.zip ?? ""} />
        </FormField>
      </div>

      <FormField label="Notes" htmlFor="notes">
        <Textarea
          id="notes"
          name="notes"
          rows={4}
          defaultValue={customer?.notes ?? ""}
          placeholder="Gate codes, pets, access notes, preferences..."
        />
      </FormField>

      <div className="flex gap-2">
        <Button type="submit">{customer ? "Save changes" : "Create customer"}</Button>
        <LinkButton href={cancelHref} variant="secondary">
          Cancel
        </LinkButton>
      </div>
    </form>
  );
}
