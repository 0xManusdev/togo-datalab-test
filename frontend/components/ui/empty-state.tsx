"use client";

import { cn } from "@/lib/utils";

interface EmptyStateProps {
    icon: React.ElementType;
    title: string;
    description: string;
    action?: React.ReactNode;
    className?: string;
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    className,
}: EmptyStateProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center py-16", className)}>
            <Icon className="h-16 w-16 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">{title}</h3>
            <p className="text-muted-foreground">{description}</p>
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
}
