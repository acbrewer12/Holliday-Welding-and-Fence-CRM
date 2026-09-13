import type {
  EstimateStatus,
  InvoiceStatus,
  JobStatus,
  JobType,
  MaterialCategory,
} from "@prisma/client";

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  LEAD: "Lead",
  QUOTED: "Quoted",
  SCHEDULED: "Scheduled",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const JOB_STATUS_ORDER: JobStatus[] = [
  "LEAD",
  "QUOTED",
  "SCHEDULED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
];

export const JOB_STATUS_COLORS: Record<JobStatus, string> = {
  LEAD: "bg-zinc-100 text-zinc-700 ring-zinc-500/20",
  QUOTED: "bg-amber-100 text-amber-800 ring-amber-600/20",
  SCHEDULED: "bg-sky-100 text-sky-800 ring-sky-600/20",
  IN_PROGRESS: "bg-orange-100 text-orange-800 ring-orange-600/20",
  COMPLETED: "bg-emerald-100 text-emerald-800 ring-emerald-600/20",
  CANCELLED: "bg-red-100 text-red-700 ring-red-600/20",
};

export const JOB_TYPE_LABELS: Record<JobType, string> = {
  WELDING: "Welding",
  FENCE: "Fence",
  REPAIR: "Repair",
  OTHER: "Other",
};

export const ESTIMATE_STATUS_LABELS: Record<EstimateStatus, string> = {
  DRAFT: "Draft",
  SENT: "Sent",
  ACCEPTED: "Accepted",
  DECLINED: "Declined",
};

export const ESTIMATE_STATUS_COLORS: Record<EstimateStatus, string> = {
  DRAFT: "bg-zinc-100 text-zinc-700 ring-zinc-500/20",
  SENT: "bg-sky-100 text-sky-800 ring-sky-600/20",
  ACCEPTED: "bg-emerald-100 text-emerald-800 ring-emerald-600/20",
  DECLINED: "bg-red-100 text-red-700 ring-red-600/20",
};

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  DRAFT: "Draft",
  SENT: "Sent",
  PAID: "Paid",
  OVERDUE: "Overdue",
  VOID: "Void",
};

export const INVOICE_STATUS_COLORS: Record<InvoiceStatus, string> = {
  DRAFT: "bg-zinc-100 text-zinc-700 ring-zinc-500/20",
  SENT: "bg-sky-100 text-sky-800 ring-sky-600/20",
  PAID: "bg-emerald-100 text-emerald-800 ring-emerald-600/20",
  OVERDUE: "bg-red-100 text-red-700 ring-red-600/20",
  VOID: "bg-zinc-100 text-zinc-500 ring-zinc-500/20 line-through",
};

export const MATERIAL_CATEGORY_LABELS: Record<MaterialCategory, string> = {
  FENCE_PANEL: "Fence Panel",
  POST: "Post",
  GATE: "Gate",
  HARDWARE: "Hardware",
  WELDING_ROD: "Welding Rod",
  METAL_STOCK: "Metal Stock",
  CONCRETE: "Concrete",
  OTHER: "Other",
};
