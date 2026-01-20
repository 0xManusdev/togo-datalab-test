"use client";

import Link from "next/link";
import { Car } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Vehicle } from "@/types";

interface VehicleCardProps {
    vehicle: Vehicle;
}

export function VehicleCard({ vehicle }: VehicleCardProps) {
    const getStatusVariant = () => {
        if (vehicle.currentlyBooked) return "destructive";
        if (vehicle.isAvailable) return "success";
        return "secondary";
    };

    const getStatusLabel = () => {
        if (vehicle.currentlyBooked) return "Réservé";
        if (vehicle.isAvailable) return "Disponible";
        return "Indisponible";
    };

    return (
        <Card className="overflow-hidden">
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
                        <h3 className="font-semibold text-sm">
                            {vehicle.brand} {vehicle.model}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            {vehicle.licensePlate}
                        </p>
                    </div>
                    <Badge
                        className="text-[10px] font-light"
                        variant={getStatusVariant()}
                    >
                        {getStatusLabel()}
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
    );
}
