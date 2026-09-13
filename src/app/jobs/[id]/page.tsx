import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  PageHeader,
  LinkButton,
  Card,
  Badge,
  EmptyState,
  Table,
  Th,
  Td,
  Select,
  Input,
  Button,
} from "@/components/ui";
import { ConfirmSubmitButton } from "@/components/ConfirmSubmitButton";
import { JobStatusForm } from "../JobStatusForm";
import {
  JOB_TYPE_LABELS,
  ESTIMATE_STATUS_COLORS,
  ESTIMATE_STATUS_LABELS,
  INVOICE_STATUS_COLORS,
  INVOICE_STATUS_LABELS,
  MATERIAL_CATEGORY_LABELS,
} from "@/lib/status";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/format";
import { sumTotal } from "@/lib/totals";
import { deleteJob, addJobMaterial, removeJobMaterial } from "../actions";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [job, materials] = await Promise.all([
    prisma.job.findUnique({
      where: { id },
      include: {
        customer: true,
        jobMaterials: { include: { material: true }, orderBy: { id: "asc" } },
        estimates: {
          include: { items: true },
          orderBy: { createdAt: "desc" },
        },
        invoices: {
          include: { items: true },
          orderBy: { createdAt: "desc" },
        },
        scheduleEvents: { orderBy: { start: "asc" } },
      },
    }),
    prisma.material.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!job) notFound();

  const materialTotal = job.jobMaterials.reduce(
    (sum, jm) => sum + jm.quantity * jm.unitCostAtTime,
    0,
  );

  return (
    <div>
      <PageHeader
        title={job.title}
        subtitle={
          <>
            <Link href={`/customers/${job.customerId}`} className="text-brand hover:underline">
              {job.customer.name}
            </Link>
            {" · "}
            {JOB_TYPE_LABELS[job.type]} · Created {formatDate(job.createdAt)}
          </>
        }
        actions={
          <>
            <JobStatusForm jobId={job.id} status={job.status} />
            <LinkButton href={`/jobs/${job.id}/edit`} variant="secondary">
              Edit
            </LinkButton>
            <form action={deleteJob.bind(null, job.id)}>
              <ConfirmSubmitButton confirmMessage="Delete this job and all associated estimates, invoices, materials, and schedule events? This cannot be undone.">
                Delete
              </ConfirmSubmitButton>
            </form>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-stone-900 mb-3">Details</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-stone-500">Job site address</dt>
                <dd className="text-stone-900">
                  {job.address || job.customer.address || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-stone-500">Scheduled</dt>
                <dd className="text-stone-900">
                  {job.scheduledStart
                    ? `${formatDate(job.scheduledStart)}${
                        job.scheduledEnd ? ` – ${formatDate(job.scheduledEnd)}` : ""
                      }`
                    : "Not scheduled"}
                </dd>
              </div>
              {job.description && (
                <div className="sm:col-span-2">
                  <dt className="text-stone-500">Description</dt>
                  <dd className="text-stone-900 whitespace-pre-wrap">
                    {job.description}
                  </dd>
                </div>
              )}
            </dl>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-stone-900">
                Materials ({job.jobMaterials.length})
              </h2>
              <span className="text-sm font-medium text-stone-700">
                Total: {formatCurrency(materialTotal)}
              </span>
            </div>

            {job.jobMaterials.length > 0 && (
              <Table>
                <thead>
                  <tr>
                    <Th>Material</Th>
                    <Th>Category</Th>
                    <Th>Qty</Th>
                    <Th>Unit cost</Th>
                    <Th>Total</Th>
                    <Th>&nbsp;</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {job.jobMaterials.map((jm) => (
                    <tr key={jm.id}>
                      <Td>{jm.material.name}</Td>
                      <Td className="text-stone-500">
                        {MATERIAL_CATEGORY_LABELS[jm.material.category]}
                      </Td>
                      <Td>
                        {jm.quantity} {jm.material.unit}
                      </Td>
                      <Td>{formatCurrency(jm.unitCostAtTime)}</Td>
                      <Td className="font-medium">
                        {formatCurrency(jm.quantity * jm.unitCostAtTime)}
                      </Td>
                      <Td>
                        <form action={removeJobMaterial.bind(null, job.id, jm.id)}>
                          <button
                            type="submit"
                            className="text-xs text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </form>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}

            {materials.length > 0 ? (
              <form
                action={addJobMaterial.bind(null, job.id)}
                className="mt-4 flex flex-wrap items-end gap-3"
              >
                <div className="flex-1 min-w-[180px]">
                  <label className="block text-xs font-medium text-stone-500 mb-1">
                    Material
                  </label>
                  <Select name="materialId" required defaultValue="">
                    <option value="" disabled>
                      Select material...
                    </option>
                    {materials.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({formatCurrency(m.unitCost)}/{m.unit})
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="w-28">
                  <label className="block text-xs font-medium text-stone-500 mb-1">
                    Quantity
                  </label>
                  <Input
                    name="quantity"
                    type="number"
                    step="0.01"
                    min="0.01"
                    defaultValue="1"
                    required
                  />
                </div>
                <Button type="submit" variant="secondary">
                  + Add
                </Button>
              </form>
            ) : (
              <p className="mt-3 text-sm text-stone-500">
                No materials in catalog yet.{" "}
                <Link href="/materials/new" className="text-brand hover:underline">
                  Add one
                </Link>
                .
              </p>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="text-sm font-semibold text-stone-900 mb-3">
              Upcoming / scheduled events
            </h2>
            {job.scheduleEvents.length === 0 ? (
              <p className="text-sm text-stone-500">No scheduled events for this job.</p>
            ) : (
              <ul className="space-y-2">
                {job.scheduleEvents.map((event) => (
                  <li key={event.id} className="text-sm flex justify-between gap-3">
                    <span className="text-stone-900">{event.title}</span>
                    <span className="text-stone-500">{formatDateTime(event.start)}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-3">
              <LinkButton href={`/schedule/new?jobId=${job.id}`} variant="secondary">
                + Schedule event
              </LinkButton>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-stone-900">Estimates</h2>
              <LinkButton href={`/estimates/new?jobId=${job.id}`} variant="secondary">
                + New
              </LinkButton>
            </div>
            {job.estimates.length === 0 ? (
              <EmptyState title="No estimates" />
            ) : (
              <ul className="space-y-2">
                {job.estimates.map((estimate) => (
                  <li key={estimate.id}>
                    <Link
                      href={`/estimates/${estimate.id}`}
                      className="flex items-center justify-between gap-2 rounded-md border border-stone-200 px-3 py-2 hover:border-brand"
                    >
                      <div>
                        <p className="text-sm font-medium text-stone-900">
                          {estimate.number}
                        </p>
                        <p className="text-xs text-stone-500">
                          {formatCurrency(sumTotal(estimate.items))}
                        </p>
                      </div>
                      <Badge className={ESTIMATE_STATUS_COLORS[estimate.status]}>
                        {ESTIMATE_STATUS_LABELS[estimate.status]}
                      </Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-stone-900">Invoices</h2>
              <LinkButton href={`/invoices/new?jobId=${job.id}`} variant="secondary">
                + New
              </LinkButton>
            </div>
            {job.invoices.length === 0 ? (
              <EmptyState title="No invoices" />
            ) : (
              <ul className="space-y-2">
                {job.invoices.map((invoice) => (
                  <li key={invoice.id}>
                    <Link
                      href={`/invoices/${invoice.id}`}
                      className="flex items-center justify-between gap-2 rounded-md border border-stone-200 px-3 py-2 hover:border-brand"
                    >
                      <div>
                        <p className="text-sm font-medium text-stone-900">
                          {invoice.number}
                        </p>
                        <p className="text-xs text-stone-500">
                          {formatCurrency(sumTotal(invoice.items))}
                        </p>
                      </div>
                      <Badge className={INVOICE_STATUS_COLORS[invoice.status]}>
                        {INVOICE_STATUS_LABELS[invoice.status]}
                      </Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
