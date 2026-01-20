export const ROUTES = {
    // Auth
    LOGIN: "/login",
    REGISTER: "/register",

    // Dashboard
    DASHBOARD: "/",
    BOOK: "/book",
    BOOKINGS: "/bookings",
    BOOKINGS_CALENDAR: "/bookings/calendar",
    PROFILE: "/profile",

    // Vehicles
    VEHICLES: "/vehicles",
    VEHICLES_NEW: "/vehicles/new",
    VEHICLE_DETAIL: (id: string) => `/vehicles/${id}`,
    VEHICLE_EDIT: (id: string) => `/vehicles/${id}/edit`,

    // Admin
    ADMIN_USERS: "/admin/users",
    ADMIN_SETTINGS: "/admin/settings",
} as const;
