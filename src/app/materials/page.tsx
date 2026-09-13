import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader, LinkButton, Table, Th, Td, EmptyState } from "@/components/ui";
import { MATERIAL_CATEGORY_LABELS } from "@/lib/status";
import { formatCurrency } from "@/lib/format";

export default async function MaterialsPage() {
  const materials = await prisma.material.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { jobMaterials: true } } },
  });

  return (
    <div>
      <PageHeader
        title="Materials catalog"
        subtitle={`${materials.length} material${materials.length === 1 ? "" : "s"}`}
        actions={<LinkButton href="/materials/new">+ New material</LinkButton>}
      />

      {materials.length === 0 ? (
        <EmptyState
          title="No materials yet"
          description="Add fence panels, posts, gates, welding rod, and other supplies to attach them to jobs."
          action={<LinkButton href="/materials/new">+ New material</LinkButton>}
        />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Name</Th>
              <Th>Category</Th>
              <Th>Unit</Th>
              <Th>Unit cost</Th>
              <Th>SKU</Th>
              <Th>Used on</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {materials.map((material) => (
              <tr key={material.id} className="hover:bg-stone-50">
                <Td>
                  <Link
                    href={`/materials/${material.id}/edit`}
                    className="font-medium text-stone-900 hover:text-brand"
                  >
                    {material.name}
                  </Link>
                </Td>
                <Td className="text-stone-500">
                  {MATERIAL_CATEGORY_LABELS[material.category]}
                </Td>
                <Td className="text-stone-500">{material.unit}</Td>
                <Td>{formatCurrency(material.unitCost)}</Td>
                <Td className="text-stone-500">{material.sku ?? "—"}</Td>
                <Td className="text-stone-500">{material._count.jobMaterials} jobs</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
