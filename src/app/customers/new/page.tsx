import { PageHeader } from "@/components/ui";
import { CustomerForm } from "../CustomerForm";
import { createCustomer } from "../actions";

export default function NewCustomerPage() {
  return (
    <div>
      <PageHeader title="New customer" />
      <CustomerForm action={createCustomer} cancelHref="/customers" />
    </div>
  );
}
