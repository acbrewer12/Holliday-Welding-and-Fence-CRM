import { PageHeader } from "@/components/ui";
import { MaterialForm } from "../MaterialForm";
import { createMaterial } from "../actions";

export default function NewMaterialPage() {
  return (
    <div>
      <PageHeader title="New material" />
      <MaterialForm action={createMaterial} cancelHref="/materials" />
    </div>
  );
}
