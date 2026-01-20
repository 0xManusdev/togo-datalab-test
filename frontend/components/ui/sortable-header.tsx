"use client";

import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SortableHeaderProps {
  column: string;
  label: string;
  sortedColumn: string | null;
  sortDirection: "asc" | "desc";
  onSort: (column: string) => void;
  className?: string;
}

export function SortableHeader({
  column,
  label,
  sortedColumn,
  sortDirection,
  onSort,
  className,
}: SortableHeaderProps) {
  const isSorted = sortedColumn === column;

  return (
    <Button
      variant="ghost"
      onClick={() => onSort(column)}
      className={cn("-ml-4 h-8 data-[state=open]:bg-accent", className)}
    >
      {label}
      {isSorted ? (
        sortDirection === "asc" ? (
          <ArrowUp className="ml-2 h-4 w-4" />
        ) : (
          <ArrowDown className="ml-2 h-4 w-4" />
        )
      ) : (
        <ArrowUpDown className="ml-2 h-4 w-4" />
      )}
    </Button>
  );
}
