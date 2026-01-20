"use client";

import { useRouter } from "next/navigation";
import { Bell, LogOut, Menu, Moon, Sun, User } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
	DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
	DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useUIStore } from "@/stores/useUIStore";

export function Header() {
	const { user, logout } = useAuth();
	const { theme, setTheme } = useTheme();
	const { toggleMobileMenu } = useUIStore();
	const router = useRouter();

	const handleLogout = async () => {
		await logout();
		toast.success("Déconnexion réussie");
		router.push("/login");
	};

	return (
		<header className="sticky top-0 z-30 flex h-14 items-center justify-between border-none bg-background px-6">
			<div className="flex items-center gap-4">
				<Button
					variant="ghost"
					size="icon"
					className="md:hidden"
					onClick={toggleMobileMenu}
				>
					<Menu className="h-5 w-5" />
				</Button>
				<h1 className="text-sm font-medium">
					Bienvenue, <span className="font-semibold">{user?.firstName} !</span>
				</h1>
			</div>

			<div className="flex items-center gap-2">
				<Button
					variant="ghost"
					size="icon"
					onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
				>
					<Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
					<Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
					<span className="sr-only">Toggle theme</span>
				</Button>

				<div className="flex items-center gap-3 border-l pl-4">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Avatar className="cursor-pointer transition-opacity hover:opacity-80">
								<AvatarFallback className="bg-primary text-primary-foreground">
									<User className="h-4 w-4" />
								</AvatarFallback>
							</Avatar>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onClick={handleLogout} className="text-destructive text-xs cursor-pointer focus:text-destructive">
								<LogOut className="h-4 w-4" />
								Déconnexion
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</header>
	);
}

