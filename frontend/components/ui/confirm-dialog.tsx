"use client";

import { Modal } from "./modal";
import { Button } from "./button";

interface ConfirmDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	title: string;
	description?: string;
	confirmText?: string;
	cancelText?: string;
	isLoading?: boolean;
	variant?: "default" | "destructive";
}

export function ConfirmDialog({
	isOpen,
	onClose,
	onConfirm,
	title,
	description,
	confirmText = "Confirmer",
	cancelText = "Annuler",
	isLoading = false,
	variant = "default",
}: ConfirmDialogProps) {
	return (
		<Modal isOpen={isOpen} onClose={onClose} title={title} description={description}>
			<div className="flex justify-end gap-3 mt-6">
				<Button variant="outline" onClick={onClose} disabled={isLoading}>
					{cancelText}
				</Button>
				<Button
					variant={variant === "destructive" ? "destructive" : "default"}
					onClick={onConfirm}
					disabled={isLoading}
				>
					{isLoading ? "Suppression..." : confirmText}
				</Button>
			</div>
		</Modal>
	);
}
