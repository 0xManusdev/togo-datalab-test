const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export interface ApiResponse<T> {
    status: "success" | "error";
    data?: T;
    message?: string;
    errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
    status: "success" | "error";
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}

class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;

        const config: RequestInit = {
            ...options,
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                ...options.headers,
            },
        };

        const response = await fetch(url, config);

        if (!response.ok) {
            const error = await response.json().catch(() => ({
                message: "Une erreur est survenue",
            }));
            throw new ApiError(error.message || "Erreur serveur", response.status, error.errors);
        }

        if (response.status === 204) {
            return {} as T;
        }

        return response.json();
    }

    async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
        const queryString = params
            ? "?" + new URLSearchParams(params).toString()
            : "";
        return this.request<T>(`${endpoint}${queryString}`, { method: "GET" });
    }

    async post<T>(endpoint: string, data?: unknown): Promise<T> {
        return this.request<T>(endpoint, {
            method: "POST",
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    async put<T>(endpoint: string, data: unknown): Promise<T> {
        return this.request<T>(endpoint, {
            method: "PUT",
            body: JSON.stringify(data),
        });
    }

    async patch<T>(endpoint: string, data?: unknown): Promise<T> {
        return this.request<T>(endpoint, {
            method: "PATCH",
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    async delete<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: "DELETE" });
    }

    private async requestFormData<T>(
        endpoint: string,
        method: string,
        formData: FormData
    ): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;

        const response = await fetch(url, {
            method,
            credentials: "include",
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({
                message: "Une erreur est survenue",
            }));
            throw new ApiError(error.message || "Erreur serveur", response.status, error.errors);
        }

        if (response.status === 204) {
            return {} as T;
        }

        return response.json();
    }

    async postFormData<T>(endpoint: string, formData: FormData): Promise<T> {
        return this.requestFormData<T>(endpoint, "POST", formData);
    }

    async putFormData<T>(endpoint: string, formData: FormData): Promise<T> {
        return this.requestFormData<T>(endpoint, "PUT", formData);
    }
}

export class ApiError extends Error {
    constructor(
        message: string,
        public statusCode: number,
        public errors?: Record<string, string[]>
    ) {
        super(message);
        this.name = "ApiError";
    }
}

export const api = new ApiClient(API_BASE_URL);
