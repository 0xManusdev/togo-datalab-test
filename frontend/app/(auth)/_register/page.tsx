"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

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
import { registerSchema, RegisterInput } from "@/lib/validations";
import { ApiError } from "@/lib/api";

export default function RegisterPage() {
    const router = useRouter();
    const { register: registerUser } = useAuth();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterInput>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterInput) => {
        try {
            setError(null);
            await registerUser(data);
            setSuccess(true);
            setTimeout(() => {
                router.push("/login");
            }, 2000);
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.message);
            } else {
                setError("Une erreur est survenue");
            }
        }
    };

    if (success) {
        return (
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl text-green-600">
                        Inscription réussie ! ✓
                    </CardTitle>
                    <CardDescription>
                        Vous allez être redirigé vers la page de connexion...
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-md">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl">Créer un compte</CardTitle>
                <CardDescription>
                    Inscrivez-vous pour réserver des véhicules
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                    {error && (
                        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">Prénom</Label>
                            <Input
                                id="firstName"
                                placeholder="Jean"
                                {...register("firstName")}
                            />
                            {errors.firstName && (
                                <p className="text-sm text-destructive">
                                    {errors.firstName.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Nom</Label>
                            <Input
                                id="lastName"
                                placeholder="Dupont"
                                {...register("lastName")}
                            />
                            {errors.lastName && (
                                <p className="text-sm text-destructive">
                                    {errors.lastName.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="jean.dupont@exemple.com"
                            {...register("email")}
                        />
                        {errors.email && (
                            <p className="text-sm text-destructive">{errors.email.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Téléphone</Label>
                        <Input
                            id="phone"
                            placeholder="+22890000000"
                            {...register("phone")}
                        />
                        {errors.phone && (
                            <p className="text-sm text-destructive">{errors.phone.message}</p>
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
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Créer mon compte
                    </Button>
                    <p className="text-center text-sm text-muted-foreground">
                        Déjà un compte ?{" "}
                        <Link href="/login" className="text-primary hover:underline">
                            Se connecter
                        </Link>
                    </p>
                </CardFooter>
            </form>
        </Card>
    );
}
