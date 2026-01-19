"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Car, Calendar, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useVehicle, useDeleteVehicle } from "@/hooks/useVehicles";
import { useAuth } from "@/hooks/useAuth";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function VehicleDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = use(params);
	const router = useRouter();
	const { user } = useAuth();
	const { data, isLoading } = useVehicle(id);
	const deleteVehicle = useDeleteVehicle();
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);

	const isAdmin = user?.role === "ADMIN";
	const vehicle = data?.data;

	const handleDelete = async () => {
		try {
			await deleteVehicle.mutateAsync(id);
			setShowDeleteDialog(false);
			toast.success("Véhicule supprimé avec succès");
			router.push("/vehicles");
		} catch (error) {
			toast.error("Erreur lors de la suppression");
		}
	};

	if (isLoading) {
		return (
			<div className="space-y-6">
				<Skeleton className="h-8 w-48" />
				<div className="grid gap-6 lg:grid-cols-2">
					<Skeleton className="h-80" />
					<Skeleton className="h-80" />
				</div>
			</div>
		);
	}

	if (!vehicle) {
		return (
			<div className="flex flex-col items-center justify-center py-16">
				<Car className="h-16 w-16 text-muted-foreground/50" />
				<h3 className="mt-4 text-lg font-medium">Véhicule non trouvé</h3>
				<Link href="/vehicles">
					<Button variant="link">Retour à la liste</Button>
				</Link>
			</div>
		);
	}

	const upcomingBookings = vehicle.bookings?.filter(
		(b) => new Date(b.endDate) > new Date()
	) || [];

	return (
		<>
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center gap-4">
				<Link href="/vehicles">
					<Button variant="ghost" size="icon">
						<ArrowLeft className="h-5 w-5" />
					</Button>
				</Link>
				<div className="flex-1">
					<h1 className="text-2xl font-bold">
						{vehicle.brand} {vehicle.model}
					</h1>
					<p className="text-muted-foreground">{vehicle.licensePlate}</p>
				</div>
				{isAdmin && (
					<div className="flex gap-2">
						<Link href={`/vehicles/${id}/edit`}>
							<Button variant="outline">
								<Edit className="mr-2 h-4 w-4" />
								Modifier
							</Button>
						</Link>
						<Button
							variant="destructive"
							onClick={() => setShowDeleteDialog(true)}
						>
							<Trash2 className="mr-2 h-4 w-4" />
							Supprimer
						</Button>
					</div>
				)}
			</div>

			<div className="grid gap-6 lg:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Informations</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="flex h-48 items-center justify-center rounded-lg bg-muted">
							{vehicle.imageUrl ? (
								<img
									src={vehicle.imageUrl}
									alt={`${vehicle.brand} ${vehicle.model}`}
									className="h-full w-full rounded-lg object-cover"
								/>
							) : (
								<Car className="h-24 w-24 text-muted-foreground/50" />
							)}
						</div>

						<div className="grid gap-4">
							<div className="flex justify-between">
								<span className="text-muted-foreground">Marque</span>
								<span className="font-medium">{vehicle.brand}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Modèle</span>
								<span className="font-medium">{vehicle.model}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Plaque</span>
								<span className="font-medium">{vehicle.licensePlate}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Statut</span>
								<Badge variant={vehicle.isAvailable ? "success" : "secondary"}>
									{vehicle.isAvailable ? "Disponible" : "Indisponible"}
								</Badge>
							</div>
						</div>

						{vehicle.isAvailable && (
							<Link href={`/bookings/new?vehicleId=${id}`}>
								<Button className="w-full">
									<Calendar className="mr-2 h-4 w-4" />
									Réserver ce véhicule
								</Button>
							</Link>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Réservations à venir</CardTitle>
					</CardHeader>
					<CardContent>
						{upcomingBookings.length === 0 ? (
							<p className="py-8 text-center text-muted-foreground">
								Aucune réservation prévue
							</p>
						) : (
							<div className="space-y-4">
								{upcomingBookings.map((booking) => (
									<div
										key={booking.id}
										className="flex items-center justify-between rounded-lg border p-4"
									>
										<div>
											<p className="font-medium">
												{formatDate(booking.startDate)} -{" "}
												{formatDate(booking.endDate)}
											</p>
										</div>
										<Badge
											variant={
												booking.status === "CONFIRMED"
													? "success"
													: "secondary"
											}
										>
											{booking.status === "CONFIRMED" ? "Confirmée" : "Annulée"}
										</Badge>
									</div>
								))}
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
			<ConfirmDialog
				isOpen={showDeleteDialog}
				onClose={() => setShowDeleteDialog(false)}
				onConfirm={handleDelete}
				title="Supprimer ce véhicule ?"
				description="Cette action est irréversible. Toutes les réservations passées associées à ce véhicule seront également supprimées."
				confirmText="Supprimer"
				cancelText="Annuler"
				isLoading={deleteVehicle.isPending}
				variant="destructive"
			/>
		</>
	);
}
