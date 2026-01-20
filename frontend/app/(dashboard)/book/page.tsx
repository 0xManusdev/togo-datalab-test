"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
	Calendar,
	Car,
	Check,
	Loader2,
	Search,
	FileText,
	Clock,
	ChevronRight,
	X,
	MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { useAvailableVehicles } from "@/hooks/useVehicles";
import { useBookings, useCreateBooking } from "@/hooks/useBookings";
import { useAuth } from "@/hooks/useAuth";
import { formatDate } from "@/lib/utils";
import { Vehicle } from "@/types";

export default function BookPage() {
	const { user } = useAuth();

	const [startDate, setStartDate] = useState<Date | undefined>(new Date());
	const [endDate, setEndDate] = useState<Date | undefined>(undefined);
	const [reason, setReason] = useState("");
	const [destination, setDestination] = useState("");
	const [hasSearched, setHasSearched] = useState(false);

	const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

	const createBooking = useCreateBooking();

	const { data: bookingsData, isLoading: bookingsLoading } = useBookings(1, 5);
	const recentBookings = bookingsData?.data || [];

	const startDateISO = useMemo(() => {
		if (!startDate) return "";
		return startDate.toISOString();
	}, [startDate]);

	const endDateISO = useMemo(() => {
		if (!endDate) return "";
		return endDate.toISOString();
	}, [endDate]);

	const canSearch =
		startDate &&
		endDate &&
		endDate > startDate &&
		startDate > new Date();

	const canConfirm = canSearch && reason.trim().length >= 5 && destination.trim().length >= 2;

	const {
		data: vehiclesData,
		isLoading,
		isFetching,
	} = useAvailableVehicles(startDateISO, endDateISO, !!(hasSearched && canSearch));

	const vehicles = vehiclesData?.data || [];

	const handleSearch = () => {
		if (!canSearch) return;
		setHasSearched(true);
		setSelectedVehicle(null);
	};

	const handleReset = () => {
		setStartDate(undefined);
		setEndDate(undefined);
		setReason("");
		setDestination("");
		setHasSearched(false);
		setSelectedVehicle(null);
	};

	const handleConfirmBooking = async () => {
		if (!selectedVehicle || !canConfirm) return;

		try {
			await createBooking.mutateAsync({
				vehicleId: selectedVehicle.id,
				startDate: startDateISO,
				endDate: endDateISO,
				reason: reason.trim(),
				destination: destination.trim(),
			});

			toast.success("Réservation confirmée !", {
				description: `${selectedVehicle.brand} ${selectedVehicle.model} réservé du ${formatDate(startDateISO)} au ${formatDate(endDateISO)}`,
			});

			handleReset();
		} catch (error: unknown) {
			const message =
				error instanceof Error
					? error.message
					: "Une erreur est survenue lors de la réservation";
			toast.error("Échec de la réservation", {
				description: message,
			});
		}
	};

	return (
		<>
			<div className="space-y-8">
				<div>
					<p className="text-muted-foreground text-xl">
						Faire une réservation
					</p>
				</div>

				<Card>
					<CardContent className="pt-6">
						<div className="space-y-4">
							<div className="grid gap-4 sm:grid-cols-2">
								<DateTimePicker
									label="Date et heure de départ"
									date={startDate}
									setDate={(date) => {
										setStartDate(date);
										setHasSearched(false);
									}}
									placeholder="Sélectionner date et l'heure de départ"
								/>
								<DateTimePicker
									label="Date et heure de retour"
									date={endDate}
									setDate={(date) => {
										setEndDate(date);
										setHasSearched(false);
									}}
									placeholder="Sélectionner la date et l'heure de retour"
									minDate={startDate}
								/>
							</div>
						</div>
					</CardContent>
					<CardFooter className="flex gap-3">
						<Button onClick={handleSearch} disabled={!canSearch || isFetching}>
							{isFetching ? (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							) : (
								<Search className="mr-2 h-4 w-4" />
							)}
							Rechercher les véhicules disponibles
						</Button>
						{hasSearched && (
							<Button variant="outline" onClick={handleReset}>
								Nouvelle recherche
							</Button>
						)}
					</CardFooter>
				</Card>

				{hasSearched && (
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<h2 className="text-lg font-semibold">Véhicules disponibles</h2>
							{vehicles.length > 0 && (
								<Badge variant="secondary">{vehicles.length} véhicule(s)</Badge>
							)}
						</div>

						{isLoading ? (
							<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
								{[1, 2, 3, 4].map((i) => (
									<Card key={i}>
										<Skeleton className="h-40 w-full rounded-t-lg" />
										<CardContent className="pt-4">
											<Skeleton className="h-5 w-3/4" />
											<Skeleton className="mt-2 h-4 w-1/2" />
										</CardContent>
										<CardFooter>
											<Skeleton className="h-9 w-full" />
										</CardFooter>
									</Card>
								))}
							</div>
						) : vehicles.length === 0 ? (
							<Card className="p-8">
								<div className="flex flex-col items-center justify-center text-center">
									<Car className="h-16 w-16 text-muted-foreground/50" />
									<h3 className="mt-4 text-lg font-medium">
										Aucun véhicule disponible
									</h3>
									<p className="text-muted-foreground max-w-sm">
										Aucun véhicule n'est disponible pour la période sélectionnée.
										Essayez d'autres dates.
									</p>
								</div>
							</Card>
						) : (
							<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
								{vehicles.map((vehicle) => (
									<Card key={vehicle.id} className="overflow-hidden">
										<div className="flex h-40 items-center justify-center bg-muted">
											{vehicle.imageUrl ? (
												<img
													src={vehicle.imageUrl}
													alt={`${vehicle.brand} ${vehicle.model}`}
													className="h-full w-full object-cover"
												/>
											) : (
												<Car className="h-16 w-16 text-muted-foreground/50" />
											)}
										</div>
										<CardContent className="pt-4">
											<div className="flex items-start justify-between">
												<div>
													<h5 className="font-semibold text-xs">
														{vehicle.brand} {vehicle.model}
													</h5>
													<p className="text-xs text-muted-foreground">
														{vehicle.licensePlate}
													</p>
												</div>
												<Badge className="font-light text-[10px]" variant="success">
													Disponible
												</Badge>
											</div>
										</CardContent>
										<CardFooter>
											<Button
												className="w-full"
												onClick={() => setSelectedVehicle(vehicle)}
											>
												Réserver ce véhicule
											</Button>
										</CardFooter>
									</Card>
								))}
							</div>
						)}
					</div>
				)}

				<Card>
					<CardHeader className="flex flex-row items-center justify-between">
						<CardTitle className="text-lg flex items-center gap-2">
							<Clock className="h-5 w-5" />
							Mes réservations récentes
						</CardTitle>
						<Link href="/bookings">
							<Button variant="ghost" size="sm">
								Voir tout
								<ChevronRight className="ml-1 h-4 w-4" />
							</Button>
						</Link>
					</CardHeader>
					<CardContent>
						{bookingsLoading ? (
							<div className="space-y-3">
								{[1, 2, 3].map((i) => (
									<div key={i} className="flex items-center gap-4">
										<Skeleton className="h-12 w-12 rounded-lg" />
										<div className="space-y-2 flex-1">
											<Skeleton className="h-4 w-32" />
											<Skeleton className="h-3 w-48" />
										</div>
										<Skeleton className="h-6 w-20" />
									</div>
								))}
							</div>
						) : recentBookings.length === 0 ? (
							<div className="text-center py-8">
								<Calendar className="h-12 w-12 text-muted-foreground/50 mx-auto" />
								<p className="mt-4 text-muted-foreground">
									Vous n'avez pas encore de réservation
								</p>
							</div>
						) : (
							<div className="space-y-3">
								{recentBookings.map((booking) => (
									<div
										key={booking.id}
										className="flex items-center justify-between rounded-lg border p-4"
									>
										<div className="flex items-center gap-4">
											<div className={`flex h-12 w-12 items-center justify-center rounded-lg ${booking.status === "CONFIRMED"
													? "bg-primary/10 text-primary"
													: "bg-muted text-muted-foreground"
												}`}>
												<Car className="h-6 w-6" />
											</div>
											<div>
												<p className="font-light text-xs">
													{booking.vehicle.brand} {booking.vehicle.model}
												</p>
												<p className="text-xs text-muted-foreground">
													{formatDate(booking.startDate)} → {formatDate(booking.endDate)}
												</p>
											</div>
										</div>
										<Badge
											className="font-xs font-light"
											variant={booking.status === "CONFIRMED" ? "success" : "secondary"}
										>
											{booking.status === "CONFIRMED" ? (
												<><Check className="mr-1 h-3 w-3" />Confirmée</>
											) : (
												<><X className="mr-1 h-3 w-3" />Annulée</>
											)}
										</Badge>
									</div>
								))}
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			<Modal
				isOpen={!!selectedVehicle}
				onClose={() => setSelectedVehicle(null)}
				title="Confirmer la réservation"
				description="Vérifiez les détails avant de confirmer"
			>
				{selectedVehicle && (
					<div className="space-y-6">
						<div className="flex items-center gap-4 rounded-lg border p-4">
							<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
								<Car className="h-6 w-6" />
							</div>
							<div className="flex-1">
								<p className="font-light text-xs">
									{selectedVehicle.brand} {selectedVehicle.model}
								</p>
								<p className="text-xs text-muted-foreground">
									{selectedVehicle.licensePlate}
								</p>
							</div>
						</div>

						<div className="rounded-lg bg-muted p-4 text-sm space-y-2">
							<div className="flex justify-between">
								<span className="text-muted-foreground">Du</span>
								<span className="font-normal text-xs">{formatDate(startDateISO)}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Au</span>
								<span className="font-normal text-xs">{formatDate(endDateISO)}</span>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="destination" className="flex items-center gap-2">
								<MapPin className="h-4 w-4" />
								Destination
								<span className="text-destructive">*</span>
							</Label>
							<input
								id="destination"
								type="text"
								placeholder="Ex: Kara, Sokodé, Lomé..."
								value={destination}
								onChange={(e) => setDestination(e.target.value)}
								maxLength={200}
								className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="reason" className="flex items-center gap-2">
								<FileText className="h-4 w-4" />
								Motif de la réservation
								<span className="text-destructive">*</span>
							</Label>
							<Textarea
								id="reason"
								placeholder="Ex: Déplacement professionnel, visite client, livraison..."
								value={reason}
								onChange={(e) => setReason(e.target.value)}
								maxLength={500}
								rows={2}
								className="resize-none"
							/>
							<div className="flex justify-between text-xs text-muted-foreground">
								<span>Minimum 5 caractères</span>
								<span>{reason.length}/500</span>
							</div>
						</div>

						<div className="flex justify-end gap-3">
							<Button
								variant="outline"
								onClick={() => setSelectedVehicle(null)}
							>
								Annuler
							</Button>
							<Button
								onClick={handleConfirmBooking}
								disabled={!canConfirm || createBooking.isPending}
							>
								{createBooking.isPending ? (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								) : (
									<Check className="mr-2 h-4 w-4" />
								)}
								Confirmer la réservation
							</Button>
						</div>
					</div>
				)}
			</Modal>
		</>
	);
}

