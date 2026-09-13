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

export async function createScheduleEvent(formData: FormData) {
  const title = str(formData, "title");
  const start = str(formData, "start");
  const end = str(formData, "end");
  if (!title) throw new Error("Title is required");
  if (!start) throw new Error("Start time is required");

  const jobId = str(formData, "jobId");

  await prisma.scheduleEvent.create({
    data: {
      title,
      start: new Date(start),
      end: end ? new Date(end) : new Date(start),
      crew: str(formData, "crew"),
      notes: str(formData, "notes"),
      jobId,
    },
  });

  revalidatePath("/schedule");
  if (jobId) revalidatePath(`/jobs/${jobId}`);
  redirect("/schedule");
}

export async function updateScheduleEvent(id: string, formData: FormData) {
  const title = str(formData, "title");
  const start = str(formData, "start");
  const end = str(formData, "end");
  if (!title) throw new Error("Title is required");
  if (!start) throw new Error("Start time is required");

  const jobId = str(formData, "jobId");

  await prisma.scheduleEvent.update({
    where: { id },
    data: {
      title,
      start: new Date(start),
      end: end ? new Date(end) : new Date(start),
      crew: str(formData, "crew"),
      notes: str(formData, "notes"),
      jobId,
    },
  });

  revalidatePath("/schedule");
  if (jobId) revalidatePath(`/jobs/${jobId}`);
  redirect("/schedule");
}

export async function deleteScheduleEvent(id: string) {
  const event = await prisma.scheduleEvent.delete({ where: { id } });
  revalidatePath("/schedule");
  if (event.jobId) revalidatePath(`/jobs/${event.jobId}`);
  redirect("/schedule");
}
