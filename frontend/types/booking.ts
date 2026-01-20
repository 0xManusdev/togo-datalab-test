import { User } from "./user";
import { Vehicle } from "./vehicle";

export type BookingStatus = "CONFIRMED" | "CANCELLED";

export interface Booking {
    id: string;
    userId: string;
    vehicleId: string;
    startDate: string;
    endDate: string;
    destination: string;
    reason?: string;
    status: BookingStatus;
    createdAt: string;
    updatedAt: string;
}

export interface BookingWithDetails extends Booking {
    vehicle: Vehicle;
    user: Pick<User, "id" | "firstName" | "lastName" | "email">;
}
