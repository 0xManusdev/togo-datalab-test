"use client";

import { Skeleton } from "@/components/ui/skeleton";

interface TableSkeletonProps {
    rows?: number;
    height?: string;
}

export function TableSkeleton({ rows = 4, height = "h-12" }: TableSkeletonProps) {
    return (
        <div className="space-y-4">
            {Array.from({ length: rows }).map((_, i) => (
                <Skeleton key={i} className={`${height} w-full`} />
            ))}
        </div>
    );
}
