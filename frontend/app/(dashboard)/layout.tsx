"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useAuth } from "@/hooks/useAuth";
import { useUIStore } from "@/stores/useUIStore";
import { cn } from "@/lib/utils";
import { Loader } from "lucide-react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();
    const { sidebarCollapsed } = useUIStore();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login");
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="min-h-screen bg-muted/30">
            <Sidebar />
            <div
                className={cn(
                    "transition-all duration-300",
                    sidebarCollapsed ? "ml-[72px]" : "ml-[280px]"
                )}
            >
                <Header />
                <main className="p-8 rounded-2xl border-2 border-muted">{children}</main>
            </div>
        </div>
    );
}
