export interface Vehicle {
	id: string;
	brand: string;
	model: string;
	licensePlate: string;
	imageUrl: string | null;
	isAvailable: boolean;
	currentlyBooked?: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface VehicleWithBookings extends Vehicle {
	bookings: {
		id: string;
		startDate: string;
		endDate: string;
		status: "CONFIRMED" | "CANCELLED";
	}[];
}
