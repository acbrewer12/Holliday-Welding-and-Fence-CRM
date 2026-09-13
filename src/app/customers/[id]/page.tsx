import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  PageHeader,
  LinkButton,
  Card,
  Badge,
  EmptyState,
} from "@/components/ui";
import { ConfirmSubmitButton } from "@/components/ConfirmSubmitButton";
import { JOB_STATUS_COLORS, JOB_STATUS_LABELS, JOB_TYPE_LABELS } from "@/lib/status";
import { formatDate } from "@/lib/format";
import { deleteCustomer } from "../actions";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      jobs: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!customer) notFound();

  return (
    <div>
      <PageHeader
        title={customer.name}
        subtitle={`Customer since ${formatDate(customer.createdAt)}`}
        actions={
          <>
            <LinkButton href={`/jobs/new?customerId=${customer.id}`} variant="secondary">
              + New job
            </LinkButton>
            <LinkButton href={`/customers/${customer.id}/edit`} variant="secondary">
              Edit
            </LinkButton>
            <form action={deleteCustomer.bind(null, customer.id)}>
              <ConfirmSubmitButton confirmMessage="Delete this customer and all associated jobs, estimates, and invoices? This cannot be undone.">
                Delete
              </ConfirmSubmitButton>
            </form>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-5 lg:col-span-1 h-fit">
          <h2 className="text-sm font-semibold text-stone-900 mb-3">
            Contact info
          </h2>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="text-stone-500">Phone</dt>
              <dd className="text-stone-900">{customer.phone ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-stone-500">Email</dt>
              <dd className="text-stone-900">{customer.email ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-stone-500">Address</dt>
              <dd className="text-stone-900">
                {customer.address ? (
                  <>
                    {customer.address}
                    <br />
                    {[customer.city, customer.state, customer.zip]
                      .filter(Boolean)
                      .join(", ")}
                  </>
                ) : (
                  "—"
                )}
              </dd>
            </div>
            {customer.notes && (
              <div>
                <dt className="text-stone-500">Notes</dt>
                <dd className="text-stone-900 whitespace-pre-wrap">
                  {customer.notes}
                </dd>
              </div>
            )}
          </dl>
        </Card>

        <div className="lg:col-span-2">
          <h2 className="text-sm font-semibold text-stone-900 mb-3">
            Jobs ({customer.jobs.length})
          </h2>
          {customer.jobs.length === 0 ? (
            <EmptyState
              title="No jobs yet"
              description="Create a job for this customer to start tracking work."
              action={
                <LinkButton href={`/jobs/new?customerId=${customer.id}`}>
                  + New job
                </LinkButton>
              }
            />
          ) : (
            <div className="space-y-3">
              {customer.jobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="block"
                >
                  <Card className="p-4 hover:border-brand transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-stone-900">{job.title}</p>
                        <p className="text-xs text-stone-500 mt-0.5">
                          {JOB_TYPE_LABELS[job.type]} · Created{" "}
                          {formatDate(job.createdAt)}
                        </p>
                      </div>
                      <Badge className={JOB_STATUS_COLORS[job.status]}>
                        {JOB_STATUS_LABELS[job.status]}
                      </Badge>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
