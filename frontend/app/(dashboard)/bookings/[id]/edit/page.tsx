"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useBooking, useUpdateBooking } from "@/hooks/useBookings";
import { handleError } from "@/lib/error-handler";
import { formatDate } from "@/lib/utils";

export default function EditBookingPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const { data: bookingData, isLoading: isLoadingBooking } = useBooking(id);
    const updateBooking = useUpdateBooking();

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [reason, setReason] = useState("");
    const [destination, setDestination] = useState("");

    const booking = bookingData?.data;

    useEffect(() => {
        if (booking) {
            // Convert ISO dates to local datetime-local format (YYYY-MM-DDTHH:mm)
            // But we must be careful with timezones. The values in DB are UTC.
            // datetime-local expects local time.
            // Our utils.ts forces UTC display.
            // For editing, we ideally want to show the exact UTC time they selected?
            // tailored solution: Use values directly if possible or slice.
            
            // To be consistent with BookingModal:
            // BookingModal appends ":00.000Z" to input.
            // Here we reverse it: Take the ISO string and slice off milliseconds/Z for input value?
            // Actually datetime-local format is `YYYY-MM-DDThh:mm`.
            // booking.startDate is "2024-01-20T10:00:00.000Z".
            // We want "2024-01-20T10:00".
            
            setStartDate(booking.startDate.slice(0, 16));
            setEndDate(booking.endDate.slice(0, 16));
            setReason(booking.reason || "");
            setDestination(booking.destination || "");
        }
    }, [booking]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!booking) return;

        try {
            await updateBooking.mutateAsync({
                id,
                // Treat input as UTC by appending Z
                startDate: new Date(startDate + ":00.000Z").toISOString(),
                endDate: new Date(endDate + ":00.000Z").toISOString(),
                reason: reason.trim(),
                destination: destination.trim(),
            });

            toast.success("Réservation modifiée !", {
                description: `La réservation pour ${booking.vehicle.brand} ${booking.vehicle.model} a été mise à jour.`,
            });

            router.push("/bookings");
        } catch (error: unknown) {
            handleError(error, "Échec de la modification");
        }
    };

    if (isLoadingBooking) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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

    const start = new Date(startDate);
    const end = new Date(endDate);
    const isValidDates = start < end && start >= new Date();
    const canSubmit = startDate && endDate && reason && destination && isValidDates && !updateBooking.isPending;

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/bookings">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">Modifier la réservation</h1>
                    <p className="text-muted-foreground">
                        {booking.vehicle.brand} {booking.vehicle.model} • {booking.vehicle.licensePlate}
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Détails de la réservation</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="startDate">Date de début</Label>
                                <Input
                                    id="startDate"
                                    type="datetime-local"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="endDate">Date de fin</Label>
                                <Input
                                    id="endDate"
                                    type="datetime-local"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="destination">Destination</Label>
                            <Input
                                id="destination"
                                value={destination}
                                onChange={(e) => setDestination(e.target.value)}
                                placeholder="Ex: Lomé, Kpalimé..."
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="reason">Motif du déplacement</Label>
                            <Textarea
                                id="reason"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Décrivez le motif de la réservation..."
                                required
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Link href="/bookings">
                                <Button variant="outline" type="button">Annuler</Button>
                            </Link>
                            <Button type="submit" disabled={!canSubmit}>
                                {updateBooking.isPending && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Enregistrer les modifications
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
