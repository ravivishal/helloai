"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface CheckboxProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
  disabled?: boolean;
  id?: string;
}

function Checkbox({
  checked = false,
  onCheckedChange,
  className,
  disabled,
  id,
}: CheckboxProps) {
  return (
    <button
      id={id}
      role="checkbox"
      type="button"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange?.(!checked)}
      className={cn(
        "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        checked && "bg-primary text-primary-foreground",
        className
      )}
    >
      {checked && <Check className="h-3 w-3 mx-auto" />}
    </button>
  );
}

export { Checkbox };
