"use client";

import { Settings, Shield, Bell, Database } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export default function AdminSettingsPage() {
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
                <h1 className="text-2xl font-bold">Paramètres</h1>
                <p className="text-muted-foreground">
                    Configurez l'application Carrent
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="h-5 w-5" />
                            Général
                        </CardTitle>
                        <CardDescription>
                            Paramètres généraux de l'application
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Nom de l'application</p>
                                <p className="text-sm text-muted-foreground">Carrent</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Version</p>
                                <p className="text-sm text-muted-foreground">1.0.0</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5" />
                            Notifications
                        </CardTitle>
                        <CardDescription>Paramètres des notifications</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Notifications temps réel</p>
                                <p className="text-sm text-muted-foreground">
                                    Activez Socket.io sur le backend
                                </p>
                            </div>
                            <Button variant="outline" disabled>
                                Configurer
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Database className="h-5 w-5" />
                            Base de données
                        </CardTitle>
                        <CardDescription>État de la base de données</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">PostgreSQL</p>
                                <p className="text-sm text-muted-foreground">
                                    Connecté via Prisma
                                </p>
                            </div>
                            <div className="h-3 w-3 rounded-full bg-green-500" />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Migrations</p>
                                <p className="text-sm text-muted-foreground">À jour</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Sécurité
                        </CardTitle>
                        <CardDescription>Paramètres de sécurité</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Rate Limiting</p>
                                <p className="text-sm text-muted-foreground">
                                    100 req/15min (API), 10 req/15min (Auth)
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">JWT Expiration</p>
                                <p className="text-sm text-muted-foreground">24 heures</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
