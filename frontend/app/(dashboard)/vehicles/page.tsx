"use client";

import { useState } from "react";
import Link from "next/link";
import { Car, Plus, CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { SearchInput } from "@/components/ui/search-input";
import { VehicleCard } from "@/components/vehicles/vehicle-card";
import { useVehicles } from "@/hooks/useVehicles";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/lib/constants";

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
				<div className="grid grid-cols-2 gap-2">
					<Link href={ROUTES.BOOK}>
						<Button className="w-full cursor-pointer text-xs">
							<CalendarPlus className="mr-1 h-4 w-4" />
							Réserver
						</Button>
					</Link>
					{isAdmin && (
						<Link href={ROUTES.VEHICLES_NEW}>
							<Button variant="outline" className="w-full cursor-pointer text-xs">
								<Plus className="mr-1 h-4 w-4" />
								Ajouter
							</Button>
						</Link>
					)}
				</div>
			</div>


			<SearchInput
				value={search}
				onChange={setSearch}
				placeholder="Rechercher par marque, modèle ou plaque..."
				className="max-w-md"
			/>

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
				<EmptyState
					icon={Car}
					title="Aucun véhicule trouvé"
					description={search ? "Essayez une autre recherche" : "Le parc automobile est vide"}
				/>
			) : (
				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{filteredVehicles.map((vehicle) => (
						<VehicleCard key={vehicle.id} vehicle={vehicle} />
					))}
				</div>
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
