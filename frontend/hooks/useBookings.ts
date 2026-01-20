"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, ApiResponse, PaginatedResponse } from "@/lib/api";
import { Booking, BookingWithDetails } from "@/types";
import { CreateBookingInput } from "@/lib/validations";

export function useBookings(page = 1, limit = 20) {
  return useQuery({
    queryKey: ["bookings", page, limit],
    queryFn: () =>
      api.get<PaginatedResponse<BookingWithDetails>>("/bookings", {
        page: String(page),
        limit: String(limit),
      }),
  });
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: ["bookings", id],
    queryFn: () => api.get<ApiResponse<BookingWithDetails>>(`/bookings/${id}`),
    enabled: !!id,
  });
}

export function useVehicleBookings(vehicleId: string) {
  return useQuery({
    queryKey: ["bookings", "vehicle", vehicleId],
    queryFn: () =>
      api.get<ApiResponse<Booking[]>>(`/bookings/vehicle/${vehicleId}`),
    enabled: !!vehicleId,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBookingInput) =>
      api.post<ApiResponse<BookingWithDetails>>("/bookings", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });
}

export function useUpdateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<CreateBookingInput>) =>
      api.patch<ApiResponse<BookingWithDetails>>(`/bookings/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["bookings", id] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      api.patch<ApiResponse<BookingWithDetails>>(`/bookings/${id}/cancel`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["bookings", id] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });
}
