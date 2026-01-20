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

export interface CreateVehicleData extends Omit<CreateVehicleInput, "imageUrl"> {
	image?: File | null;
}

export interface UpdateVehicleData extends Omit<UpdateVehicleInput, "imageUrl"> {
	image?: File | null;
}

export function useCreateVehicle() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateVehicleData) => {
			const formData = new FormData();
			formData.append("brand", data.brand);
			formData.append("model", data.model);
			formData.append("licensePlate", data.licensePlate);
			if (data.image) {
				formData.append("image", data.image);
			}
			return api.postFormData<ApiResponse<Vehicle>>("/vehicles", formData);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["vehicles"] });
		},
	});
}

export function useUpdateVehicle() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateVehicleData }) => {
			const formData = new FormData();
			if (data.brand) formData.append("brand", data.brand);
			if (data.model) formData.append("model", data.model);
			if (data.licensePlate) formData.append("licensePlate", data.licensePlate);
			if (data.isAvailable !== undefined) formData.append("isAvailable", String(data.isAvailable));
			if (data.image) {
				formData.append("image", data.image);
			}
			return api.putFormData<ApiResponse<Vehicle>>(`/vehicles/${id}`, formData);
		},
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
