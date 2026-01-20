export const ROUTES = {
    
    LOGIN: "/login",
    REGISTER: "/register",

    DASHBOARD: "/",
    BOOK: "/book",
    BOOKINGS: "/bookings",
    BOOKINGS_CALENDAR: "/bookings/calendar",
    PROFILE: "/profile",

    VEHICLES: "/vehicles",
    VEHICLES_NEW: "/vehicles/new",
    VEHICLE_DETAIL: (id: string) => `/vehicles/${id}`,
    VEHICLE_EDIT: (id: string) => `/vehicles/${id}/edit`,

    ADMIN_USERS: "/admin/users",
    ADMIN_SETTINGS: "/admin/settings",
} as const;
