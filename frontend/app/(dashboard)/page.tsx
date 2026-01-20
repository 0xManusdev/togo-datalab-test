"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Car, Calendar, CalendarCheck, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/components/ui/stats-card";
import { useAuth } from "@/hooks/useAuth";
import { useBookings } from "@/hooks/useBookings";
import { useVehicles } from "@/hooks/useVehicles";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { ROUTES } from "@/lib/constants";

export default function DashboardPage() {
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();
    const { data: bookingsData, isLoading: bookingsLoading } = useBookings(1, 10);
    const { data: vehiclesData, isLoading: vehiclesLoading } = useVehicles(1, 100);

    const isAdmin = user?.role === "ADMIN";

    useEffect(() => {
        if (!authLoading && user && !isAdmin) {
            router.replace("/book");
        }
    }, [authLoading, user, isAdmin, router]);

    if (authLoading || (!isAdmin && user)) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const bookings = bookingsData?.data || [];
    const vehicles = vehiclesData?.data || [];

    const confirmedBookings = bookings.filter((b) => b.status === "CONFIRMED");
    const availableVehicles = vehicles.filter((v) => v.isAvailable);

    const upcomingBookings = confirmedBookings
        .filter((b) => new Date(b.startDate) > new Date())
        .slice(0, 5);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Aperçu du parc</h1>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Réservations ce mois"
                    value={bookingsData?.pagination?.total || 0}
                    description="Total des réservations"
                    icon={Calendar}
                    loading={bookingsLoading}
                />
                <StatsCard
                    title="Véhicules disponibles"
                    value={`${availableVehicles.length}/${vehicles.length}`}
                    description="Prêts à être réservés"
                    icon={Car}
                    loading={vehiclesLoading}
                />
                <StatsCard
                    title="Réservations actives"
                    value={confirmedBookings.length}
                    description="En cours ou à venir"
                    icon={CalendarCheck}
                    loading={bookingsLoading}
                />
                <StatsCard
                    title="Taux d'utilisation"
                    value={vehicles.length > 0
                        ? `${Math.round((confirmedBookings.length / vehicles.length) * 100)}%`
                        : "0%"
                    }
                    description="Ce mois"
                    icon={TrendingUp}
                    loading={vehiclesLoading || bookingsLoading}
                />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Prochaines réservations</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {bookingsLoading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <Skeleton key={i} className="h-10 w-full" />
                                ))}
                            </div>
                        ) : upcomingBookings.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">
                                Aucune réservation à venir
                            </p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="border-b text-left text-muted-foreground">
                                            <th className="pb-2 font-medium">Véhicule</th>
                                            <th className="pb-2 font-medium">Utilisateur</th>
                                            <th className="pb-2 font-medium">Destination</th>
                                            <th className="pb-2 font-medium">Statut</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {upcomingBookings.map((booking) => (
                                            <tr key={booking.id} className="hover:bg-muted/50">
                                                <td className="py-3 font-medium">
                                                    {booking.vehicle.brand} {booking.vehicle.model}
                                                </td>
                                                <td className="py-3">
                                                    M.{booking.user?.lastName}
                                                </td>
                                                <td className="py-3 text-muted-foreground">
                                                    {booking.destination || "-"}
                                                </td>
                                                <td className="py-3">
                                                    <Badge variant="success" className="font-light text-[10px]">Confirmée</Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Véhicules disponibles</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {vehiclesLoading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center gap-4">
                                        <Skeleton className="h-12 w-12 rounded-lg" />
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-32" />
                                            <Skeleton className="h-3 w-24" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : availableVehicles.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">
                                Aucun véhicule disponible
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {availableVehicles.slice(0, 5).map((vehicle) => (
                                    <div
                                        key={vehicle.id}
                                        className="flex items-center justify-between rounded-lg border p-2"
                                    >
                                        <div className="flex items-center gap-4">
                                            <p className="font-medium text-xs">
                                                {vehicle.brand} {vehicle.model}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {vehicle.licensePlate}
                                            </p>
                                        </div>
                                        <Badge variant="success" className="text-xs font-light">Disponible</Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

