"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, ApiResponse, PaginatedResponse } from "@/lib/api";
import { User } from "@/types";

export interface CreateUserInput {
	email: string;
	password: string;
	firstName: string;
	lastName: string;
	phone?: string;
	role?: "ADMIN" | "EMPLOYEE";
}

export function useUsers(page = 1, limit = 20) {
	return useQuery({
		queryKey: ["users", page, limit],
		queryFn: () =>
			api.get<PaginatedResponse<User>>("/users", {
				page: String(page),
				limit: String(limit),
			}),
	});
}

export function useUser(id: string) {
	return useQuery({
		queryKey: ["users", id],
		queryFn: () => api.get<ApiResponse<User>>(`/users/${id}`),
		enabled: !!id,
	});
}

export function useCreateUser() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateUserInput) =>
			api.post<ApiResponse<User>>("/users", data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
		},
	});
}

export function useDeleteUser() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => api.delete(`/users/${id}`),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
		},
	});
}

export interface UpdateUserInput {
	email?: string;
	firstName?: string;
	lastName?: string;
	phone?: string;
	role?: "ADMIN" | "EMPLOYEE";
}

export function useUpdateUser() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateUserInput }) =>
			api.put<ApiResponse<User>>(`/users/${id}`, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
		},
	});
}

