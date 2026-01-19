"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
	ChevronLeft,
	ChevronRight,
	Calendar as CalendarIcon,
	Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useBookings } from "@/hooks/useBookings";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export default function BookingsCalendarPage() {
	const { user } = useAuth();
	const [currentDate, setCurrentDate] = useState(new Date());
	const { data, isLoading } = useBookings(1, 100);

	const bookings = data?.data || [];
	const isAdmin = user?.role === "ADMIN";

	const year = currentDate.getFullYear();
	const month = currentDate.getMonth();

	const monthNames = [
		"Janvier",
		"Février",
		"Mars",
		"Avril",
		"Mai",
		"Juin",
		"Juillet",
		"Août",
		"Septembre",
		"Octobre",
		"Novembre",
		"Décembre",
	];

	const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

	const calendarDays = useMemo(() => {
		const firstDay = new Date(year, month, 1);
		const lastDay = new Date(year, month + 1, 0);
		const startingDay = firstDay.getDay();
		const totalDays = lastDay.getDate();

		const days: (number | null)[] = [];

		// Add empty slots for days before the first day of the month
		for (let i = 0; i < startingDay; i++) {
			days.push(null);
		}

		// Add the days of the month
		for (let i = 1; i <= totalDays; i++) {
			days.push(i);
		}

		return days;
	}, [year, month]);

	const getBookingsForDay = (day: number) => {
		const date = new Date(year, month, day);
		return bookings.filter((booking) => {
			if (booking.status !== "CONFIRMED") return false;
			const start = new Date(booking.startDate);
			const end = new Date(booking.endDate);
			return date >= new Date(start.setHours(0, 0, 0, 0)) &&
				date <= new Date(end.setHours(23, 59, 59, 999));
		});
	};

	const prevMonth = () => {
		setCurrentDate(new Date(year, month - 1, 1));
	};

	const nextMonth = () => {
		setCurrentDate(new Date(year, month + 1, 1));
	};

	const goToToday = () => {
		setCurrentDate(new Date());
	};

	const today = new Date();
	const isToday = (day: number) =>
		day === today.getDate() &&
		month === today.getMonth() &&
		year === today.getFullYear();

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl font-bold">Calendrier des réservations</h1>
					<p className="text-muted-foreground">
						Visualisez toutes les réservations sur le calendrier
					</p>
				</div>
				<Link href="/bookings/new">
					<Button>
						<Plus className="mr-2 h-4 w-4" />
						Nouvelle réservation
					</Button>
				</Link>
			</div>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
					<div className="flex items-center gap-2">
						<Button variant="outline" size="icon" onClick={prevMonth}>
							<ChevronLeft className="h-4 w-4" />
						</Button>
						<Button variant="outline" size="icon" onClick={nextMonth}>
							<ChevronRight className="h-4 w-4" />
						</Button>
						<CardTitle className="text-lg">
							{monthNames[month]} {year}
						</CardTitle>
					</div>
					<Button variant="outline" size="sm" onClick={goToToday}>
						Aujourd'hui
					</Button>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="grid grid-cols-7 gap-1">
							{Array.from({ length: 35 }).map((_, i) => (
								<Skeleton key={i} className="h-24" />
							))}
						</div>
					) : (
						<>
							{/* Day headers */}
							<div className="mb-2 grid grid-cols-7 gap-1">
								{dayNames.map((day) => (
									<div
										key={day}
										className="py-2 text-center text-sm font-medium text-muted-foreground"
									>
										{day}
									</div>
								))}
							</div>

							{/* Calendar grid */}
							<div className="grid grid-cols-7 gap-1">
								{calendarDays.map((day, index) => {
									if (day === null) {
										return <div key={index} className="h-24" />;
									}

									const dayBookings = getBookingsForDay(day);

									return (
										<div
											key={index}
											className={cn(
												"h-24 overflow-hidden rounded-lg border p-1",
												isToday(day) && "border-primary bg-primary/5"
											)}
										>
											<div
												className={cn(
													"mb-1 text-sm font-medium",
													isToday(day) && "text-primary"
												)}
											>
												{day}
											</div>
											<div className="space-y-0.5">
												{dayBookings.slice(0, 2).map((booking) => (
													<Link
														key={booking.id}
														href={`/bookings/${booking.id}`}
													>
														<div
															className={cn(
																"truncate rounded px-1 py-0.5 text-xs transition-colors",
																booking.userId === user?.id
																	? "bg-primary text-primary-foreground"
																	: "bg-muted text-muted-foreground hover:bg-muted/80"
															)}
															title={`${booking.vehicle.brand} ${booking.vehicle.model}`}
														>
															{booking.vehicle.brand}
														</div>
													</Link>
												))}
												{dayBookings.length > 2 && (
													<div className="text-xs text-muted-foreground">
														+{dayBookings.length - 2} autres
													</div>
												)}
											</div>
										</div>
									);
								})}
							</div>
						</>
					)}
				</CardContent>
			</Card>

			{/* Legend */}
			<div className="flex items-center gap-4 text-sm">
				<div className="flex items-center gap-2">
					<div className="h-3 w-3 rounded bg-primary" />
					<span>Mes réservations</span>
				</div>
				{isAdmin && (
					<div className="flex items-center gap-2">
						<div className="h-3 w-3 rounded bg-muted" />
						<span>Autres réservations</span>
					</div>
				)}
			</div>
		</div>
	);
}
