"use client";

import { Button } from "@/components/ui";

export function ConfirmSubmitButton({
  children,
  confirmMessage,
  variant = "danger",
}: {
  children: React.ReactNode;
  confirmMessage: string;
  variant?: "primary" | "secondary" | "danger" | "ghost";
}) {
  return (
    <Button
      type="submit"
      variant={variant}
      onClick={(e) => {
        if (!confirm(confirmMessage)) {
          e.preventDefault();
        }
      }}
    >
      {children}
    </Button>
  );
}
