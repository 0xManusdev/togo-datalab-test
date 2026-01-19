"use client";

import { User, Lock, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { formatDate } from "@/lib/utils";

export default function ProfilePage() {
	const { user } = useAuth();

	if (!user) return null;

	return (
		<div className="mx-auto max-w-2xl space-y-6">
			<div>
				<h1 className="text-2xl font-bold">Mon profil</h1>
				<p className="text-muted-foreground">
					Gérez vos informations personnelles
				</p>
			</div>

			{/* User Info */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<User className="h-5 w-5" />
						Informations personnelles
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center gap-4">
						<div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
							{user.firstName[0]}
							{user.lastName[0]}
						</div>
						<div>
							<h3 className="text-lg font-semibold">
								{user.firstName} {user.lastName}
							</h3>
							<Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
								{user.role === "ADMIN" ? "Administrateur" : "Employé"}
							</Badge>
						</div>
					</div>

					<div className="grid gap-3 pt-4">
						<div className="flex justify-between rounded-lg border p-3">
							<span className="text-muted-foreground">Email</span>
							<span className="font-medium">{user.email}</span>
						</div>
						<div className="flex justify-between rounded-lg border p-3">
							<span className="text-muted-foreground">Téléphone</span>
							<span className="font-medium">{user.phone}</span>
						</div>
						<div className="flex justify-between rounded-lg border p-3">
							<span className="text-muted-foreground">Membre depuis</span>
							<span className="font-medium">{formatDate(user.createdAt)}</span>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Security */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Lock className="h-5 w-5" />
						Sécurité
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-between">
						<div>
							<p className="font-medium">Mot de passe</p>
							<p className="text-sm text-muted-foreground">
								Dernière modification il y a longtemps
							</p>
						</div>
						<Button variant="outline" disabled>
							Modifier
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Preferences */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Settings className="h-5 w-5" />
						Préférences
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-between">
						<div>
							<p className="font-medium">Thème</p>
							<p className="text-sm text-muted-foreground">
								Utilisez le toggle dans le header pour changer de thème
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
