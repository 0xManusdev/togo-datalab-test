"use client";

import { Button } from "@/components/ui/button";

interface PaginationProps {
    page: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    onPageChange: (page: number) => void;
}

export function Pagination({
    page,
    totalPages,
    hasNextPage,
    hasPrevPage,
    onPageChange,
}: PaginationProps) {
    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-center gap-2">
            <Button
                variant="outline"
                size="sm"
                disabled={!hasPrevPage}
                onClick={() => onPageChange(page - 1)}
            >
                Précédent
            </Button>
            <span className="text-sm text-muted-foreground">
                Page {page} sur {totalPages}
            </span>
            <Button
                variant="outline"
                size="sm"
                disabled={!hasNextPage}
                onClick={() => onPageChange(page + 1)}
            >
                Suivant
            </Button>
        </div>
    );
}
