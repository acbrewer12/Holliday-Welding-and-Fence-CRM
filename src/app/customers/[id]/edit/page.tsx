import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { CustomerForm } from "../../CustomerForm";
import { updateCustomer } from "../../actions";

export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await prisma.customer.findUnique({ where: { id } });
  if (!customer) notFound();

  return (
    <div>
      <PageHeader title={`Edit ${customer.name}`} />
      <CustomerForm
        action={updateCustomer.bind(null, customer.id)}
        customer={customer}
        cancelHref={`/customers/${customer.id}`}
      />
    </div>
  );
}
