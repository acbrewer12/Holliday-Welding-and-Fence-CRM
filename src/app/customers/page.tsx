import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader, LinkButton, Table, Th, Td, EmptyState } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { jobs: true } } },
  });

  return (
    <div>
      <PageHeader
        title="Customers"
        subtitle={`${customers.length} customer${customers.length === 1 ? "" : "s"}`}
        actions={<LinkButton href="/customers/new">+ New customer</LinkButton>}
      />

      {customers.length === 0 ? (
        <EmptyState
          title="No customers yet"
          description="Add your first customer to start tracking jobs, estimates, and invoices."
          action={<LinkButton href="/customers/new">+ New customer</LinkButton>}
        />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Name</Th>
              <Th>Phone</Th>
              <Th>Email</Th>
              <Th>City</Th>
              <Th>Jobs</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {customers.map((customer) => (
              <tr key={customer.id} className="hover:bg-stone-50">
                <Td>
                  <Link
                    href={`/customers/${customer.id}`}
                    className="font-medium text-stone-900 hover:text-brand"
                  >
                    {customer.name}
                  </Link>
                </Td>
                <Td className="text-stone-500">{customer.phone ?? "—"}</Td>
                <Td className="text-stone-500">{customer.email ?? "—"}</Td>
                <Td className="text-stone-500">{customer.city ?? "—"}</Td>
                <Td className="text-stone-500">{customer._count.jobs}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
