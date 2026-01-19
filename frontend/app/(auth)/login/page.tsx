"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { loginSchema, LoginInput } from "@/lib/validations";
import { ApiError } from "@/lib/api";

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginInput) => {
        try {
            setError(null);
            const user = await login(data.email, data.password);
            toast.success("Connexion réussie", {
                description: `Bienvenue ${user.firstName} !`,
            });
            if (user.role === "ADMIN") {
                router.push("/");
            } else {
                router.push("/bookings");
            }
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.message);
                toast.error("Échec de la connexion", {
                    description: err.message,
                });
            } else {
                setError("Une erreur est survenue");
                toast.error("Échec de la connexion");
            }
        }
    };

    return (
        <Card className="w-full max-w-md bg-transparent">
            <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bricolage-grotesque font-black">Connexion</CardTitle>
                <CardDescription>
                    Connectez-vous pour accéder à votre espace
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                    {error && (
                        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="koffi.kodjo@gmail.com"
                            {...register("email")}
                        />
                        {errors.email && (
                            <p className="text-sm text-destructive">{errors.email.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Mot de passe</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            {...register("password")}
                        />
                        {errors.password && (
                            <p className="text-sm text-destructive">
                                {errors.password.message}
                            </p>
                        )}
                    </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-4">
                    <Button type="submit" className="w-full rounded-full text-[#FFCE15] cursor-pointer" disabled={isSubmitting}>
                        {isSubmitting
                            ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            : "Se connecter"
                        }
                    </Button>
                    <p className="text-center text-sm text-muted-foreground">
                        Pas encore de compte ?{" "}
                        <Link href="/register" className="text-primary hover:underline">
                            Créer un compte
                        </Link>
                    </p>
                </CardFooter>
            </form>
        </Card>
    );
}
