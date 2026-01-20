"use client"

import * as React from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { CalendarIcon, Clock } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover"

interface DateTimePickerProps {
	date: Date | undefined
	setDate: (date: Date | undefined) => void
	label?: string
	placeholder?: string
	minDate?: Date
	disabled?: boolean
}

export function DateTimePicker({
	date,
	setDate,
	label,
	placeholder = "Sélectionner une date",
	minDate,
	disabled = false,
}: DateTimePickerProps) {
	const [timeValue, setTimeValue] = React.useState<string>("09:00")

	React.useEffect(() => {
		if (date) {
			setTimeValue(format(date, "HH:mm"))
		}
	}, [date])

	const handleDateSelect = (selectedDate: Date | undefined) => {
		if (selectedDate) {
			const [hours, minutes] = timeValue.split(":").map(Number)
			const newDate = new Date(selectedDate)
			newDate.setHours(hours, minutes, 0, 0)
			setDate(newDate)
		} else {
			setDate(undefined)
		}
	}

	const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newTime = e.target.value
		setTimeValue(newTime)
		
		if (date && newTime && newTime.includes(":")) {
			const [hoursStr, minutesStr] = newTime.split(":")
			const hours = parseInt(hoursStr, 10)
			const minutes = parseInt(minutesStr, 10)
			
			if (!isNaN(hours) && !isNaN(minutes) && hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
				const newDate = new Date(date)
				newDate.setHours(hours, minutes, 0, 0)
				setDate(newDate)
			}
		}
	}

	const getMinDateForComparison = React.useCallback(() => {
		if (minDate) {
			const min = new Date(minDate)
			min.setHours(0, 0, 0, 0)
			return min
		}
		const today = new Date()
		today.setHours(0, 0, 0, 0)
		return today
	}, [minDate])

	return (
		<div className="space-y-2">
			{label && <Label>{label}</Label>}
			<Popover>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						disabled={disabled}
						className={cn(
							"w-full justify-start text-left font-normal",
							!date && "text-muted-foreground"
						)}
					>
						<CalendarIcon className="mr-2 h-4 w-4" />
						{date ? (
							format(date, "PPP 'à' HH:mm", { locale: fr })
						) : (
							<span>{placeholder}</span>
						)}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0" align="start">
					<Calendar
						mode="single"
						selected={date}
						onSelect={handleDateSelect}
						disabled={(d) => d < getMinDateForComparison()}
						locale={fr}
					/>
					<div className="border-t p-3">
						<div className="flex items-center gap-2">
							<Clock className="h-4 w-4 text-muted-foreground" />
							<Label htmlFor="time" className="text-sm text-muted-foreground">
								Heure
							</Label>
							<Input
								id="time"
								type="time"
								value={timeValue}
								onChange={handleTimeChange}
								className="w-auto"
							/>
						</div>
					</div>
				</PopoverContent>
			</Popover>
		</div>
	)
}

