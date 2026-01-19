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
                <Link href="/bookings/new">
                    <Button>
                        <Calendar className="mr-2 h-4 w-4" />
                        Nouvelle réservation
                    </Button>
                </Link>
            </div>

            {/* Filters */}
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

            {/* Bookings List */}
            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i}>
                            <CardContent className="flex items-center gap-4 p-4">
                                <Skeleton className="h-16 w-16 rounded-lg" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-5 w-48" />
                                    <Skeleton className="h-4 w-32" />
                                </div>
                                <Skeleton className="h-8 w-24" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : filteredBookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                    <Calendar className="h-16 w-16 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-medium">Aucune réservation</h3>
                    <p className="text-muted-foreground">
                        Réservez un véhicule pour commencer
                    </p>
                    <Link href="/bookings/new" className="mt-4">
                        <Button>Nouvelle réservation</Button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredBookings.map((booking) => {
                        const isUpcoming = new Date(booking.startDate) > new Date();
                        const canCancel =
                            booking.status === "CONFIRMED" && isUpcoming;

                        return (
                            <Card key={booking.id}>
                                <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        <Car className="h-8 w-8" />
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold">
                                                {booking.vehicle.brand} {booking.vehicle.model}
                                            </h3>
                                            <Badge
                                                variant={
                                                    booking.status === "CONFIRMED"
                                                        ? "success"
                                                        : "secondary"
                                                }
                                                className="rounded-full"
                                            >
                                                {booking.status === "CONFIRMED"
                                                    ? "Confirmée"
                                                    : "Annulée"}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {booking.vehicle.licensePlate}
                                        </p>

                                        <div className="mt-1 text-sm">
                                            <div className="flex items-center gap-1">
                                                <Clock className="mr-2 h-4 w-4" />
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">
                                                        {formatDateTime(booking.startDate)}
                                                    </span>
                                                    <span className="font-medium">
                                                        {formatDateTime(booking.endDate)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        {isAdmin && (
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Par: {booking.user.firstName} {booking.user.lastName}
                                            </p>
                                        )}
                                    </div>

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
                                                <X className="mr-1 h-4 w-4" />
                                                Annuler
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
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
