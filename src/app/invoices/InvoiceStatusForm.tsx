"use client";

import { useTransition } from "react";
import { Select } from "@/components/ui";
import { INVOICE_STATUS_LABELS } from "@/lib/status";
import { setInvoiceStatus } from "./actions";
import type { InvoiceStatus } from "@prisma/client";

export function InvoiceStatusForm({
  invoiceId,
  status,
}: {
  invoiceId: string;
  status: InvoiceStatus;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Select
      value={status}
      disabled={isPending}
      className="w-auto"
      onChange={(e) => {
        const next = e.target.value as InvoiceStatus;
        startTransition(() => {
          setInvoiceStatus(invoiceId, next);
        });
      }}
    >
      {Object.entries(INVOICE_STATUS_LABELS).map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </Select>
  );
}
