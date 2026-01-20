"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useUIStore } from "@/stores/useUIStore";
import {
    ROUTES,
    MAIN_NAV_ITEMS,
    ADMIN_ONLY_NAV_ITEMS,
    ADMIN_NAV_ITEMS,
} from "@/lib/constants";

export function MobileSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuth();
    const { mobileMenuOpen, setMobileMenuOpen } = useUIStore();

    const isAdmin = user?.role === "ADMIN";

    useEffect(() => {
        setMobileMenuOpen(false);
    }, [pathname, setMobileMenuOpen]);

    const handleLogout = async () => {
        await logout();
        toast.success("Déconnexion réussie");
        router.push(ROUTES.LOGIN);
        setMobileMenuOpen(false);
    };

    if (!mobileMenuOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex md:hidden">
            <div 
                className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in-0"
                onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative flex w-3/4 max-w-xs flex-col bg-background shadow-xl animate-in slide-in-from-left duration-300">
                <div className="flex h-16 items-center justify-between border-b px-4">
                    <span className="text-xl font-bold text-primary">Carrent</span>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    <nav className="space-y-4">
                        {isAdmin && (
                            <div className="space-y-1">
                                {ADMIN_ONLY_NAV_ITEMS.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                            pathname === item.href
                                                ? "bg-primary text-primary-foreground"
                                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                        )}
                                    >
                                        <item.icon className="h-5 w-5 shrink-0" />
                                        <span>{item.title}</span>
                                    </Link>
                                ))}
                            </div>
                        )}

                        <div className="space-y-1">
                            {MAIN_NAV_ITEMS.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                        pathname === item.href
                                            ? "bg-primary text-primary-foreground"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    )}
                                >
                                    <item.icon className="h-5 w-5 shrink-0" />
                                    <span>{item.title}</span>
                                </Link>
                            ))}
                        </div>

                        {isAdmin && (
                            <>
                                <div className="border-t pt-4">
                                    <span className="px-3 text-xs font-semibold uppercase text-muted-foreground">
                                        Administration
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    {ADMIN_NAV_ITEMS.map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={cn(
                                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                                pathname === item.href
                                                    ? "bg-primary text-primary-foreground"
                                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                            )}
                                        >
                                            <item.icon className="h-5 w-5 shrink-0" />
                                            <span>{item.title}</span>
                                        </Link>
                                    ))}
                                </div>
                            </>
                        )}
                    </nav>
                </div>

                <div className="border-t p-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLogout}
                        className="w-full justify-start cursor-pointer text-muted-foreground hover:text-destructive"
                    >
                        <LogOut className="h-5 w-5 shrink-0" />
                        <span className="ml-3">Déconnexion</span>
                    </Button>
                </div>
            </div>
        </div>
    );
}
