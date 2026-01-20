"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { useBookings, useCancelBooking } from "@/hooks/useBookings";
import { useAuth } from "@/hooks/useAuth";
import { formatDate } from "@/lib/utils";
import { handleError } from "@/lib/error-handler";
import { ROUTES } from "@/lib/constants";
import { BookingStatus } from "@/types";
import { SortableHeader } from "@/components/ui/sortable-header";
import { BookingActions } from "@/components/booking/BookingActions";

export default function BookingsPage() {
    const { user } = useAuth();
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState<BookingStatus | "ALL">("ALL");
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);

    const { data, isLoading } = useBookings(page, 20);

    const isAdmin = user?.role === "ADMIN";
    const bookings = data?.data || [];
    const pagination = data?.pagination;

    // Filter
    const filteredBookings =
        statusFilter === "ALL"
            ? bookings
            : bookings.filter((b) => b.status === statusFilter);

    // Sort
    const sortedBookings = [...filteredBookings].sort((a, b) => {
        if (!sortConfig) return 0;

        const { key, direction } = sortConfig;
        let aValue: any = a;
        let bValue: any = b;

        // Handle nested properties (e.g. vehicle.brand)
        const keys = key.split(".");
        for (const k of keys) {
            aValue = aValue?.[k];
            bValue = bValue?.[k];
        }

        if (aValue < bValue) return direction === "asc" ? -1 : 1;
        if (aValue > bValue) return direction === "asc" ? 1 : -1;
        return 0;
    });

    const handleSort = (key: string) => {
        setSortConfig((current) => {
            if (current?.key === key) {
                return { key, direction: current.direction === "asc" ? "desc" : "asc" };
            }
            return { key, direction: "asc" };
        });
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title={isAdmin ? "Toutes les réservations" : "Mes réservations"}
                description="Gérez vos réservations de véhicules"
                action={
                    <Link href={ROUTES.BOOK}>
                        <Button>
                            <Calendar className="mr-2 h-4 w-4" />
                            Nouvelle réservation
                        </Button>
                    </Link>
                }
            />

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
                <TableSkeleton rows={4} />
            ) : sortedBookings.length === 0 ? (
                <EmptyState
                    icon={Calendar}
                    title="Aucune réservation"
                    description="Réservez un véhicule pour commencer"
                    action={
                        <Link href={ROUTES.BOOK}>
                            <Button>Nouvelle réservation</Button>
                        </Link>
                    }
                />
            ) : (
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left text-muted-foreground">
                                        <th className="p-4 font-medium">
                                            <SortableHeader
                                                column="vehicle.brand"
                                                label="Véhicule"
                                                sortedColumn={sortConfig?.key || null}
                                                sortDirection={sortConfig?.direction || "asc"}
                                                onSort={handleSort}
                                            />
                                        </th>
                                        {isAdmin && (
                                            <th className="p-4 font-medium">
                                                <SortableHeader
                                                    column="user.lastName"
                                                    label="Utilisateur"
                                                    sortedColumn={sortConfig?.key || null}
                                                    sortDirection={sortConfig?.direction || "asc"}
                                                    onSort={handleSort}
                                                />
                                            </th>
                                        )}
                                        <th className="p-4 font-medium">
                                            <SortableHeader
                                                column="destination"
                                                label="Destination"
                                                sortedColumn={sortConfig?.key || null}
                                                sortDirection={sortConfig?.direction || "asc"}
                                                onSort={handleSort}
                                            />
                                        </th>
                                        <th className="p-4 font-medium">
                                            <SortableHeader
                                                column="startDate"
                                                label="Période"
                                                sortedColumn={sortConfig?.key || null}
                                                sortDirection={sortConfig?.direction || "asc"}
                                                onSort={handleSort}
                                            />
                                        </th>
                                        <th className="p-4 font-medium">
                                            <SortableHeader
                                                column="status"
                                                label="Statut"
                                                sortedColumn={sortConfig?.key || null}
                                                sortDirection={sortConfig?.direction || "asc"}
                                                onSort={handleSort}
                                            />
                                        </th>
                                        <th className="p-4 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {sortedBookings.map((booking) => (
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
                                                <BookingActions booking={booking} isAdmin={isAdmin} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Pagination */}
            {pagination && (
                <Pagination
                    page={pagination.page}
                    totalPages={pagination.totalPages}
                    hasNextPage={pagination.hasNextPage}
                    hasPrevPage={pagination.hasPrevPage}
                    onPageChange={setPage}
                />
            )}
        </div>
    );
}

