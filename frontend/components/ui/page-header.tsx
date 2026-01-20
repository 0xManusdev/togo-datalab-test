"use client";

import { cn } from "@/lib/utils";

interface PageHeaderProps {
    title: string;
    description?: string;
    action?: React.ReactNode;
    className?: string;
}

export function PageHeader({
    title,
    description,
    action,
    className,
}: PageHeaderProps) {
    return (
        <div className={cn(
            "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
            className
        )}>
            <div>
                <h1 className="text-2xl font-bold">{title}</h1>
                {description && (
                    <p className="text-muted-foreground">{description}</p>
                )}
            </div>
            {action && <div>{action}</div>}
        </div>
    );
}
