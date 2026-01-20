"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	children: React.ReactNode;
	title?: string;
	description?: string;
	className?: string;
}

export function Modal({
	isOpen,
	onClose,
	children,
	title,
	description,
	className,
}: ModalProps) {
	React.useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};

		if (isOpen) {
			document.addEventListener("keydown", handleEscape);
			document.body.style.overflow = "hidden";
		}

		return () => {
			document.removeEventListener("keydown", handleEscape);
			document.body.style.overflow = "unset";
		};
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			<div
				className="absolute inset-0 bg-black/50 backdrop-blur-sm"
				onClick={onClose}
			/>
			<div
				className={cn(
					"relative z-10 w-full max-w-lg rounded-xl bg-background p-6 shadow-lg",
					"animate-in fade-in-0 zoom-in-95 duration-200",
					className
				)}
			>
				<Button
					variant="ghost"
					size="icon"
					className="absolute right-4 top-4"
					onClick={onClose}
				>
					<X className="h-4 w-4" />
				</Button>

				{(title || description) && (
					<div className="mb-6">
						{title && (
							<h2 className="text-xl font-semibold">{title}</h2>
						)}
						{description && (
							<p className="mt-1 text-sm text-muted-foreground">
								{description}
							</p>
						)}
					</div>
				)}

				{children}
			</div>
		</div>
	);
}
