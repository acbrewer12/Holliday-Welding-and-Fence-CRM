"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { JobStatus, JobType } from "@prisma/client";

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

export async function createJob(formData: FormData) {
  const title = str(formData, "title");
  const customerId = str(formData, "customerId");
  if (!title) throw new Error("Job title is required");
  if (!customerId) throw new Error("Customer is required");

  const job = await prisma.job.create({
    data: {
      title,
      customerId,
      type: (str(formData, "type") as JobType) ?? "FENCE",
      status: (str(formData, "status") as JobStatus) ?? "LEAD",
      description: str(formData, "description"),
      address: str(formData, "address"),
      scheduledStart: dateOrNull(formData, "scheduledStart"),
      scheduledEnd: dateOrNull(formData, "scheduledEnd"),
    },
  });

  revalidatePath("/jobs");
  revalidatePath(`/customers/${customerId}`);
  redirect(`/jobs/${job.id}`);
}

export async function updateJob(id: string, formData: FormData) {
  const title = str(formData, "title");
  const customerId = str(formData, "customerId");
  if (!title) throw new Error("Job title is required");
  if (!customerId) throw new Error("Customer is required");

  await prisma.job.update({
    where: { id },
    data: {
      title,
      customerId,
      type: (str(formData, "type") as JobType) ?? "FENCE",
      status: (str(formData, "status") as JobStatus) ?? "LEAD",
      description: str(formData, "description"),
      address: str(formData, "address"),
      scheduledStart: dateOrNull(formData, "scheduledStart"),
      scheduledEnd: dateOrNull(formData, "scheduledEnd"),
    },
  });

  revalidatePath("/jobs");
  revalidatePath(`/jobs/${id}`);
  revalidatePath(`/customers/${customerId}`);
  redirect(`/jobs/${id}`);
}

export async function updateJobStatus(id: string, status: JobStatus) {
  await prisma.job.update({ where: { id }, data: { status } });
  revalidatePath("/jobs");
  revalidatePath(`/jobs/${id}`);
}

export async function deleteJob(id: string) {
  const job = await prisma.job.delete({ where: { id } });
  revalidatePath("/jobs");
  revalidatePath(`/customers/${job.customerId}`);
  redirect(`/customers/${job.customerId}`);
}

export async function addJobMaterial(jobId: string, formData: FormData) {
  const materialId = str(formData, "materialId");
  const quantity = Number(formData.get("quantity"));
  if (!materialId) throw new Error("Material is required");

  const material = await prisma.material.findUniqueOrThrow({
    where: { id: materialId },
  });

  await prisma.jobMaterial.create({
    data: {
      jobId,
      materialId,
      quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
      unitCostAtTime: material.unitCost,
    },
  });

  revalidatePath(`/jobs/${jobId}`);
}

export async function removeJobMaterial(jobId: string, jobMaterialId: string) {
  await prisma.jobMaterial.delete({ where: { id: jobMaterialId } });
  revalidatePath(`/jobs/${jobId}`);
}
