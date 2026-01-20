"use client";

import { useState } from "react";
import { Users, Shield, Plus, Trash2, Pencil } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { UserFormModal, UserFormData } from "@/components/users/UserFormModal";
import { useAuth } from "@/hooks/useAuth";
import { useUsers, useCreateUser, useDeleteUser, useUpdateUser } from "@/hooks/useUsers";
import { handleError } from "@/lib/error-handler";
import { toast } from "sonner";
import { User } from "@/types";

export default function AdminUsersPage() {
	const { user: currentUser } = useAuth();
	const { data, isLoading } = useUsers();
	const createUser = useCreateUser();
	const deleteUser = useDeleteUser();
	const updateUser = useUpdateUser();

	const [showFormModal, setShowFormModal] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [userToDelete, setUserToDelete] = useState<string | null>(null);

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

	const handleFormSubmit = async (formData: UserFormData) => {
		try {
			if (selectedUser) {
				await updateUser.mutateAsync({ 
					id: selectedUser.id, 
					data: {
						email: formData.email,
						firstName: formData.firstName,
						lastName: formData.lastName,
						phone: formData.phone,
						role: formData.role,
					}
				});
				toast.success("Utilisateur modifié avec succès");
			} else {
				await createUser.mutateAsync({
					email: formData.email,
					password: formData.password!,
					firstName: formData.firstName,
					lastName: formData.lastName,
					phone: formData.phone,
					role: formData.role,
				});
				toast.success("Utilisateur créé avec succès");
			}
			closeFormModal();
		} catch (error) {
			handleError(error, selectedUser ? "Modification impossible" : "Création impossible");
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

	const openCreateModal = () => {
		setSelectedUser(null);
		setShowFormModal(true);
	};

	const openEditModal = (user: User) => {
		setSelectedUser(user);
		setShowFormModal(true);
	};

	const closeFormModal = () => {
		setShowFormModal(false);
		setSelectedUser(null);
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
					<Button onClick={openCreateModal}>
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
						<div className="rounded-lg border overflow-hidden">
							<div className="overflow-x-auto">
								<div className="min-w-[800px]">
									<div className="border-b px-4 py-3 bg-muted/50">
										<div className="grid grid-cols-5 text-xs font-medium text-muted-foreground">
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
												className="grid grid-cols-5 items-center px-4 py-3 hover:bg-muted/50 transition-colors"
											>
												<span className="font-medium text-xs truncate pr-2">
													{user.firstName} {user.lastName}
												</span>
												<span className="text-xs text-muted-foreground truncate pr-2">
													{user.email}
												</span>
												<span className="text-xs text-muted-foreground truncate pr-2">
													{user.phone || "-"}
												</span>
												<span className="text-xs text-muted-foreground">
													{user.role === "ADMIN" ? "Admin" : "Employé"}
												</span>
												<div className="flex gap-1">
													<Button
														variant="ghost"
														size="icon"
														className="h-8 w-8"
														onClick={() => openEditModal(user)}
													>
														<Pencil className="h-4 w-4" />
													</Button>
													{user.id !== currentUser?.id && (
														<Button
															variant="ghost"
															size="icon"
															className="text-destructive hover:text-destructive h-8 w-8"
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
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			<UserFormModal
				isOpen={showFormModal}
				onClose={closeFormModal}
				onSubmit={handleFormSubmit}
				user={selectedUser}
				isLoading={createUser.isPending || updateUser.isPending}
			/>

			<ConfirmDialog
				isOpen={showDeleteModal}
				onClose={() => { setShowDeleteModal(false); setUserToDelete(null); }}
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
