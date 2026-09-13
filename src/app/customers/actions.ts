"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

function str(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

export async function createCustomer(formData: FormData) {
  const name = str(formData, "name");
  if (!name) throw new Error("Customer name is required");

  const customer = await prisma.customer.create({
    data: {
      name,
      email: str(formData, "email"),
      phone: str(formData, "phone"),
      address: str(formData, "address"),
      city: str(formData, "city"),
      state: str(formData, "state"),
      zip: str(formData, "zip"),
      notes: str(formData, "notes"),
    },
  });

  revalidatePath("/customers");
  redirect(`/customers/${customer.id}`);
}

export async function updateCustomer(id: string, formData: FormData) {
  const name = str(formData, "name");
  if (!name) throw new Error("Customer name is required");

  await prisma.customer.update({
    where: { id },
    data: {
      name,
      email: str(formData, "email"),
      phone: str(formData, "phone"),
      address: str(formData, "address"),
      city: str(formData, "city"),
      state: str(formData, "state"),
      zip: str(formData, "zip"),
      notes: str(formData, "notes"),
    },
  });

  revalidatePath("/customers");
  revalidatePath(`/customers/${id}`);
  redirect(`/customers/${id}`);
}

export async function deleteCustomer(id: string) {
  await prisma.customer.delete({ where: { id } });
  revalidatePath("/customers");
  redirect("/customers");
}
