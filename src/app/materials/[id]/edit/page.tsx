import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { ConfirmSubmitButton } from "@/components/ConfirmSubmitButton";
import { MaterialForm } from "../../MaterialForm";
import { updateMaterial, deleteMaterial } from "../../actions";

export default async function EditMaterialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const material = await prisma.material.findUnique({ where: { id } });
  if (!material) notFound();

  return (
    <div>
      <PageHeader
        title={`Edit ${material.name}`}
        actions={
          <form action={deleteMaterial.bind(null, material.id)}>
            <ConfirmSubmitButton confirmMessage="Delete this material from the catalog? This will also remove it from any jobs it's attached to.">
              Delete
            </ConfirmSubmitButton>
          </form>
        }
      />
      <MaterialForm
        action={updateMaterial.bind(null, material.id)}
        material={material}
        cancelHref="/materials"
      />
    </div>
  );
}
