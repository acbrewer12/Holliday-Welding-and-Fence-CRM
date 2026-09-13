"use client";

import { useState } from "react";
import { Input, Button } from "@/components/ui";
import { formatCurrency } from "@/lib/format";

export type EditableItem = {
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
};

let nextKey = 0;
function makeKey() {
  nextKey += 1;
  return nextKey;
}

export function LineItemsEditor({
  initialItems,
}: {
  initialItems?: EditableItem[];
}) {
  const [rows, setRows] = useState(() =>
    (initialItems && initialItems.length
      ? initialItems
      : [{ description: "", quantity: 1, unit: "ea", unitPrice: 0 }]
    ).map((item) => ({ ...item, key: makeKey() })),
  );

  const total = rows.reduce(
    (sum, row) => sum + (Number(row.quantity) || 0) * (Number(row.unitPrice) || 0),
    0,
  );

  function updateRow(key: number, patch: Partial<EditableItem>) {
    setRows((prev) =>
      prev.map((row) => (row.key === key ? { ...row, ...patch } : row)),
    );
  }

  function removeRow(key: number) {
    setRows((prev) => (prev.length > 1 ? prev.filter((row) => row.key !== key) : prev));
  }

  function addRow() {
    setRows((prev) => [
      ...prev,
      { description: "", quantity: 1, unit: "ea", unitPrice: 0, key: makeKey() },
    ]);
  }

  return (
    <div>
      <div className="overflow-x-auto rounded-lg border border-stone-200 bg-white">
        <table className="min-w-full divide-y divide-stone-200 text-sm">
          <thead>
            <tr>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-stone-500 w-2/5">
                Description
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-stone-500">
                Qty
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-stone-500">
                Unit
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-stone-500">
                Unit price
              </th>
              <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-stone-500">
                Total
              </th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {rows.map((row) => (
              <tr key={row.key}>
                <td className="px-3 py-2">
                  <Input
                    name="itemDescription"
                    required
                    value={row.description}
                    onChange={(e) =>
                      updateRow(row.key, { description: e.target.value })
                    }
                    placeholder="Item description"
                  />
                </td>
                <td className="px-3 py-2">
                  <Input
                    name="itemQuantity"
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-20"
                    value={row.quantity}
                    onChange={(e) =>
                      updateRow(row.key, { quantity: Number(e.target.value) })
                    }
                  />
                </td>
                <td className="px-3 py-2">
                  <Input
                    name="itemUnit"
                    className="w-16"
                    value={row.unit}
                    onChange={(e) => updateRow(row.key, { unit: e.target.value })}
                  />
                </td>
                <td className="px-3 py-2">
                  <Input
                    name="itemUnitPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-24"
                    value={row.unitPrice}
                    onChange={(e) =>
                      updateRow(row.key, { unitPrice: Number(e.target.value) })
                    }
                  />
                </td>
                <td className="px-3 py-2 text-right font-medium text-stone-900 whitespace-nowrap">
                  {formatCurrency(
                    (Number(row.quantity) || 0) * (Number(row.unitPrice) || 0),
                  )}
                </td>
                <td className="px-1 py-2 text-center">
                  <button
                    type="button"
                    onClick={() => removeRow(row.key)}
                    className="text-stone-400 hover:text-red-600"
                    aria-label="Remove item"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-3">
        <Button type="button" variant="secondary" onClick={addRow}>
          + Add line item
        </Button>
        <div className="text-sm font-semibold text-stone-900">
          Total: {formatCurrency(total)}
        </div>
      </div>
    </div>
  );
}
