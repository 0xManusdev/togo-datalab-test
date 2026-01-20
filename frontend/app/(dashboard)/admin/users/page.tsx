"use client";

import { useState } from "react";
import { Users, Shield, Plus, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Modal } from "@/components/ui/modal";
import { useAuth } from "@/hooks/useAuth";
import { useUsers, useCreateUser, useDeleteUser, CreateUserInput } from "@/hooks/useUsers";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function AdminUsersPage() {
	const { user: currentUser } = useAuth();
	const { data, isLoading } = useUsers();
	const createUser = useCreateUser();
	const deleteUser = useDeleteUser();

	const [showCreateModal, setShowCreateModal] = useState(false);
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
			<div className="flex flex-col items-center justify-center py-16">
				<Shield className="h-16 w-16 text-muted-foreground/50" />
				<h3 className="mt-4 text-lg font-medium">Accès refusé</h3>
				<p className="text-muted-foreground">
					Cette page est réservée aux administrateurs
				</p>
			</div>
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
		} catch {
			toast.error("Erreur lors de la création");
		}
	};

	const handleDeleteUser = async () => {
		if (!userToDelete) return;
		try {
			await deleteUser.mutateAsync(userToDelete);
			toast.success("Utilisateur supprimé");
			setUserToDelete(null);
		} catch {
			toast.error("Erreur lors de la suppression");
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">Gestion des utilisateurs</h1>
					<p className="text-muted-foreground">
						Gérez les utilisateurs de la plateforme
					</p>
				</div>
				<Button onClick={() => setShowCreateModal(true)}>
					<Plus className="mr-2 h-4 w-4" />
					Nouvel utilisateur
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Users className="h-5 w-5" />
						Utilisateurs ({users.length})
					</CardTitle>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="space-y-4">
							{[1, 2, 3].map((i) => (
								<Skeleton key={i} className="h-16 w-full" />
							))}
						</div>
					) : users.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-12">
							<Users className="h-16 w-16 text-muted-foreground/50" />
							<h3 className="mt-4 text-lg font-medium">Aucun utilisateur</h3>
							<p className="text-muted-foreground">
								Commencez par créer un utilisateur
							</p>
						</div>
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
										<Badge
											variant={user.role === "ADMIN" ? "default" : "secondary"}
										>
											{user.role === "ADMIN" ? "Admin" : "Employé"}
										</Badge>
										<div>
											{user.id !== currentUser?.id && (
												<Button
													variant="ghost"
													size="icon"
													className="text-destructive hover:text-destructive"
													onClick={() => setUserToDelete(user.id)}
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
			<Modal
				isOpen={!!userToDelete}
				onClose={() => setUserToDelete(null)}
				title="Supprimer cet utilisateur ?"
				description="Cette action est irréversible."
			>
				<div className="flex justify-end gap-3 mt-6">
					<Button variant="outline" onClick={() => setUserToDelete(null)}>
						Annuler
					</Button>
					<Button
						variant="destructive"
						onClick={handleDeleteUser}
						disabled={deleteUser.isPending}
					>
						{deleteUser.isPending ? "Suppression..." : "Supprimer"}
					</Button>
				</div>
			</Modal>
		</div>
	);
}
