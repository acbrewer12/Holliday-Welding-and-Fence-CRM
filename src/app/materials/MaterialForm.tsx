import { FormField, Input, Select, Button, LinkButton } from "@/components/ui";
import { MATERIAL_CATEGORY_LABELS } from "@/lib/status";
import type { Material } from "@prisma/client";

export function MaterialForm({
  action,
  material,
  cancelHref,
}: {
  action: (formData: FormData) => void;
  material?: Material | null;
  cancelHref: string;
}) {
  return (
    <form action={action} className="space-y-5 max-w-xl">
      <FormField label="Name" htmlFor="name">
        <Input
          id="name"
          name="name"
          required
          defaultValue={material?.name ?? ""}
          placeholder="6ft Wood Privacy Panel"
        />
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Category" htmlFor="category">
          <Select id="category" name="category" defaultValue={material?.category ?? "OTHER"}>
            {Object.entries(MATERIAL_CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Unit" htmlFor="unit">
          <Input
            id="unit"
            name="unit"
            defaultValue={material?.unit ?? "ea"}
            placeholder="ea, ft, bag, box..."
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Unit cost ($)" htmlFor="unitCost">
          <Input
            id="unitCost"
            name="unitCost"
            type="number"
            step="0.01"
            min="0"
            defaultValue={material?.unitCost ?? 0}
          />
        </FormField>
        <FormField label="SKU (optional)" htmlFor="sku">
          <Input id="sku" name="sku" defaultValue={material?.sku ?? ""} />
        </FormField>
      </div>

      <div className="flex gap-2">
        <Button type="submit">{material ? "Save changes" : "Add material"}</Button>
        <LinkButton href={cancelHref} variant="secondary">
          Cancel
        </LinkButton>
      </div>
    </form>
  );
}
