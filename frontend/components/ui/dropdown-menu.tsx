"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface DropdownMenuProps {
	trigger: React.ReactNode;
	children: React.ReactNode;
	align?: "left" | "right";
}

export function DropdownMenu({
	trigger,
	children,
	align = "right",
}: DropdownMenuProps) {
	const [isOpen, setIsOpen] = React.useState(false);
	const dropdownRef = React.useRef<HTMLDivElement>(null);

	React.useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		}

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	return (
		<div className="relative" ref={dropdownRef}>
			<div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
			{isOpen && (
				<div
					className={cn(
						"absolute top-full mt-2 min-w-[180px] rounded-lg border bg-popover p-1 shadow-lg z-50",
						align === "right" ? "right-0" : "left-0"
					)}
				>
					{children}
				</div>
			)}
		</div>
	);
}

interface DropdownMenuItemProps {
	children: React.ReactNode;
	onClick?: () => void;
	destructive?: boolean;
}

export function DropdownMenuItem({
	children,
	onClick,
	destructive,
}: DropdownMenuItemProps) {
	return (
		<button
			onClick={onClick}
			className={cn(
				"flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
				destructive
					? "text-destructive hover:bg-destructive/10"
					: "text-foreground hover:bg-muted"
			)}
		>
			{children}
		</button>
	);
}

export function DropdownMenuSeparator() {
	return <div className="my-1 h-px bg-border" />;
}
