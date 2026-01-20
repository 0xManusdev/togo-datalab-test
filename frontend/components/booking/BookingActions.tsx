"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, MoreHorizontal, Pencil, Trash, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Modal } from "@/components/ui/modal";
import { Booking } from "@/types";
import { useCancelBooking, useDeleteBooking } from "@/hooks/useBookings";
import { toast } from "sonner";
import { handleError } from "@/lib/error-handler";

interface BookingActionsProps {
    booking: Booking;
    isAdmin: boolean;
}

export function BookingActions({ booking, isAdmin }: BookingActionsProps) {
    const [open, setOpen] = useState(false);
    const cancelBooking = useCancelBooking();
    const deleteBooking = useDeleteBooking();

    const isUpcoming = new Date(booking.startDate) > new Date();
    const isConfirmed = booking.status === "CONFIRMED";
    const canCancel = isConfirmed && isUpcoming;
    const canEdit = isConfirmed && isUpcoming;

    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const handleCancel = async () => {
        if (!confirm("Êtes-vous sûr de vouloir annuler cette réservation ?")) return;
        try {
            await cancelBooking.mutateAsync(booking.id);
            toast.success("Réservation annulée");
        } catch (error) {
            handleError(error, "Annulation impossible");
        }
    };

    const confirmDelete = async () => {
        try {
            await deleteBooking.mutateAsync(booking.id);
            toast.success("Réservation supprimée");
            setShowDeleteModal(false);
        } catch (error) {
            handleError(error, "Suppression impossible");
        }
    };

    return (
        <>
            <DropdownMenu open={open} onOpenChange={setOpen}>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                        <span className="sr-only">Ouvrir le menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                        <Link href={`/bookings/${booking.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Voir les détails
                        </Link>
                    </DropdownMenuItem>

                    {canEdit && (
                        <DropdownMenuItem asChild>
                            <Link href={`/bookings/${booking.id}/edit`}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Modifier
                            </Link>
                        </DropdownMenuItem>
                    )}

                    {canCancel && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={handleCancel}
                                className="text-amber-600 focus:text-amber-600 text-xs focus:bg-amber-50 dark:text-amber-500 dark:focus:bg-amber-950/20"
                            >
                                <X className="mr-2 h-4 w-4" />
                                Annuler la réservation
                            </DropdownMenuItem>
                        </>
                    )}

                    {isAdmin && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => setShowDeleteModal(true)}
                                className="text-destructive text-xs focus:text-destructive"
                            >
                                <Trash className="mr-2 h-4 w-4" />
                                Supprimer définitivement
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Supprimer la réservation"
                description="Êtes-vous sûr de vouloir supprimer cette réservation ? Cette action est irréversible et supprimera toutes les données associées."
            >
                <div className="flex justify-end gap-3 mt-4">
                    <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                        Annuler
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={confirmDelete}
                        disabled={deleteBooking.isPending}
                    >
                        {deleteBooking.isPending ? "Suppression..." : "Supprimer"}
                    </Button>
                </div>
            </Modal>
        </>
    );
}
