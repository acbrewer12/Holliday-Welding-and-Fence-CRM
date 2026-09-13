export type LineItem = { quantity: number; unitPrice: number };

export function lineTotal(item: LineItem): number {
  return item.quantity * item.unitPrice;
}

export function sumTotal(items: LineItem[]): number {
  return items.reduce((sum, item) => sum + lineTotal(item), 0);
}

export function isPastDue(
  dueDate: Date | string | null,
  status: string,
): boolean {
  if (!dueDate) return false;
  if (status !== "SENT") return false;
  return new Date(dueDate).getTime() < Date.now();
}

export async function nextDocumentNumber(
  prefix: string,
  count: number,
): Promise<string> {
  const year = new Date().getFullYear();
  const seq = String(count + 1).padStart(4, "0");
  return `${prefix}-${year}-${seq}`;
}
