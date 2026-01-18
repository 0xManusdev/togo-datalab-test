import { z } from 'zod';

export const paginationSchema = z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional().default(1),
    limit: z.string().regex(/^\d+$/).transform(Number).optional().default(20),
}).transform(data => ({
    page: Math.max(1, data.page ?? 1),
    limit: Math.min(100, Math.max(1, data.limit ?? 20)),
}));

export type PaginationParams = z.infer<typeof paginationSchema>;

export interface PaginatedResponse<T> {
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

export function createPaginatedResponse<T>(
    data: T[],
    total: number,
    page: number,
    limit: number
): PaginatedResponse<T> {
    const totalPages = Math.ceil(total / limit);

    return {
        data,
        pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        },
    };
}
