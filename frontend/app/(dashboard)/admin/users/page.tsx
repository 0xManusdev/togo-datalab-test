"use client";

import { Users, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { formatDate } from "@/lib/utils";

// Note: This would need a backend endpoint to list all users
// For now, showing a placeholder

export default function AdminUsersPage() {
    const { user } = useAuth();

    if (user?.role !== "ADMIN") {
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

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Gestion des utilisateurs</h1>
                <p className="text-muted-foreground">
                    Gérez les utilisateurs de la plateforme
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Utilisateurs
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-12">
                        <Users className="h-16 w-16 text-muted-foreground/50" />
                        <h3 className="mt-4 text-lg font-medium">
                            Fonctionnalité à venir
                        </h3>
                        <p className="text-center text-muted-foreground">
                            La gestion des utilisateurs nécessite un endpoint backend
                            supplémentaire pour lister tous les utilisateurs.
                        </p>
                    </div>

                    {/* Placeholder for future implementation */}
                    <div className="mt-8 rounded-lg border">
                        <div className="border-b px-4 py-3">
                            <div className="grid grid-cols-4 text-sm font-medium text-muted-foreground">
                                <span>Nom</span>
                                <span>Email</span>
                                <span>Rôle</span>
                                <span>Actions</span>
                            </div>
                        </div>
                        <div className="divide-y">
                            <div className="grid grid-cols-4 items-center px-4 py-3">
                                <span className="font-medium">
                                    {user.firstName} {user.lastName}
                                </span>
                                <span className="text-muted-foreground">{user.email}</span>
                                <Badge>Admin</Badge>
                                <span className="text-sm text-muted-foreground">-</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
