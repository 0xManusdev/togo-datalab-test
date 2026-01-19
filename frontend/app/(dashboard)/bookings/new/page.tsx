"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Calendar, Car, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAvailableVehicles } from "@/hooks/useVehicles";
import { useCreateBooking } from "@/hooks/useBookings";
import { formatDate, formatDateTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Step = 1 | 2 | 3;

export default function NewBookingPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const preselectedVehicleId = searchParams.get("vehicleId");

    const [step, setStep] = useState<Step>(preselectedVehicleId ? 2 : 1);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [reason, setReason] = useState("");
    const [destination, setDestination] = useState("");
    const [selectedVehicleId, setSelectedVehicleId] = useState(
        preselectedVehicleId || ""
    );

    const createBooking = useCreateBooking();

    const { data: vehiclesData, isLoading: vehiclesLoading } = useAvailableVehicles(
        startDate ? new Date(startDate).toISOString() : "",
        endDate ? new Date(endDate).toISOString() : "",
        step >= 2 && !!startDate && !!endDate
    );

    const vehicles = vehiclesData?.data || [];
    const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);

    const canProceedStep1 = startDate && endDate && new Date(endDate) > new Date(startDate);
    const canProceedStep2 = selectedVehicleId;

    const handleSubmit = async () => {
        if (!selectedVehicleId || !startDate || !endDate) return;

        try {
            await createBooking.mutateAsync({
                vehicleId: selectedVehicleId,
                startDate: new Date(startDate).toISOString(),
                endDate: new Date(endDate).toISOString(),
                reason: reason.trim(),
                destination: destination.trim(),
            });
            router.push("/bookings");
        } catch (error) {
            alert("Erreur lors de la création de la réservation");
        }
    };

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">Nouvelle réservation</h1>
                    <p className="text-muted-foreground">
                        Réservez un véhicule en quelques étapes
                    </p>
                </div>
            </div>

            {/* Progress */}
            <div className="flex items-center justify-center gap-2">
                {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center gap-2">
                        <div
                            className={cn(
                                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium",
                                step >= s
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground"
                            )}
                        >
                            {step > s ? <Check className="h-4 w-4" /> : s}
                        </div>
                        {s < 3 && (
                            <div
                                className={cn(
                                    "h-0.5 w-16",
                                    step > s ? "bg-primary" : "bg-muted"
                                )}
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* Step Content */}
            {step === 1 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Sélectionnez les dates
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="startDate">Date de début</Label>
                                <Input
                                    id="startDate"
                                    type="datetime-local"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    min={new Date().toISOString().slice(0, 16)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="endDate">Date de fin</Label>
                                <Input
                                    id="endDate"
                                    type="datetime-local"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    min={startDate || new Date().toISOString().slice(0, 16)}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button
                                onClick={() => setStep(2)}
                                disabled={!canProceedStep1}
                            >
                                Suivant
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {step === 2 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Car className="h-5 w-5" />
                            Choisissez un véhicule
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Véhicules disponibles du {formatDate(startDate)} au{" "}
                            {formatDate(endDate)}
                        </p>

                        {vehiclesLoading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <Skeleton key={i} className="h-20" />
                                ))}
                            </div>
                        ) : vehicles.length === 0 ? (
                            <div className="py-8 text-center">
                                <Car className="mx-auto h-12 w-12 text-muted-foreground/50" />
                                <p className="mt-4 text-muted-foreground">
                                    Aucun véhicule disponible pour cette période
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {vehicles.map((vehicle) => (
                                    <div
                                        key={vehicle.id}
                                        className={cn(
                                            "flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition-colors",
                                            selectedVehicleId === vehicle.id
                                                ? "border-primary bg-primary/5"
                                                : "hover:bg-muted/50"
                                        )}
                                        onClick={() => setSelectedVehicleId(vehicle.id)}
                                    >
                                        <div
                                            className={cn(
                                                "flex h-5 w-5 items-center justify-center rounded-full border-2",
                                                selectedVehicleId === vehicle.id
                                                    ? "border-primary bg-primary"
                                                    : "border-muted-foreground"
                                            )}
                                        >
                                            {selectedVehicleId === vehicle.id && (
                                                <Check className="h-3 w-3 text-primary-foreground" />
                                            )}
                                        </div>
                                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                                            <Car className="h-6 w-6 text-muted-foreground" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium">
                                                {vehicle.brand} {vehicle.model}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {vehicle.licensePlate}
                                            </p>
                                        </div>
                                        <Badge variant="success">Disponible</Badge>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex justify-between">
                            <Button variant="outline" onClick={() => setStep(1)}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Retour
                            </Button>
                            <Button
                                onClick={() => setStep(3)}
                                disabled={!canProceedStep2}
                            >
                                Suivant
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {step === 3 && selectedVehicle && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Check className="h-5 w-5" />
                            Confirmation
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="destination">Destination *</Label>
                                <Input
                                    id="destination"
                                    placeholder="Ex: Kara, Sokodé, Lomé..."
                                    value={destination}
                                    onChange={(e) => setDestination(e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Où allez-vous avec ce véhicule ?
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="reason">Motif de la réservation *</Label>
                                <textarea
                                    id="reason"
                                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Ex: Déplacement pour mission de supervision"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Minimum 5 caractères
                                </p>
                            </div>
                        </div>

                        <div className="rounded-lg bg-muted p-4">
                            <h3 className="mb-4 font-semibold">Récapitulatif</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Véhicule</span>
                                    <span className="font-medium">
                                        {selectedVehicle.brand} {selectedVehicle.model}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Plaque</span>
                                    <span className="font-medium">
                                        {selectedVehicle.licensePlate}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Du</span>
                                    <span className="font-medium">
                                        {formatDateTime(startDate)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Au</span>
                                    <span className="font-medium">{formatDateTime(endDate)}</span>
                                </div>
                                {reason && (
                                    <div className="flex flex-col gap-1 pt-2 border-t">
                                        <span className="text-muted-foreground">Motif</span>
                                        <span className="font-medium text-sm">{reason}</span>
                                    </div>
                                )}
                                {destination && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Destination</span>
                                        <span className="font-medium">{destination}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-between">
                            <Button variant="outline" onClick={() => setStep(2)}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Modifier
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={createBooking.isPending || reason.trim().length < 5}
                            >
                                {createBooking.isPending && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                <Check className="mr-2 h-4 w-4" />
                                Confirmer
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
