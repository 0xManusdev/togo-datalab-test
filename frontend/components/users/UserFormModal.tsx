"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { User } from "@/types";

export interface UserFormData {
	email: string;
	firstName: string;
	lastName: string;
	phone: string;
	password?: string;
	role: "ADMIN" | "EMPLOYEE";
}

interface UserFormModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (data: UserFormData) => Promise<void>;
	user?: User | null;
	isLoading?: boolean;
}

export function UserFormModal({
	isOpen,
	onClose,
	onSubmit,
	user,
	isLoading = false,
}: UserFormModalProps) {
	const isEditMode = !!user;

	const [formData, setFormData] = useState<UserFormData>({
		email: "",
		firstName: "",
		lastName: "",
		phone: "",
		password: "",
		role: "EMPLOYEE",
	});

	useEffect(() => {
		if (user) {
			setFormData({
				email: user.email,
				firstName: user.firstName,
				lastName: user.lastName,
				phone: user.phone || "",
				role: user.role,
			});
		} else {
			setFormData({
				email: "",
				firstName: "",
				lastName: "",
				phone: "",
				password: "",
				role: "EMPLOYEE",
			});
		}
	}, [user, isOpen]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		await onSubmit(formData);
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={isEditMode ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
			description={isEditMode ? "Modifier les informations" : "Créer un nouveau compte"}
		>
			<form onSubmit={handleSubmit} className="space-y-4">
				<div className="grid gap-4 sm:grid-cols-2">
					<div className="space-y-2">
						<Label htmlFor="firstName">Prénom</Label>
						<Input
							id="firstName"
							value={formData.firstName}
							onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
							required
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="lastName">Nom</Label>
						<Input
							id="lastName"
							value={formData.lastName}
							onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
							required
						/>
					</div>
				</div>
				<div className="space-y-2">
					<Label htmlFor="email">Email</Label>
					<Input
						id="email"
						type="email"
						value={formData.email}
						onChange={(e) => setFormData({ ...formData, email: e.target.value })}
						required
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor="phone">Téléphone</Label>
					<Input
						id="phone"
						value={formData.phone}
						onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
						placeholder="+22890000000"
					/>
				</div>
				{!isEditMode && (
					<div className="space-y-2">
						<Label htmlFor="password">Mot de passe</Label>
						<Input
							id="password"
							type="password"
							value={formData.password}
							onChange={(e) => setFormData({ ...formData, password: e.target.value })}
							required
							minLength={8}
						/>
					</div>
				)}
				<div className="space-y-2">
					<Label htmlFor="role">Rôle</Label>
					<select
						id="role"
						className="w-full rounded-md border border-input bg-background px-3 py-2"
						value={formData.role}
						onChange={(e) => setFormData({ ...formData, role: e.target.value as "ADMIN" | "EMPLOYEE" })}
					>
						<option value="EMPLOYEE">Employé</option>
						<option value="ADMIN">Administrateur</option>
					</select>
				</div>
				<div className="flex justify-end gap-3 pt-4">
					<Button type="button" variant="outline" onClick={onClose}>
						Annuler
					</Button>
					<Button type="submit" disabled={isLoading}>
						{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						{isEditMode ? "Enregistrer" : "Créer"}
					</Button>
				</div>
			</form>
		</Modal>
	);
}
