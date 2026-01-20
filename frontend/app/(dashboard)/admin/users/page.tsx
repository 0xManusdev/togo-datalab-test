"use client";

import { useState } from "react";
import { Users, Shield, Plus, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useUsers, useCreateUser, useDeleteUser, CreateUserInput } from "@/hooks/useUsers";
import { handleError } from "@/lib/error-handler";
import { toast } from "sonner";

export default function AdminUsersPage() {
	const { user: currentUser } = useAuth();
	const { data, isLoading } = useUsers();
	const createUser = useCreateUser();
	const deleteUser = useDeleteUser();

	const [showCreateModal, setShowCreateModal] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [userToDelete, setUserToDelete] = useState<string | null>(null);
	const [formData, setFormData] = useState<CreateUserInput>({
		email: "",
		password: "",
		firstName: "",
		lastName: "",
		phone: "",
		role: "EMPLOYEE",
	});

	if (currentUser?.role !== "ADMIN") {
		return (
			<EmptyState
				icon={Shield}
				title="Accès refusé"
				description="Cette page est réservée aux administrateurs"
			/>
		);
	}

	const users = data?.data || [];

	const handleCreateUser = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			await createUser.mutateAsync(formData);
			toast.success("Utilisateur créé avec succès");
			setShowCreateModal(false);
			setFormData({
				email: "",
				password: "",
				firstName: "",
				lastName: "",
				phone: "",
				role: "EMPLOYEE",
			});
		} catch (error) {
			handleError(error, "Création impossible");
		}
	};

	const handleDeleteUser = async () => {
		if (!userToDelete) return;
		try {
			await deleteUser.mutateAsync(userToDelete);
			toast.success("Utilisateur supprimé");
			setUserToDelete(null);
			setShowDeleteModal(false);
		} catch (error) {
			handleError(error, "Suppression impossible");
		}
	};

	const openDeleteModal = (userId: string) => {
		setUserToDelete(userId);
		setShowDeleteModal(true);
	};

	return (
		<div className="space-y-6">
			<PageHeader
				title="Gestion des utilisateurs"
				description="Gérez les utilisateurs de la plateforme"
				action={
					<Button onClick={() => setShowCreateModal(true)}>
						<Plus className="mr-2 h-4 w-4" />
						Nouvel utilisateur
					</Button>
				}
			/>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Users className="h-5 w-5" />
						Utilisateurs ({users.length})
					</CardTitle>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<TableSkeleton rows={3} height="h-16" />
					) : users.length === 0 ? (
						<EmptyState
							icon={Users}
							title="Aucun utilisateur"
							description="Commencez par créer un utilisateur"
							className="py-12"
						/>
					) : (
						<div className="rounded-lg border">
							<div className="border-b px-4 py-3">
								<div className="grid grid-cols-5 text-sm font-medium text-muted-foreground">
									<span>Nom</span>
									<span>Email</span>
									<span>Téléphone</span>
									<span>Rôle</span>
									<span>Actions</span>
								</div>
							</div>
							<div className="divide-y">
								{users.map((user) => (
									<div
										key={user.id}
										className="grid grid-cols-5 items-center px-4 py-3"
									>
										<span className="font-medium">
											{user.firstName} {user.lastName}
										</span>
										<span className="text-sm text-muted-foreground">
											{user.email}
										</span>
										<span className="text-sm text-muted-foreground">
											{user.phone || "-"}
										</span>
										<span className="text-sm text-muted-foreground">
											{user.role === "ADMIN" ? "Admin" : "Employé"}
										</span>
										<div>
											{user.id !== currentUser?.id && (
												<Button
													variant="ghost"
													size="icon"
													className="text-destructive hover:text-destructive"
													onClick={() => openDeleteModal(user.id)}
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											)}
										</div>
									</div>
								))}
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Create User Modal */}
			<Modal
				isOpen={showCreateModal}
				onClose={() => setShowCreateModal(false)}
				title="Nouvel utilisateur"
				description="Créer un nouveau compte utilisateur"
			>
				<form onSubmit={handleCreateUser} className="space-y-4">
					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="firstName">Prénom</Label>
							<Input
								id="firstName"
								value={formData.firstName}
								onChange={(e) =>
									setFormData({ ...formData, firstName: e.target.value })
								}
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="lastName">Nom</Label>
							<Input
								id="lastName"
								value={formData.lastName}
								onChange={(e) =>
									setFormData({ ...formData, lastName: e.target.value })
								}
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
							onChange={(e) =>
								setFormData({ ...formData, email: e.target.value })
							}
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="phone">Téléphone</Label>
						<Input
							id="phone"
							value={formData.phone}
							onChange={(e) =>
								setFormData({ ...formData, phone: e.target.value })
							}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="password">Mot de passe</Label>
						<Input
							id="password"
							type="password"
							value={formData.password}
							onChange={(e) =>
								setFormData({ ...formData, password: e.target.value })
							}
							required
							minLength={6}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="role">Rôle</Label>
						<select
							id="role"
							className="w-full rounded-md border border-input bg-background px-3 py-2"
							value={formData.role}
							onChange={(e) =>
								setFormData({
									...formData,
									role: e.target.value as "ADMIN" | "EMPLOYEE",
								})
							}
						>
							<option value="EMPLOYEE">Employé</option>
							<option value="ADMIN">Administrateur</option>
						</select>
					</div>

					<div className="flex justify-end gap-3 pt-4">
						<Button
							type="button"
							variant="outline"
							onClick={() => setShowCreateModal(false)}
						>
							Annuler
						</Button>
						<Button type="submit" disabled={createUser.isPending}>
							{createUser.isPending && (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							)}
							Créer
						</Button>
					</div>
				</form>
			</Modal>

			{/* Delete Confirmation Modal */}
			<ConfirmDialog
				isOpen={showDeleteModal}
				onClose={() => {
					setShowDeleteModal(false);
					setUserToDelete(null);
				}}
				onConfirm={handleDeleteUser}
				title="Supprimer cet utilisateur ?"
				description="Cette action est irréversible."
				confirmText="Supprimer"
				variant="destructive"
				isLoading={deleteUser.isPending}
			/>
		</div>
	);
}

