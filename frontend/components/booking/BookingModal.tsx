"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Calendar, Car, Check, Loader2, FileText } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useCreateBooking } from "@/hooks/useBookings";
import { formatDate } from "@/lib/utils";
import { handleError } from "@/lib/error-handler";
import { Vehicle } from "@/types";
import { cn } from "@/lib/utils";

interface BookingModalProps {
	isOpen: boolean;
	onClose: () => void;
	vehicle: Vehicle;
}

export function BookingModal({ isOpen, onClose, vehicle }: BookingModalProps) {
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [reason, setReason] = useState("");
	const [destination, setDestination] = useState("");
	const createBooking = useCreateBooking();

	const canSubmit =
		startDate &&
		endDate &&
		new Date(endDate) > new Date(startDate) &&
		new Date(startDate) > new Date() &&
		reason.trim().length >= 5 &&
		destination.trim().length >= 2;

	const handleSubmit = async () => {
		if (!canSubmit) return;

		try {
			await createBooking.mutateAsync({
				vehicleId: vehicle.id,
				// Treat local input time as UTC
				startDate: new Date(startDate + ":00.000Z").toISOString(),
				endDate: new Date(endDate + ":00.000Z").toISOString(),
				reason: reason.trim(),
				destination: destination.trim(),
			});

			toast.success("Réservation confirmée !", {
				description: `${vehicle.brand} ${vehicle.model} réservé du ${formatDate(startDate)} au ${formatDate(endDate)}`,
			});

			setStartDate("");
			setEndDate("");
			setReason("");
			setDestination("");
			onClose();
		} catch (error: unknown) {
			handleError(error, "Échec de la réservation");
		}
	};

	const handleClose = () => {
		setStartDate("");
		setEndDate("");
		setReason("");
		setDestination("");
		onClose();
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleClose}
			title="Nouvelle réservation"
			description={`Réservez ${vehicle.brand} ${vehicle.model}`}
		>
			<div className="space-y-6">
				<div className="flex items-center gap-4 rounded-lg border p-4">
					<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
						<Car className="h-6 w-6" />
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

				<div className="space-y-2">
					<Label htmlFor="destination" className="flex items-center gap-2">
						Destination *
					</Label>
					<Input
						id="destination"
						placeholder="Ex: Kara, Sokodé, Lomé..."
						value={destination}
						onChange={(e) => setDestination(e.target.value)}
						maxLength={200}
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="reason" className="flex items-center gap-2">
						<FileText className="h-4 w-4" />
						Motif de la réservation *
					</Label>
					<Textarea
						id="reason"
						placeholder="Ex: Déplacement professionnel, visite client, livraison..."
						value={reason}
						onChange={(e) => setReason(e.target.value)}
						maxLength={500}
						rows={3}
						className="resize-none"
					/>
					<p className="text-xs text-muted-foreground text-right">
						{reason.length}/500 caractères
					</p>
				</div>

				{startDate && endDate && (
					<div className="rounded-lg bg-muted p-4 text-sm">
						<p className="font-medium">Récapitulatif</p>
						<p className="text-muted-foreground">
							Du {formatDate(startDate)} au {formatDate(endDate)}
						</p>
						{destination.trim() && (
							<p className="text-muted-foreground mt-1">
								<span className="font-medium">Destination:</span> {destination}
							</p>
						)}
						{reason.trim() && (
							<p className="text-muted-foreground mt-1">
								<span className="font-medium">Motif:</span> {reason}
							</p>
						)}
					</div>
				)}

				<div className="flex justify-end gap-3">
					<Button variant="outline" onClick={handleClose}>
						Annuler
					</Button>
					<Button
						onClick={handleSubmit}
						disabled={!canSubmit || createBooking.isPending}
					>
						{createBooking.isPending ? (
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						) : (
							<Check className="mr-2 h-4 w-4" />
						)}
						Confirmer
					</Button>
				</div>
			</div>
		</Modal>
	);
}
