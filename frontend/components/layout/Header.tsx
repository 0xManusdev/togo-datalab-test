"use client";

import { useRouter } from "next/navigation";
import { Bell, LogOut, Moon, Sun, User } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuItem,
	DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";

export function Header() {
	const { user, logout } = useAuth();
	const { theme, setTheme } = useTheme();
	const router = useRouter();

	const handleLogout = async () => {
		await logout();
		toast.success("Déconnexion réussie");
		router.push("/login");
	};

	const initials = user
		? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
		: "?";

	return (
		<header className="sticky top-0 z-30 flex h-16 items-center justify-between border-none bg-background px-6">
			<div className="flex items-center gap-4">
				<h1 className="text-lg font-normal">
					Bienvenue, <span className="font-bold">{user?.firstName}</span> 👋
				</h1>
			</div>

			<div className="flex items-center gap-2">
				{/* Notifications */}
				{/* <Button variant="ghost" size="icon" className="relative">
					<Bell className="h-5 w-5" />
					<span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
						3
					</span>
				</Button> */}

				{/* Theme Toggle */}
				<Button
					variant="ghost"
					size="icon"
					onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
				>
					<Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
					<Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
					<span className="sr-only">Toggle theme</span>
				</Button>

				{/* User Menu with Dropdown */}
				<div className="flex items-center gap-3 border-l pl-4">
					{/* <div className="hidden text-right sm:block">
						<p className="text-sm font-medium">
							{user?.firstName} {user?.lastName}
						</p>
						<p className="text-xs text-muted-foreground">
							{user?.role === "ADMIN" ? "Administrateur" : "Employé"}
						</p>
					</div> */}
					<DropdownMenu
						trigger={
							<Avatar className="cursor-pointer transition-opacity hover:opacity-80">
								<AvatarFallback className="bg-primary text-primary-foreground">
									{initials}
								</AvatarFallback>
							</Avatar>
						}
					>
						<DropdownMenuItem onClick={() => router.push("/profile")}>
							<User className="h-4 w-4" />
							Profile
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={handleLogout} destructive>
							<LogOut className="h-4 w-4" />
							Sign out
						</DropdownMenuItem>
					</DropdownMenu>
				</div>
			</div>
		</header>
	);
}

