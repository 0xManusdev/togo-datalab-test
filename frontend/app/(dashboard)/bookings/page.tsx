"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, Car, Clock, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useBookings, useCancelBooking } from "@/hooks/useBookings";
import { useAuth } from "@/hooks/useAuth";
import { formatDate, formatDateTime } from "@/lib/utils";
import { BookingStatus } from "@/types";

export default function BookingsPage() {
    const { user } = useAuth();
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState<BookingStatus | "ALL">("ALL");
    const { data, isLoading } = useBookings(page, 20);
    const cancelBooking = useCancelBooking();

    const isAdmin = user?.role === "ADMIN";
    const bookings = data?.data || [];
    const pagination = data?.pagination;

    const filteredBookings =
        statusFilter === "ALL"
            ? bookings
            : bookings.filter((b) => b.status === statusFilter);

    const handleCancel = async (id: string) => {
        if (!confirm("Êtes-vous sûr de vouloir annuler cette réservation ?")) return;
        try {
            await cancelBooking.mutateAsync(id);
        } catch (error) {
            alert("Erreur lors de l'annulation");
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold">
                        {isAdmin ? "Toutes les réservations" : "Mes réservations"}
                    </h1>
                    <p className="text-muted-foreground">
                        Gérez vos réservations de véhicules
                    </p>
                </div>
                <Link href="/book">
                    <Button>
                        <Calendar className="mr-2 h-4 w-4" />
                        Nouvelle réservation
                    </Button>
                </Link>
            </div>

            <div className="flex gap-2">
                <Button
                    variant={statusFilter === "ALL" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("ALL")}
                >
                    Toutes
                </Button>
                <Button
                    variant={statusFilter === "CONFIRMED" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("CONFIRMED")}
                >
                    Confirmées
                </Button>
                <Button
                    variant={statusFilter === "CANCELLED" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("CANCELLED")}
                >
                    Annulées
                </Button>
            </div>

            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                    ))}
                </div>
            ) : filteredBookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                    <Calendar className="h-16 w-16 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-medium">Aucune réservation</h3>
                    <p className="text-muted-foreground">
                        Réservez un véhicule pour commencer
                    </p>
                    <Link href="/book" className="mt-4">
                        <Button>Nouvelle réservation</Button>
                    </Link>
                </div>
            ) : (
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left text-muted-foreground">
                                        <th className="p-4 font-medium">Véhicule</th>
                                        {isAdmin && <th className="p-4 font-medium">Utilisateur</th>}
                                        <th className="p-4 font-medium">Destination</th>
                                        <th className="p-4 font-medium">Période</th>
                                        <th className="p-4 font-medium">Statut</th>
                                        <th className="p-4 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {filteredBookings.map((booking) => {
                                        const isUpcoming = new Date(booking.startDate) > new Date();
                                        const canCancel = booking.status === "CONFIRMED" && isUpcoming;

                                        return (
                                            <tr key={booking.id} className="hover:bg-muted/50">
                                                <td className="p-4">
                                                    <div>
                                                        <p className="font-medium">
                                                            {booking.vehicle.brand} {booking.vehicle.model}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {booking.vehicle.licensePlate}
                                                        </p>
                                                    </div>
                                                </td>
                                                {isAdmin && (
                                                    <td className="p-4">
                                                        {booking.user.firstName} {booking.user.lastName}
                                                    </td>
                                                )}
                                                <td className="p-4 text-muted-foreground">
                                                    {booking.destination || "-"}
                                                </td>
                                                <td className="p-4 whitespace-nowrap">
                                                    <div className="text-sm">
                                                        <p>{formatDate(booking.startDate)}</p>
                                                        <p className="text-muted-foreground">
                                                            au {formatDate(booking.endDate)}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <Badge
                                                        variant={
                                                            booking.status === "CONFIRMED"
                                                                ? "success"
                                                                : "secondary"
                                                        }
                                                    >
                                                        {booking.status === "CONFIRMED"
                                                            ? "Confirmée"
                                                            : "Annulée"}
                                                    </Badge>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex gap-2">
                                                        <Link href={`/bookings/${booking.id}`}>
                                                            <Button variant="outline" size="sm">
                                                                Détails
                                                            </Button>
                                                        </Link>
                                                        {canCancel && (
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() => handleCancel(booking.id)}
                                                                disabled={cancelBooking.isPending}
                                                            >
                                                                Annuler
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={!pagination.hasPrevPage}
                        onClick={() => setPage(page - 1)}
                    >
                        Précédent
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        Page {pagination.page} sur {pagination.totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={!pagination.hasNextPage}
                        onClick={() => setPage(page + 1)}
                    >
                        Suivant
                    </Button>
                </div>
            )}
        </div>
    );
}
