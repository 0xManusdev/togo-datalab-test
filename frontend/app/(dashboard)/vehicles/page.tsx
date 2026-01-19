"use client";

import { useState } from "react";
import Link from "next/link";
import { Car, Plus, Search, CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useVehicles } from "@/hooks/useVehicles";
import { useAuth } from "@/hooks/useAuth";

export default function VehiclesPage() {
	const { user } = useAuth();
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState("");
	const { data, isLoading } = useVehicles(page, 12);

	const isAdmin = user?.role === "ADMIN";
	const vehicles = data?.data || [];
	const pagination = data?.pagination;

	const filteredVehicles = vehicles.filter(
		(v) =>
			v.brand.toLowerCase().includes(search.toLowerCase()) ||
			v.model.toLowerCase().includes(search.toLowerCase()) ||
			v.licensePlate.toLowerCase().includes(search.toLowerCase())
	);

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl font-bold">Véhicules</h1>
					<p className="text-muted-foreground">
						Consultez le parc automobile
					</p>
				</div>
				<div className="flex gap-2">
					<Link href="/book">
						<Button>
							<CalendarPlus className="mr-2 h-4 w-4" />
							Réserver un véhicule
						</Button>
					</Link>
					{isAdmin && (
						<Link href="/vehicles/new">
							<Button variant="outline">
								<Plus className="mr-2 h-4 w-4" />
								Ajouter
							</Button>
						</Link>
					)}
				</div>
			</div>

			{/* Info Banner */}
			<div className="rounded-lg border bg-muted/50 p-4">
				<p className="text-sm text-muted-foreground">
					<strong>💡 Conseil :</strong> Pour réserver un véhicule, utilisez la page{" "}
					<Link href="/book" className="text-primary underline hover:no-underline">
						Réserver
					</Link>{" "}
					qui vous montrera uniquement les véhicules disponibles pour vos dates.
				</p>
			</div>

			{/* Search */}
			<div className="relative max-w-md">
				<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					placeholder="Rechercher par marque, modèle ou plaque..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="pl-10"
				/>
			</div>

			{/* Vehicles Grid */}
			{isLoading ? (
				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{[1, 2, 3, 4, 5, 6].map((i) => (
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
			) : filteredVehicles.length === 0 ? (
				<div className="flex flex-col items-center justify-center py-16">
					<Car className="h-16 w-16 text-muted-foreground/50" />
					<h3 className="mt-4 text-lg font-medium">Aucun véhicule trouvé</h3>
					<p className="text-muted-foreground">
						{search
							? "Essayez une autre recherche"
							: "Le parc automobile est vide"}
					</p>
				</div>
			) : (
				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{filteredVehicles.map((vehicle) => (
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
										<h3 className="font-semibold">
											{vehicle.brand} {vehicle.model}
										</h3>
										<p className="text-sm text-muted-foreground">
											{vehicle.licensePlate}
										</p>
									</div>
									<Badge 
										variant={
											vehicle.currentlyBooked 
												? "destructive" 
												: vehicle.isAvailable 
													? "success" 
													: "secondary"
										}
									>
										{vehicle.currentlyBooked 
											? "Réservé" 
											: vehicle.isAvailable 
												? "Disponible" 
												: "Indisponible"}
									</Badge>
								</div>
							</CardContent>
							<CardFooter>
								<Link href={`/vehicles/${vehicle.id}`} className="w-full">
									<Button variant="outline" className="w-full cursor-pointer">
										Voir détails
									</Button>
								</Link>
							</CardFooter>
						</Card>
					))}
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


