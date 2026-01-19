"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api, ApiResponse } from "@/lib/api";
import { User } from "@/types";

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<User>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

interface RegisterData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refreshUser = async () => {
        try {
            const response = await api.get<ApiResponse<User>>("/auth/me");
            if (response.status === "success" && response.data) {
                setUser(response.data);
            }
        } catch {
            setUser(null);
        }
    };

    useEffect(() => {
        refreshUser().finally(() => setIsLoading(false));
    }, []);

    const login = async (email: string, password: string): Promise<User> => {
        const response = await api.post<ApiResponse<{ user: User }>>("/auth/login", {
            email,
            password,
        });
        if (response.status === "success" && response.data) {
            setUser(response.data.user);
            return response.data.user;
        }
        throw new Error("Échec de la connexion");
    };

    const register = async (data: RegisterData) => {
        await api.post<ApiResponse<User>>("/auth/register/user", data);
    };

    const logout = async () => {
        try {
            await api.post("/auth/logout");
        } finally {
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                login,
                register,
                logout,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
