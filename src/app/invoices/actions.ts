"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { nextDocumentNumber } from "@/lib/totals";
import type { InvoiceStatus } from "@prisma/client";

function str(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function dateOrNull(formData: FormData, key: string): Date | null {
  const value = str(formData, key);
  return value ? new Date(value) : null;
}

function parseItems(formData: FormData) {
  const descriptions = formData.getAll("itemDescription") as string[];
  const quantities = formData.getAll("itemQuantity") as string[];
  const units = formData.getAll("itemUnit") as string[];
  const unitPrices = formData.getAll("itemUnitPrice") as string[];

  return descriptions
    .map((description, i) => ({
      description: description.trim(),
      quantity: Number(quantities[i]) || 0,
      unit: (units[i] || "ea").trim() || "ea",
      unitPrice: Number(unitPrices[i]) || 0,
    }))
    .filter((item) => item.description.length > 0);
}

export async function createInvoice(formData: FormData) {
  const jobId = str(formData, "jobId");
  if (!jobId) throw new Error("Job is required");

  const items = parseItems(formData);
  const count = await prisma.invoice.count();
  const number = await nextDocumentNumber("INV", count);

  const invoice = await prisma.invoice.create({
    data: {
      number,
      jobId,
      status: (str(formData, "status") as InvoiceStatus) ?? "DRAFT",
      issuedDate: dateOrNull(formData, "issuedDate") ?? new Date(),
      dueDate: dateOrNull(formData, "dueDate"),
      notes: str(formData, "notes"),
      items: { create: items },
    },
  });

  revalidatePath("/invoices");
  revalidatePath(`/jobs/${jobId}`);
  redirect(`/invoices/${invoice.id}`);
}

export async function updateInvoice(id: string, formData: FormData) {
  const items = parseItems(formData);
  const existing = await prisma.invoice.findUniqueOrThrow({ where: { id } });

  await prisma.$transaction([
    prisma.invoiceItem.deleteMany({ where: { invoiceId: id } }),
    prisma.invoice.update({
      where: { id },
      data: {
        status: (str(formData, "status") as InvoiceStatus) ?? existing.status,
        issuedDate: dateOrNull(formData, "issuedDate") ?? existing.issuedDate,
        dueDate: dateOrNull(formData, "dueDate"),
        notes: str(formData, "notes"),
        items: { create: items },
      },
    }),
  ]);

  revalidatePath("/invoices");
  revalidatePath(`/invoices/${id}`);
  revalidatePath(`/jobs/${existing.jobId}`);
  redirect(`/invoices/${id}`);
}

export async function setInvoiceStatus(id: string, status: InvoiceStatus) {
  const invoice = await prisma.invoice.update({ where: { id }, data: { status } });
  revalidatePath("/invoices");
  revalidatePath(`/invoices/${id}`);
  revalidatePath(`/jobs/${invoice.jobId}`);
}

export async function deleteInvoice(id: string) {
  const invoice = await prisma.invoice.delete({ where: { id } });
  revalidatePath("/invoices");
  revalidatePath(`/jobs/${invoice.jobId}`);
  redirect(`/jobs/${invoice.jobId}`);
}
