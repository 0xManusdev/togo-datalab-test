"use client";

import { useState } from "react";
import Link from "next/link";
import { MoreHorizontal, Pencil, Trash, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Booking } from "@/types";
import { useCancelBooking } from "@/hooks/useBookings";
import { toast } from "sonner";
import { handleError } from "@/lib/error-handler";

interface BookingActionsProps {
  booking: Booking;
  isAdmin: boolean;
}

export function BookingActions({ booking, isAdmin }: BookingActionsProps) {
  const [open, setOpen] = useState(false);
  const cancelBooking = useCancelBooking();

  const isUpcoming = new Date(booking.startDate) > new Date();
  const isConfirmed = booking.status === "CONFIRMED";
  const canCancel = isConfirmed && isUpcoming;
  const canEdit = isConfirmed && isUpcoming; // Validation logic for edit is similar to cancel

  const handleCancel = async () => {
    if (!confirm("Êtes-vous sûr de vouloir annuler cette réservation ?")) return;
    try {
      await cancelBooking.mutateAsync(booking.id);
      toast.success("Réservation annulée");
    } catch (error) {
      handleError(error, "Annulation impossible");
    }
  };

  return (
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
                    className="text-destructive focus:text-destructive"
                >
                    <X className="mr-2 h-4 w-4" />
                    Annuler la réservation
                </DropdownMenuItem>
            </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
