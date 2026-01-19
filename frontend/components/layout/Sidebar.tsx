"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
	LayoutDashboard,
	Car,
	Calendar,
	CalendarDays,
	CalendarPlus,
	Users,
	Settings,
	ChevronLeft,
	ChevronRight,
	User,
	LogOut,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useUIStore } from "@/stores/useUIStore";

const mainNavItems = [
	{
		title: "Réserver",
		href: "/book",
		icon: CalendarPlus,
	},
	{
		title: "Mes réservations",
		href: "/bookings",
		icon: Calendar,
	},
	{
		title: "Calendrier",
		href: "/bookings/calendar",
		icon: CalendarDays,
	},
	{
		title: "Mon profil",
		href: "/profile",
		icon: User,
	},
];

const adminOnlyNavItems = [
	{
		title: "Tableau de bord",
		href: "/",
		icon: LayoutDashboard,
	},
];

const adminNavItems = [
	{
		title: "Véhicules",
		href: "/vehicles",
		icon: Car,
	},
	{
		title: "Utilisateurs",
		href: "/admin/users",
		icon: Users,
	},
	// {
	// 	title: "Paramètres",
	// 	href: "/admin/settings",
	// 	icon: Settings,
	// },
];

export function Sidebar() {
	const pathname = usePathname();
	const router = useRouter();
	const { user, logout } = useAuth();
	const { sidebarCollapsed, toggleSidebar } = useUIStore();

	const isAdmin = user?.role === "ADMIN";

	const handleLogout = async () => {
		await logout();
		toast.success("Déconnexion réussie");
		router.push("/login");
	};

	return (
		<aside
			className={cn(
				"fixed left-0 top-0 z-40 h-screen bg-background/90 transition-all duration-300",
				sidebarCollapsed ? "w-[72px]" : "w-[280px]"
			)}
		>
			<div className="flex h-full flex-col">
				<div className="flex h-16 items-center justify-between px-4">
					<Link href="/" className="flex items-center gap-2">
						{!sidebarCollapsed && (
							<span className="text-xl font-bold text-primary">Carrent</span>
						)}
					</Link>
					<Button
						variant="ghost"
						size="icon"
						onClick={toggleSidebar}
						className="h-8 w-8 p-4 cursor-pointer"
					>
						{sidebarCollapsed ? (
							<ChevronRight className="h-4 w-4" />
						) : (
							<ChevronLeft className="h-4 w-4" />
						)}
					</Button>
				</div>

				<nav className="flex-1 space-y-1 p-4">
					{isAdmin && (
						<div className="space-y-1 mb-2">
							{adminOnlyNavItems.map((item) => (
								<Link
									key={item.href}
									href={item.href}
									className={cn(
										"flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
										pathname === item.href
											? "bg-primary text-primary-foreground"
											: "text-muted-foreground hover:bg-muted hover:text-foreground"
									)}
								>
									<item.icon className="h-5 w-5 shrink-0" />
									{!sidebarCollapsed && <span>{item.title}</span>}
								</Link>
							))}
						</div>
					)}

					<div className="space-y-1">
						{mainNavItems.map((item) => (
							<Link
								key={item.href}
								href={item.href}
								className={cn(
									"flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
									pathname === item.href
										? "bg-primary text-primary-foreground"
										: "text-muted-foreground hover:bg-muted hover:text-foreground"
								)}
							>
								<item.icon className="h-5 w-5 shrink-0" />
								{!sidebarCollapsed && <span>{item.title}</span>}
							</Link>
						))}
					</div>

					{isAdmin && (
						<>
							<div className="my-4 border-t" />
							<div className="mb-2 px-3">
								{!sidebarCollapsed && (
									<span className="text-xs font-semibold uppercase text-muted-foreground">
										Administration
									</span>
								)}
							</div>
							<div className="space-y-1">
								{adminNavItems.map((item) => (
									<Link
										key={item.href}
										href={item.href}
										className={cn(
											"flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
											pathname === item.href
												? "bg-primary text-primary-foreground"
												: "text-muted-foreground hover:bg-muted hover:text-foreground"
										)}
									>
										<item.icon className="h-5 w-5 shrink-0" />
										{!sidebarCollapsed && <span>{item.title}</span>}
									</Link>
								))}
							</div>
						</>
					)}
				</nav>

				<div className="border-t p-4">
					<Button
						variant="ghost"
						size="sm"
						onClick={handleLogout}
						className="w-full justify-start cursor-pointer p-4 text-muted-foreground hover:text-destructive"
					>
						<LogOut className="h-5 w-5 shrink-0" />
						{!sidebarCollapsed && <span className="ml-3">Déconnexion</span>}
					</Button>
				</div>
			</div>
		</aside>
	);
}

