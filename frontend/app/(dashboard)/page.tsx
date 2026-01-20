"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Car, Calendar, CalendarCheck, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useBookings } from "@/hooks/useBookings";
import { useVehicles } from "@/hooks/useVehicles";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Loader2 } from "lucide-react";

function StatsCard({
    title,
    value,
    description,
    icon: Icon,
    loading,
}: {
    title: string;
    value: string | number;
    description: string;
    icon: React.ElementType;
    loading?: boolean;
}) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {loading ? (
                    <Skeleton className="h-8 w-20" />
                ) : (
                    <div className="text-2xl font-bold">{value}</div>
                )}
                <p className="text-xs text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    );
}

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
                <h1 className="text-2xl font-bold">
                    Voici un aperçu de votre parc automobile
                </h1>
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

            {/* Recent Bookings & Available Vehicles */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Upcoming Bookings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Prochaines réservations</CardTitle>
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
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left text-muted-foreground">
                                            <th className="pb-2 font-medium">Véhicule</th>
                                            <th className="pb-2 font-medium">Utilisateur</th>
                                            <th className="pb-2 font-medium">Destination</th>
                                            <th className="pb-2 font-medium">Période</th>
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
                                                    {booking.user?.firstName} {booking.user?.lastName}
                                                </td>
                                                <td className="py-3 text-muted-foreground">
                                                    {booking.destination || "-"}
                                                </td>
                                                <td className="py-3 text-muted-foreground whitespace-nowrap">
                                                    {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                                                </td>
                                                <td className="py-3">
                                                    <Badge variant="success">Confirmée</Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Available Vehicles */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Véhicules disponibles</CardTitle>
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
                                        className="flex items-center justify-between rounded-lg border p-4"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10 text-green-600">
                                                <Car className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className="font-medium">
                                                    {vehicle.brand} {vehicle.model}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {vehicle.licensePlate}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant="success">Disponible</Badge>
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

