"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, ApiResponse, PaginatedResponse } from "@/lib/api";
import { Vehicle, VehicleWithBookings } from "@/types";
import { CreateVehicleInput, UpdateVehicleInput } from "@/lib/validations";

export function useVehicles(page = 1, limit = 20) {
  return useQuery({
    queryKey: ["vehicles", page, limit],
    queryFn: () =>
      api.get<PaginatedResponse<Vehicle>>("/vehicles", {
        page: String(page),
        limit: String(limit),
      }),
  });
}

export function useAvailableVehicles(startDate: string, endDate: string, enabled = true) {
  return useQuery({
    queryKey: ["vehicles", "available", startDate, endDate],
    queryFn: () =>
      api.get<ApiResponse<Vehicle[]>>("/vehicles/available", {
        startDate,
        endDate,
      }),
    enabled: enabled && !!startDate && !!endDate,
  });
}

export function useVehicle(id: string) {
  return useQuery({
    queryKey: ["vehicles", id],
    queryFn: () => api.get<ApiResponse<VehicleWithBookings>>(`/vehicles/${id}`),
    enabled: !!id,
  });
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateVehicleInput) =>
      api.post<ApiResponse<Vehicle>>("/vehicles", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateVehicleInput }) =>
      api.put<ApiResponse<Vehicle>>(`/vehicles/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles", variables.id] });
    },
  });
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete(`/vehicles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });
}
