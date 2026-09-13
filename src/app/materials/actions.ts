"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { MaterialCategory } from "@prisma/client";

function str(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

export async function createMaterial(formData: FormData) {
  const name = str(formData, "name");
  if (!name) throw new Error("Material name is required");

  await prisma.material.create({
    data: {
      name,
      category: (str(formData, "category") as MaterialCategory) ?? "OTHER",
      unit: str(formData, "unit") ?? "ea",
      unitCost: Number(formData.get("unitCost")) || 0,
      sku: str(formData, "sku"),
    },
  });

  revalidatePath("/materials");
  redirect("/materials");
}

export async function updateMaterial(id: string, formData: FormData) {
  const name = str(formData, "name");
  if (!name) throw new Error("Material name is required");

  await prisma.material.update({
    where: { id },
    data: {
      name,
      category: (str(formData, "category") as MaterialCategory) ?? "OTHER",
      unit: str(formData, "unit") ?? "ea",
      unitCost: Number(formData.get("unitCost")) || 0,
      sku: str(formData, "sku"),
    },
  });

  revalidatePath("/materials");
  redirect("/materials");
}

export async function deleteMaterial(id: string) {
  await prisma.material.delete({ where: { id } });
  revalidatePath("/materials");
  redirect("/materials");
}
