"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { nextDocumentNumber } from "@/lib/totals";
import type { EstimateStatus } from "@prisma/client";

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

export async function createEstimate(formData: FormData) {
  const jobId = str(formData, "jobId");
  if (!jobId) throw new Error("Job is required");

  const items = parseItems(formData);
  const count = await prisma.estimate.count();
  const number = await nextDocumentNumber("EST", count);

  const estimate = await prisma.estimate.create({
    data: {
      number,
      jobId,
      status: (str(formData, "status") as EstimateStatus) ?? "DRAFT",
      issuedDate: dateOrNull(formData, "issuedDate") ?? new Date(),
      expiryDate: dateOrNull(formData, "expiryDate"),
      notes: str(formData, "notes"),
      items: { create: items },
    },
  });

  revalidatePath("/estimates");
  revalidatePath(`/jobs/${jobId}`);
  redirect(`/estimates/${estimate.id}`);
}

export async function updateEstimate(id: string, formData: FormData) {
  const items = parseItems(formData);
  const existing = await prisma.estimate.findUniqueOrThrow({ where: { id } });

  await prisma.$transaction([
    prisma.estimateItem.deleteMany({ where: { estimateId: id } }),
    prisma.estimate.update({
      where: { id },
      data: {
        status: (str(formData, "status") as EstimateStatus) ?? existing.status,
        issuedDate: dateOrNull(formData, "issuedDate") ?? existing.issuedDate,
        expiryDate: dateOrNull(formData, "expiryDate"),
        notes: str(formData, "notes"),
        items: { create: items },
      },
    }),
  ]);

  revalidatePath("/estimates");
  revalidatePath(`/estimates/${id}`);
  revalidatePath(`/jobs/${existing.jobId}`);
  redirect(`/estimates/${id}`);
}

export async function deleteEstimate(id: string) {
  const estimate = await prisma.estimate.delete({ where: { id } });
  revalidatePath("/estimates");
  revalidatePath(`/jobs/${estimate.jobId}`);
  redirect(`/jobs/${estimate.jobId}`);
}

export async function convertEstimateToInvoice(estimateId: string) {
  const estimate = await prisma.estimate.findUniqueOrThrow({
    where: { id: estimateId },
    include: { items: true },
  });

  const count = await prisma.invoice.count();
  const number = await nextDocumentNumber("INV", count);

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30);

  const invoice = await prisma.invoice.create({
    data: {
      number,
      jobId: estimate.jobId,
      estimateId: estimate.id,
      dueDate,
      items: {
        create: estimate.items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice,
        })),
      },
    },
  });

  revalidatePath("/invoices");
  revalidatePath(`/jobs/${estimate.jobId}`);
  redirect(`/invoices/${invoice.id}`);
}
