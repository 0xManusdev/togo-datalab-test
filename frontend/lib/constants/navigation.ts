import {
    LayoutDashboard,
    Car,
    Calendar,
    CalendarDays,
    CalendarPlus,
    Users,
    User,
} from "lucide-react";
import { ROUTES } from "./routes";

export interface NavItem {
    title: string;
    href: string;
    icon: React.ElementType;
}

export const MAIN_NAV_ITEMS: NavItem[] = [
    {
        title: "Réserver",
        href: ROUTES.BOOK,
        icon: CalendarPlus,
    },
    {
        title: "Mes réservations",
        href: ROUTES.BOOKINGS,
        icon: Calendar,
    },
    {
        title: "Calendrier",
        href: ROUTES.BOOKINGS_CALENDAR,
        icon: CalendarDays,
    },
];

export const ADMIN_ONLY_NAV_ITEMS: NavItem[] = [
    {
        title: "Tableau de bord",
        href: ROUTES.DASHBOARD,
        icon: LayoutDashboard,
    },
];

export const ADMIN_NAV_ITEMS: NavItem[] = [
    {
        title: "Véhicules",
        href: ROUTES.VEHICLES,
        icon: Car,
    },
    {
        title: "Utilisateurs",
        href: ROUTES.ADMIN_USERS,
        icon: Users,
    },
];
