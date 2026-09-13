"use client";

import { useTransition } from "react";
import { Select } from "@/components/ui";
import { JOB_STATUS_LABELS, JOB_STATUS_ORDER } from "@/lib/status";
import { updateJobStatus } from "./actions";
import type { JobStatus } from "@prisma/client";

export function JobStatusForm({
  jobId,
  status,
}: {
  jobId: string;
  status: JobStatus;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Select
      value={status}
      disabled={isPending}
      className="w-auto"
      onChange={(e) => {
        const next = e.target.value as JobStatus;
        startTransition(() => {
          updateJobStatus(jobId, next);
        });
      }}
    >
      {JOB_STATUS_ORDER.map((s) => (
        <option key={s} value={s}>
          {JOB_STATUS_LABELS[s]}
        </option>
      ))}
    </Select>
  );
}
