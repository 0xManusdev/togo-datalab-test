"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Car, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useBooking, useCancelBooking } from "@/hooks/useBookings";
import { useAuth } from "@/hooks/useAuth";
import { formatDate, formatDateTime } from "@/lib/utils";

export default function BookingDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const { user } = useAuth();
    const { data, isLoading } = useBooking(id);
    const cancelBooking = useCancelBooking();

    const booking = data?.data;
    const isAdmin = user?.role === "ADMIN";

    const handleCancel = async () => {
        if (!confirm("Êtes-vous sûr de vouloir annuler cette réservation ?")) return;
        try {
            await cancelBooking.mutateAsync(id);
            router.push("/bookings");
        } catch (error) {
            alert("Erreur lors de l'annulation");
        }
    };

    if (isLoading) {
        return (
            <div className="mx-auto max-w-2xl space-y-6">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-64" />
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="flex flex-col items-center justify-center py-16">
                <Calendar className="h-16 w-16 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-medium">Réservation non trouvée</h3>
                <Link href="/bookings">
                    <Button variant="link">Retour à la liste</Button>
                </Link>
            </div>
        );
    }

    const isUpcoming = new Date(booking.startDate) > new Date();
    const canCancel = booking.status === "CONFIRMED" && isUpcoming;

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/bookings">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold">Détails de la réservation</h1>
                    <p className="text-muted-foreground">
                        Réservation #{booking.id.slice(0, 8)}
                    </p>
                </div>
                <Badge
                    variant={booking.status === "CONFIRMED" ? "success" : "secondary"}
                    className="text-base"
                >
                    {booking.status === "CONFIRMED" ? "Confirmée" : "Annulée"}
                </Badge>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Booking Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Informations
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-3">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Date de début</span>
                                <span className="font-medium">
                                    {formatDateTime(booking.startDate)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Date de fin</span>
                                <span className="font-medium">
                                    {formatDateTime(booking.endDate)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Créée le</span>
                                <span className="font-medium">
                                    {formatDate(booking.createdAt)}
                                </span>
                            </div>
                            {isAdmin && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Réservé par</span>
                                    <span className="font-medium">
                                        {booking.user.firstName} {booking.user.lastName}
                                    </span>
                                </div>
                            )}
                        </div>

                        {canCancel && (
                            <Button
                                variant="destructive"
                                className="w-full"
                                onClick={handleCancel}
                                disabled={cancelBooking.isPending}
                            >
                                <X className="mr-2 h-4 w-4" />
                                Annuler la réservation
                            </Button>
                        )}
                    </CardContent>
                </Card>

                {/* Vehicle Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Car className="h-5 w-5" />
                            Véhicule réservé
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex h-32 items-center justify-center rounded-lg bg-muted">
                            {booking.vehicle.imageUrl ? (
                                <img
                                    src={booking.vehicle.imageUrl}
                                    alt={`${booking.vehicle.brand} ${booking.vehicle.model}`}
                                    className="h-full w-full rounded-lg object-cover"
                                />
                            ) : (
                                <Car className="h-16 w-16 text-muted-foreground/50" />
                            )}
                        </div>

                        <div className="grid gap-3">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Marque</span>
                                <span className="font-medium">{booking.vehicle.brand}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Modèle</span>
                                <span className="font-medium">{booking.vehicle.model}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Plaque</span>
                                <span className="font-medium">
                                    {booking.vehicle.licensePlate}
                                </span>
                            </div>
                        </div>

                        <Link href={`/vehicles/${booking.vehicle.id}`}>
                            <Button variant="outline" className="w-full">
                                Voir le véhicule
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
